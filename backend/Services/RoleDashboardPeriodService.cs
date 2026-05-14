using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using backend.DTOs.Dashboard;
using backend.Helpers;
using backend.Models;
using backend.Data;

namespace backend.Services;

public sealed class RoleDashboardPeriodService : IRoleDashboardPeriodService
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web)
    {
        WriteIndented = false
    };

    private readonly AppDbContext _context;

    public RoleDashboardPeriodService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<DashboardPeriodResponseDto?> GetDashboardAsync(
        string roleName,
        string periodType,
        string? periodKey,
        bool currentOnly,
        CancellationToken cancellationToken = default)
    {
        var normalizedPeriodType = DashboardPeriodHelper.NormalizePeriodType(periodType);
        var dashboardCode = DashboardPeriodHelper.GetDashboardCode(roleName);

        var query = _context.RoleDashboardPeriodStates
            .AsNoTracking()
            .Where(x => x.RoleName == roleName
                && x.DashboardCode == dashboardCode
                && x.PeriodType == normalizedPeriodType);

        query = currentOnly || string.IsNullOrWhiteSpace(periodKey)
            ? query.Where(x => x.IsCurrent)
            : query.Where(x => x.PeriodKey == periodKey);

        var entity = await query
            .OrderByDescending(x => x.PeriodStart)
            .FirstOrDefaultAsync(cancellationToken);

        return entity == null ? null : ToResponseDto(entity);
    }

    public async Task<IReadOnlyList<DashboardHistoryItemDto>> GetHistoryAsync(
        string roleName,
        string periodType,
        int take,
        CancellationToken cancellationToken = default)
    {
        var normalizedPeriodType = DashboardPeriodHelper.NormalizePeriodType(periodType);
        var dashboardCode = DashboardPeriodHelper.GetDashboardCode(roleName);
        var safeTake = Math.Clamp(take, 1, 36);

        return await _context.RoleDashboardPeriodStates
            .AsNoTracking()
            .Where(x => x.RoleName == roleName
                && x.DashboardCode == dashboardCode
                && x.PeriodType == normalizedPeriodType)
            .OrderByDescending(x => x.PeriodStart)
            .Take(safeTake)
            .Select(x => new DashboardHistoryItemDto
            {
                Id = x.Id,
                RoleName = x.RoleName,
                DashboardCode = x.DashboardCode,
                PeriodType = x.PeriodType,
                PeriodKey = x.PeriodKey,
                PeriodStart = x.PeriodStart,
                PeriodEnd = x.PeriodEnd,
                Status = x.Status,
                IsCurrent = x.IsCurrent,
                UpdatedAt = x.UpdatedAt
            })
            .ToListAsync(cancellationToken);
    }

    public async Task RebuildDashboardAsync(
        string roleName,
        string periodType,
        DateTime occurredAtUtc,
        int? updatedByUserId,
        string eventType,
        int? eventRefId,
        CancellationToken cancellationToken = default)
    {
        var period = DashboardPeriodHelper.Resolve(periodType, occurredAtUtc);
        var role = await _context.Roles.FirstOrDefaultAsync(x => x.Name == roleName, cancellationToken);
        if (role == null)
        {
            return;
        }

        var dashboardCode = DashboardPeriodHelper.GetDashboardCode(role.Name);
        var dashboardTitle = role.Name + " Dashboard";

        var periodMetrics = await BuildMetricsAsync(period.PeriodStart, period.PeriodEnd, cancellationToken);
        var previousMetrics = await BuildMetricsAsync(period.PreviousPeriodStart, period.PreviousPeriodEnd, cancellationToken);

        var dashboardJson = BuildDashboardJson(role.Name, dashboardCode, period, periodMetrics);
        var comparisonJson = BuildComparisonJson(role.Name, period, periodMetrics, previousMetrics);

        var existing = await _context.RoleDashboardPeriodStates.FirstOrDefaultAsync(x =>
            x.RoleId == role.Id
            && x.DashboardCode == dashboardCode
            && x.PeriodType == period.PeriodType
            && x.PeriodKey == period.PeriodKey,
            cancellationToken);

        await ClearCurrentFlagAsync(role.Id, dashboardCode, period.PeriodType, period.IsCurrent, cancellationToken);

        if (existing == null)
        {
            existing = new RoleDashboardPeriodState
            {
                RoleId = role.Id,
                RoleName = role.Name,
                DashboardCode = dashboardCode,
                DashboardTitle = dashboardTitle,
                PeriodType = period.PeriodType,
                PeriodKey = period.PeriodKey,
                CreatedAt = DateTime.UtcNow
            };

            _context.RoleDashboardPeriodStates.Add(existing);
        }

        existing.RoleName = role.Name;
        existing.DashboardTitle = dashboardTitle;
        existing.PeriodStart = period.PeriodStart;
        existing.PeriodEnd = period.PeriodEnd;
        existing.DashboardJson = dashboardJson;
        existing.ComparisonJson = comparisonJson;
        existing.Status = period.IsCurrent ? "OPEN" : "CLOSED";
        existing.IsCurrent = period.IsCurrent;
        existing.LastEventType = eventType;
        existing.LastEventSource = "RoleDashboardPeriodService";
        existing.LastEventRefId = eventRefId;
        existing.Version += existing.Id == 0 ? 0 : 1;
        existing.UpdatedAt = DateTime.UtcNow;
        existing.ClosedAt = period.IsCurrent ? null : existing.ClosedAt ?? DateTime.UtcNow;
        existing.UpdatedBy = updatedByUserId;

        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task RebuildAffectedDashboardsAsync(
        string eventType,
        DateTime occurredAtUtc,
        int? updatedByUserId,
        int? eventRefId,
        CancellationToken cancellationToken = default)
    {
        var affectedRoles = await ResolveAffectedRolesAsync(eventType, cancellationToken);

        foreach (var roleName in affectedRoles)
        {
            foreach (var periodType in DashboardPeriodHelper.DefaultEventPeriods)
            {
                await RebuildDashboardAsync(roleName, periodType, occurredAtUtc, updatedByUserId, eventType, eventRefId, cancellationToken);
            }
        }
    }

    public async Task RebuildAllCurrentDashboardsAsync(int? updatedByUserId, CancellationToken cancellationToken = default)
    {
        var roles = await _context.Roles
            .AsNoTracking()
            .Where(x => x.Name == "Admin"
                || x.Name == "Manager"
                || x.Name == "Receptionist"
                || x.Name == "Accountant"
                || x.Name == "Housekeeping"
                || x.Name == "WarehouseStaff"
                || x.Name == "Warehouse")
            .Select(x => x.Name)
            .ToListAsync(cancellationToken);

        var now = DateTime.UtcNow;
        foreach (var roleName in roles)
        {
            foreach (var periodType in DashboardPeriodHelper.DefaultEventPeriods)
            {
                await RebuildDashboardAsync(roleName, periodType, now, updatedByUserId, "MANUAL_REBUILD", null, cancellationToken);
            }
        }
    }

    private async Task ClearCurrentFlagAsync(int roleId, string dashboardCode, string periodType, bool shouldClear, CancellationToken cancellationToken)
    {
        if (!shouldClear)
        {
            return;
        }

        var currentRows = await _context.RoleDashboardPeriodStates
            .Where(x => x.RoleId == roleId
                && x.DashboardCode == dashboardCode
                && x.PeriodType == periodType
                && x.IsCurrent)
            .ToListAsync(cancellationToken);

        foreach (var row in currentRows)
        {
            row.IsCurrent = false;
            if (row.Status == "OPEN")
            {
                row.Status = "CLOSED";
                row.ClosedAt = DateTime.UtcNow;
            }
        }
    }

    private async Task<IReadOnlyList<string>> ResolveAffectedRolesAsync(string eventType, CancellationToken cancellationToken)
    {
        var normalizedEvent = eventType.Trim().ToUpperInvariant();
        var required = normalizedEvent switch
        {
            "DAMAGE_REPORTED" or "DAMAGE_UPDATED" or "DAMAGE_CANCELLED" => new[] { "WarehouseStaff", "Housekeeping", "Accountant", "Manager", "Admin" },
            "PAYMENT_CREATED" or "INVOICE_CREATED" or "INVOICE_UPDATED" => new[] { "Accountant", "Receptionist", "Manager", "Admin" },
            "BOOKING_CREATED" or "BOOKING_UPDATED" or "BOOKING_STATUS_CHANGED" or "BOOKING_CANCELLED" => new[] { "Receptionist", "Manager", "Admin" },
            "CHECK_IN" or "CHECK_OUT" or "ROOM_ASSIGNED" => new[] { "Receptionist", "Housekeeping", "Manager", "Admin" },
            "ROOM_CLEANING_UPDATED" => new[] { "Housekeeping", "Manager", "Admin" },
            _ => new[] { "Admin", "Manager", "Receptionist", "Accountant", "Housekeeping", "WarehouseStaff" }
        };

        return await _context.Roles
            .AsNoTracking()
            .Where(x => required.Contains(x.Name))
            .Select(x => x.Name)
            .ToListAsync(cancellationToken);
    }

    private async Task<DashboardMetrics> BuildMetricsAsync(DateTime start, DateTime end, CancellationToken cancellationToken)
    {
        var totalUsers = await _context.Users.CountAsync(cancellationToken);
        var activeUsers = await _context.Users.CountAsync(x => x.Status == true, cancellationToken);
        var newCustomers = 0;

        var auditEvents = await _context.AuditLogs
            .Where(x => x.LogDate >= start && x.LogDate <= end)
            .CountAsync(cancellationToken);

        var unreadNotifications = await _context.Notifications
            .Where(x => x.IsRead == false && x.CreatedAt.HasValue && x.CreatedAt.Value >= start && x.CreatedAt.Value <= end)
            .CountAsync(cancellationToken);

        var lockedUsers = await _context.Users.CountAsync(x => x.Status == false, cancellationToken);

        var roleUserCountsRaw = await _context.Roles
            .AsNoTracking()
            .Select(x => new
            {
                RoleId = x.Id,
                RoleName = x.Name,
                UserCount = _context.Users.Count(u => u.RoleId == x.Id)
            })
            .OrderBy(x => x.RoleName)
            .ToListAsync(cancellationToken);

        var roleUserCounts = roleUserCountsRaw
            .Select(x => new RoleUserCount(
                RoleId: x.RoleId,
                RoleName: x.RoleName,
                UserCount: x.UserCount))
            .ToList();

        var bookings = await _context.Bookings
            .Where(x => x.CreatedAt >= start && x.CreatedAt <= end)
            .GroupBy(x => x.Status ?? "Unknown")
            .Select(g => new { Status = g.Key, Total = g.Count() })
            .ToListAsync(cancellationToken);

        var totalBookings = bookings.Sum(x => x.Total);
        var completedBookings = bookings.Where(x => x.Status == "Completed").Sum(x => x.Total);
        var cancelledBookings = bookings.Where(x => x.Status == "Cancelled").Sum(x => x.Total);
        var pendingBookings = bookings.Where(x => x.Status == "Pending").Sum(x => x.Total);
        var confirmedBookings = bookings.Where(x => x.Status == "Confirmed").Sum(x => x.Total);
        var inProgressBookings = bookings.Where(x => x.Status == "In_Progress").Sum(x => x.Total);

        var checkIns = await _context.BookingDetails.CountAsync(x => x.CheckInDate >= start && x.CheckInDate <= end, cancellationToken);
        var checkOuts = await _context.BookingDetails.CountAsync(x => x.CheckOutDate >= start && x.CheckOutDate <= end, cancellationToken);

        var payments = await _context.Payments
            .Where(x => x.PaymentDate.HasValue && x.PaymentDate.Value >= start && x.PaymentDate.Value <= end)
            .ToListAsync(cancellationToken);

        var totalRevenue = payments.Sum(x => (decimal?)x.AmountPaid) ?? 0m;

        var trendsRaw = await _context.Invoices
            .Where(x => x.CreatedAt.HasValue && x.CreatedAt.Value >= start && x.CreatedAt.Value <= end && x.Status != "Cancelled")
            .GroupBy(x => x.CreatedAt.Value.Date)
            .Select(g => new
            {
                Date = g.Key,
                Room = g.Sum(x => x.TotalRoomAmount ?? 0m),
                Discount = g.Sum(x => x.DiscountAmount ?? 0m)
            })
            .ToListAsync(cancellationToken);

        var serviceTrendsRaw = await _context.OrderServices
            .Where(x => x.OrderDate.HasValue && x.OrderDate.Value >= start && x.OrderDate.Value <= end && x.Status != "Cancelled")
            .GroupBy(x => x.OrderDate.Value.Date)
            .Select(g => new
            {
                Date = g.Key,
                Service = g.Sum(x => x.TotalAmount ?? 0m)
            })
            .ToListAsync(cancellationToken);

        var revenueTrends = new List<RevenueTrendItem>();
        var totalDays = (end.Date - start.Date).TotalDays;

        if (totalDays > 32)
        {
            // Group by Month for Yearly/Quarterly views
            var monthlyRaw = await _context.Invoices
                .Where(x => x.CreatedAt.HasValue && x.CreatedAt.Value >= start && x.CreatedAt.Value <= end && x.Status != "Cancelled")
                .GroupBy(x => new { x.CreatedAt.Value.Year, x.CreatedAt.Value.Month })
                .Select(g => new
                {
                    Year = g.Key.Year,
                    Month = g.Key.Month,
                    Room = g.Sum(x => x.TotalRoomAmount ?? 0m),
                    Discount = g.Sum(x => x.DiscountAmount ?? 0m)
                })
                .ToListAsync(cancellationToken);

            var serviceMonthlyRaw = await _context.OrderServices
                .Where(x => x.OrderDate.HasValue && x.OrderDate.Value >= start && x.OrderDate.Value <= end && x.Status != "Cancelled")
                .GroupBy(x => new { x.OrderDate.Value.Year, x.OrderDate.Value.Month })
                .Select(g => new
                {
                    Year = g.Key.Year,
                    Month = g.Key.Month,
                    Service = g.Sum(x => x.TotalAmount ?? 0m)
                })
                .ToListAsync(cancellationToken);

            for (var date = start.Date; date <= end.Date; date = date.AddMonths(1))
            {
                var raw = monthlyRaw.FirstOrDefault(x => x.Year == date.Year && x.Month == date.Month);
                var svcRaw = serviceMonthlyRaw.FirstOrDefault(x => x.Year == date.Year && x.Month == date.Month);
                
                var room = raw?.Room ?? 0m;
                var service = svcRaw?.Service ?? 0m;
                var discount = raw?.Discount ?? 0m;
                var total = room + service - discount;
                
                revenueTrends.Add(new RevenueTrendItem(
                    Date: $"T{date.Month}",
                    Value: total < 0 ? 0 : total,
                    RoomValue: room,
                    ServiceValue: service
                ));
            }
        }
        else
        {
            // Daily grouping
            for (var date = start.Date; date <= end.Date; date = date.AddDays(1))
            {
                var raw = trendsRaw.FirstOrDefault(x => x.Date == date);
                var svcRaw = serviceTrendsRaw.FirstOrDefault(x => x.Date == date);
                
                var room = raw?.Room ?? 0m;
                var service = svcRaw?.Service ?? 0m;
                var discount = raw?.Discount ?? 0m;
                var total = room + service - discount;

                revenueTrends.Add(new RevenueTrendItem(
                    Date: date.ToString("dd/MM"),
                    Value: total < 0 ? 0 : total,
                    RoomValue: room,
                    ServiceValue: service
                ));
            }
        }

        var trueServiceRevenue = await _context.OrderServices
            .Where(x => x.OrderDate.HasValue && x.OrderDate.Value >= start && x.OrderDate.Value <= end && x.Status != "Cancelled")
            .SumAsync(x => x.TotalAmount ?? 0m, cancellationToken);

        var invoiceMetrics = await _context.Invoices
            .Where(x => x.CreatedAt.HasValue && x.CreatedAt.Value >= start && x.CreatedAt.Value <= end)
            .GroupBy(_ => 1)
            .Select(g => new
            {
                RoomRevenue = g.Sum(x => x.Status == "Cancelled" ? 0m : (x.TotalRoomAmount ?? 0m)),
                PendingPaymentAmount = g.Sum(x => x.Status == "Unpaid" ? (x.FinalTotal ?? 0m) : 0m),
                PaidInvoices = g.Count(x => x.Status == "Paid"),
                UnpaidInvoices = g.Count(x => x.Status == "Unpaid")
            })
            .FirstOrDefaultAsync(cancellationToken);

        var invoiceMetricsResult = new
        {
            RoomRevenue = invoiceMetrics?.RoomRevenue ?? 0m,
            ServiceRevenue = trueServiceRevenue,
            PendingPaymentAmount = invoiceMetrics?.PendingPaymentAmount ?? 0m,
            PaidInvoices = invoiceMetrics?.PaidInvoices ?? 0,
            UnpaidInvoices = invoiceMetrics?.UnpaidInvoices ?? 0
        };

        var totalRooms = await _context.Rooms.CountAsync(cancellationToken);
        var availableRooms = await _context.Rooms.CountAsync(x => x.Status == "Available", cancellationToken);
        var occupiedRooms = await _context.Rooms.CountAsync(x => x.Status == "Occupied", cancellationToken);
        var maintenanceRooms = await _context.Rooms.CountAsync(x => x.Status == "Maintenance", cancellationToken);
        var dirtyRooms = await _context.Rooms.CountAsync(x => x.CleaningStatus == "Dirty", cancellationToken);
        var cleaningRooms = await _context.Rooms.CountAsync(x => x.CleaningStatus == "Cleaning", cancellationToken);
        var occupancyRate = totalRooms == 0 ? 0m : Math.Round((decimal)occupiedRooms / totalRooms * 100m, 2);

        var damageMetrics = await _context.LossAndDamages
            .Where(x => x.CreatedAt.HasValue && x.CreatedAt.Value >= start && x.CreatedAt.Value <= end)
            .GroupBy(_ => 1)
            .Select(g => new
            {
                Reports = g.Count(),
                Quantity = g.Sum(x => x.Quantity),
                PenaltyAmount = g.Sum(x => x.PenaltyAmount)
            })
            .FirstOrDefaultAsync(cancellationToken);

        var equipmentMetrics = await _context.Equipments
            .Where(x => x.IsActive)
            .GroupBy(_ => 1)
            .Select(g => new
            {
                TotalEquipmentTypes = g.Count(),
                InStockQuantity = g.Sum(x => x.InStockQuantity ?? 0),
                InUseQuantity = g.Sum(x => x.InUseQuantity),
                CurrentDamagedQuantity = g.Sum(x => x.DamagedQuantity),
                LowStockItems = g.Count(x => (x.InStockQuantity ?? 0) <= 10)
            })
            .FirstOrDefaultAsync(cancellationToken);

        var reviewMetrics = await _context.Reviews
            .Where(x => x.CreatedAt.HasValue && x.CreatedAt.Value >= start && x.CreatedAt.Value <= end)
            .GroupBy(_ => 1)
            .Select(g => new
            {
                NewReviews = g.Count(),
                AverageRating = g.Average(x => (decimal)(x.Rating ?? 0))
            })
            .FirstOrDefaultAsync(cancellationToken);

        var recentAuditLogs = await _context.AuditLogs
            .AsNoTracking()
            .Include(x => x.User)
                .ThenInclude(u => u!.Role)
            .Where(x => x.UserId != null)
            .OrderByDescending(x => x.LogDate)
            .ThenByDescending(x => x.Id)
            .Take(20)
            .ToListAsync(cancellationToken);

        var recentAudits = recentAuditLogs
            .SelectMany(ExtractAuditEvents)
            .OrderByDescending(x => x.Timestamp)
            .Take(10)
            .ToList();

        var totalGuests = 0;

        var topServicesRaw = await _context.OrderServiceDetails
            .Include(x => x.Service)
            .GroupBy(x => x.Service.Name)
            .Select(g => new
            {
                Name = g.Key ?? "Dịch vụ khác",
                Count = g.Sum(x => x.Quantity),
                TotalAmount = g.Sum(x => x.UnitPrice * x.Quantity)
            })
            .OrderByDescending(x => x.Count)
            .Take(5)
            .ToListAsync(cancellationToken);

        var topServices = topServicesRaw
            .Select(x => new TopServiceItem(x.Name, x.Count, x.TotalAmount))
            .ToList();

        var recentBookingsRaw = await _context.Bookings
            .Include(x => x.User)
            .OrderByDescending(x => x.CreatedAt)
            .Take(5)
            .Select(x => new
            {
                Id = x.Id,
                BookingCode = x.BookingCode,
                FullName = x.User != null ? x.User.FullName : "Khách vãng lai",
                Status = x.Status,
                TotalAmount = x.Invoices.Sum(i => i.FinalTotal ?? 0m),
                CreatedAt = x.CreatedAt
            })
            .ToListAsync(cancellationToken);

        var recentBookings = recentBookingsRaw
            .Select(x => new RecentBookingItem(
                x.BookingCode ?? $"BK-{x.Id}",
                x.FullName ?? "Khách vãng lai",
                x.Status ?? "Unknown",
                x.TotalAmount,
                x.CreatedAt
            ))
            .ToList();

        var newStaffAccounts = 0;

        return new DashboardMetrics
        {
            TotalUsers = totalUsers,
            ActiveUsers = activeUsers,
            NewCustomers = newCustomers,
            AuditEvents = auditEvents,
            UnreadNotifications = unreadNotifications,
            LockedUsers = lockedUsers,
            ManagedRoles = roleUserCounts.Count,
            RoleUserCounts = roleUserCounts,
            RecentAudits = recentAudits,
            TotalBookings = totalBookings,
            CompletedBookings = completedBookings,
            CancelledBookings = cancelledBookings,
            PendingBookings = pendingBookings,
            ConfirmedBookings = confirmedBookings,
            InProgressBookings = inProgressBookings,
            CheckIns = checkIns,
            CheckOuts = checkOuts,
            TotalRevenue = totalRevenue,
            RevenueTrends = revenueTrends,
            RoomRevenue = invoiceMetricsResult.RoomRevenue,
            ServiceRevenue = invoiceMetricsResult.ServiceRevenue,
            PendingPaymentAmount = invoiceMetricsResult.PendingPaymentAmount,
            PaidInvoices = invoiceMetricsResult.PaidInvoices,
            UnpaidInvoices = invoiceMetricsResult.UnpaidInvoices,
            TotalRooms = totalRooms,
            AvailableRooms = availableRooms,
            OccupiedRooms = occupiedRooms,
            MaintenanceRooms = maintenanceRooms,
            DirtyRooms = dirtyRooms,
            CleaningRooms = cleaningRooms,
            OccupancyRate = occupancyRate,
            DamageReports = damageMetrics?.Reports ?? 0,
            DamagedQuantityInPeriod = damageMetrics?.Quantity ?? 0,
            PenaltyAmount = damageMetrics?.PenaltyAmount ?? 0m,
            TotalEquipmentTypes = equipmentMetrics?.TotalEquipmentTypes ?? 0,
            InStockQuantity = equipmentMetrics?.InStockQuantity ?? 0,
            InUseQuantity = equipmentMetrics?.InUseQuantity ?? 0,
            CurrentDamagedQuantity = equipmentMetrics?.CurrentDamagedQuantity ?? 0,
            LowStockItems = equipmentMetrics?.LowStockItems ?? 0,
            NewReviews = reviewMetrics?.NewReviews ?? 0,
            AverageRating = Math.Round(reviewMetrics?.AverageRating ?? 0m, 2),
            TotalGuests = totalGuests,
            TopServices = topServices,
            RecentBookings = recentBookings,
            NewStaffAccounts = newStaffAccounts
        };
    }

    private string BuildDashboardJson(string roleName, string dashboardCode, DashboardPeriodInfo period, DashboardMetrics metrics)
    {
        var summary = roleName switch
        {
            "Admin" => (object)new
            {
                system = new
                {
                    totalUsers = metrics.TotalUsers,
                    activeUsers = metrics.ActiveUsers,
                    lockedUsers = metrics.LockedUsers,
                    managedRoles = metrics.ManagedRoles,
                    auditEvents = metrics.AuditEvents,
                    unreadNotifications = metrics.UnreadNotifications,
                    newStaffAccounts = metrics.NewStaffAccounts
                },
                booking = new
                {
                    totalBookings = metrics.TotalBookings,
                    pendingBookings = metrics.PendingBookings,
                    confirmedBookings = metrics.ConfirmedBookings,
                    inProgressBookings = metrics.InProgressBookings,
                    completedBookings = metrics.CompletedBookings,
                    cancelledBookings = metrics.CancelledBookings,
                    checkIns = metrics.CheckIns,
                    checkOuts = metrics.CheckOuts,
                    recentBookings = metrics.RecentBookings
                },
                revenue = new
                {
                    totalRevenue = metrics.TotalRevenue,
                    revenueTrends = metrics.RevenueTrends,
                    roomRevenue = metrics.RoomRevenue,
                    serviceRevenue = metrics.ServiceRevenue,
                    pendingPaymentAmount = metrics.PendingPaymentAmount,
                    paidInvoices = metrics.PaidInvoices,
                    unpaidInvoices = metrics.UnpaidInvoices,
                    topServices = metrics.TopServices
                },
                rooms = new
                {
                    totalRooms = metrics.TotalRooms,
                    availableRooms = metrics.AvailableRooms,
                    occupiedRooms = metrics.OccupiedRooms,
                    maintenanceRooms = metrics.MaintenanceRooms,
                    dirtyRooms = metrics.DirtyRooms,
                    cleaningRooms = metrics.CleaningRooms,
                    occupancyRate = metrics.OccupancyRate
                }
            },
            "Manager" => (object)new
            {
                booking = new
                {
                    totalBookings = metrics.TotalBookings,
                    pendingBookings = metrics.PendingBookings,
                    inProgressBookings = metrics.InProgressBookings,
                    checkIns = metrics.CheckIns,
                    checkOuts = metrics.CheckOuts
                },
                revenue = new
                {
                    totalRevenue = metrics.TotalRevenue,
                    revenueTrends = metrics.RevenueTrends,
                    roomRevenue = metrics.RoomRevenue,
                    serviceRevenue = metrics.ServiceRevenue,
                    pendingPaymentAmount = metrics.PendingPaymentAmount,
                    paidInvoices = metrics.PaidInvoices,
                    unpaidInvoices = metrics.UnpaidInvoices
                },
                rooms = new
                {
                    totalRooms = metrics.TotalRooms,
                    availableRooms = metrics.AvailableRooms,
                    occupiedRooms = metrics.OccupiedRooms,
                    maintenanceRooms = metrics.MaintenanceRooms,
                    dirtyRooms = metrics.DirtyRooms,
                    cleaningRooms = metrics.CleaningRooms,
                    occupancyRate = metrics.OccupancyRate,
                    totalGuests = metrics.TotalGuests
                },
                customer = new
                {
                    newCustomers = metrics.NewCustomers,
                    newReviews = metrics.NewReviews,
                    averageRating = metrics.AverageRating
                }
            },
            "Housekeeping" or "HouseKeeping" => (object)new
            {
                rooms = new
                {
                    totalRooms = metrics.TotalRooms,
                    dirtyRooms = metrics.DirtyRooms,
                    cleaningRooms = metrics.CleaningRooms,
                    availableRooms = metrics.AvailableRooms,
                    maintenanceRooms = metrics.MaintenanceRooms,
                    occupancyRate = metrics.OccupancyRate
                },
                warehouse = new
                {
                    damageReports = metrics.DamageReports,
                    penaltyAmount = metrics.PenaltyAmount,
                    damagedQuantityInPeriod = metrics.DamagedQuantityInPeriod
                }
            },
            "Receptionist" => (object)new
            {
                booking = new
                {
                    pendingBookings = metrics.PendingBookings,
                    confirmedBookings = metrics.ConfirmedBookings,
                    inProgressBookings = metrics.InProgressBookings,
                    checkIns = metrics.CheckIns,
                    checkOuts = metrics.CheckOuts
                },
                revenue = new
                {
                    pendingPaymentAmount = metrics.PendingPaymentAmount,
                    unpaidInvoices = metrics.UnpaidInvoices,
                    paidInvoices = metrics.PaidInvoices,
                    revenueTrends = metrics.RevenueTrends
                },
                rooms = new
                {
                    totalRooms = metrics.TotalRooms,
                    availableRooms = metrics.AvailableRooms,
                    occupiedRooms = metrics.OccupiedRooms
                }
            },
            "WarehouseStaff" or "Warehouse" => (object)new
            {
                warehouse = new
                {
                    totalEquipmentTypes = metrics.TotalEquipmentTypes,
                    inStockQuantity = metrics.InStockQuantity,
                    inUseQuantity = metrics.InUseQuantity,
                    currentDamagedQuantity = metrics.CurrentDamagedQuantity,
                    lowStockItems = metrics.LowStockItems,
                    damageReports = metrics.DamageReports,
                    damagedQuantityInPeriod = metrics.DamagedQuantityInPeriod,
                    penaltyAmount = metrics.PenaltyAmount
                }
            },
            _ => (object)new
            {
                booking = new { totalBookings = metrics.TotalBookings },
                revenue = new { totalRevenue = metrics.TotalRevenue, revenueTrends = metrics.RevenueTrends },
                rooms = new { occupancyRate = metrics.OccupancyRate }
            }
        };

        var payload = new
        {
            meta = new
            {
                schemaVersion = 2,
                dashboardCode = dashboardCode,
                roleName = roleName,
                periodType = period.PeriodType,
                periodKey = period.PeriodKey,
                periodStart = period.PeriodStart,
                periodEnd = period.PeriodEnd,
                status = period.IsCurrent ? "OPEN" : "CLOSED",
                generatedAt = DateTime.UtcNow
            },
            summary = summary,
            kpiCards = BuildKpiCards(roleName, metrics),
            departmentOverview = BuildDepartmentOverview(metrics),
            tables = new
            {
                usersByRole = metrics.RoleUserCounts,
                recentAudits = metrics.RecentAudits
            }
        };

        return JsonSerializer.Serialize(payload, JsonOptions);
    }

    private string BuildComparisonJson(string roleName, DashboardPeriodInfo period, DashboardMetrics current, DashboardMetrics previous)
    {
        var payload = new
        {
            baseInfo = new
            {
                comparisonType = "PREVIOUS_PERIOD",
                currentPeriodKey = period.PeriodKey,
                currentPeriodStart = period.PeriodStart,
                currentPeriodEnd = period.PeriodEnd,
                previousPeriodStart = period.PreviousPeriodStart,
                previousPeriodEnd = period.PreviousPeriodEnd
            },
            metrics = new
            {
                totalRevenue = CompareMetric(current.TotalRevenue, previous.TotalRevenue, "higher_is_better"),
                roomRevenue = CompareMetric(current.RoomRevenue, previous.RoomRevenue, "higher_is_better"),
                serviceRevenue = CompareMetric(current.ServiceRevenue, previous.ServiceRevenue, "higher_is_better"),
                occupancyRate = CompareMetric(current.OccupancyRate, previous.OccupancyRate, "higher_is_better"),
                totalBookings = CompareMetric(current.TotalBookings, previous.TotalBookings, "higher_is_better"),
                pendingBookings = CompareMetric(current.PendingBookings, previous.PendingBookings, "lower_is_better"),
                checkIns = CompareMetric(current.CheckIns, previous.CheckIns, "higher_is_better"),
                checkOuts = CompareMetric(current.CheckOuts, previous.CheckOuts, "higher_is_better"),
                availableRooms = CompareMetric(current.AvailableRooms, previous.AvailableRooms, "higher_is_better"),
                activeUsers = CompareMetric(current.ActiveUsers, previous.ActiveUsers, "higher_is_better"),
                auditEvents = CompareMetric(current.AuditEvents, previous.AuditEvents, "neutral"),
                inStockQuantity = CompareMetric(current.InStockQuantity, previous.InStockQuantity, "higher_is_better"),
                lowStockItems = CompareMetric(current.LowStockItems, previous.LowStockItems, "lower_is_better"),
                damageReports = CompareMetric(current.DamageReports, previous.DamageReports, "lower_is_better"),
                dirtyRooms = CompareMetric(current.DirtyRooms, previous.DirtyRooms, "lower_is_better"),
                cleaningRooms = CompareMetric(current.CleaningRooms, previous.CleaningRooms, "neutral"),
                penaltyAmount = CompareMetric(current.PenaltyAmount, previous.PenaltyAmount, "lower_is_better"),
                paidInvoices = CompareMetric(current.PaidInvoices, previous.PaidInvoices, "higher_is_better"),
                currentDamagedQuantity = CompareMetric(current.CurrentDamagedQuantity, previous.CurrentDamagedQuantity, "lower_is_better"),
                newCustomers = CompareMetric(current.NewCustomers, previous.NewCustomers, "higher_is_better"),
                totalEquipmentTypes = CompareMetric(current.TotalEquipmentTypes, previous.TotalEquipmentTypes, "neutral"),
                pendingPaymentAmount = CompareMetric(current.PendingPaymentAmount, previous.PendingPaymentAmount, "lower_is_better"),
                damagedQuantityInPeriod = CompareMetric(current.DamagedQuantityInPeriod, previous.DamagedQuantityInPeriod, "lower_is_better")
            }
        };

        return JsonSerializer.Serialize(payload, JsonOptions);
    }

    private static object CompareMetric(decimal current, decimal previous, string directionMeaning)
    {
        return new
        {
            current,
            previous,
            difference = current - previous,
            growthRate = DashboardPeriodHelper.CalculateGrowthRate(current, previous),
            trend = DashboardPeriodHelper.ResolveTrend(current, previous),
            directionMeaning
        };
    }

    private static object CompareMetric(int current, int previous, string directionMeaning)
    {
        return CompareMetric((decimal)current, previous, directionMeaning);
    }

    private static IReadOnlyList<object> BuildKpiCards(string roleName, DashboardMetrics metrics)
    {
        return roleName switch
        {
            "Admin" => new object[]
            {
                new { code = "totalRevenue", title = "Tổng doanh thu", value = metrics.TotalRevenue, unit = "VND" },
                new { code = "totalBookings", title = "Tổng Booking", value = metrics.TotalBookings, unit = "booking" },
                new { code = "occupancyRate", title = "Tỷ lệ lấp đầy", value = metrics.OccupancyRate, unit = "%" },
                new { code = "activeUsers", title = "Đang lưu trú", value = metrics.InProgressBookings, unit = "booking" }
            },
            "Manager" => new object[]
            {
                new { code = "totalRevenue", title = "Doanh thu", value = metrics.TotalRevenue, unit = "VND" },
                new { code = "checkIns", title = "Check-in hôm nay", value = metrics.CheckIns, unit = "lượt" },
                new { code = "checkOuts", title = "Check-out hôm nay", value = metrics.CheckOuts, unit = "lượt" },
                new { code = "occupancyRate", title = "Tỷ lệ lấp đầy", value = metrics.OccupancyRate, unit = "%" }
            },
            "Housekeeping" or "HouseKeeping" => new object[]
            {
                new { code = "dirtyRooms", title = "Phòng cần dọn", value = metrics.DirtyRooms, unit = "phòng" },
                new { code = "cleaningRooms", title = "Phòng đang dọn", value = metrics.CleaningRooms, unit = "phòng" },
                new { code = "availableRooms", title = "Phòng hoàn tất", value = metrics.AvailableRooms, unit = "phòng" },
                new { code = "maintenanceRooms", title = "Phòng bảo trì", value = metrics.MaintenanceRooms, unit = "phòng" }
            },
            "Receptionist" => new object[]
            {
                new { code = "pendingBookings", title = "Booking chờ duyệt", value = metrics.PendingBookings, unit = "đặt phòng" },
                new { code = "checkIns", title = "Khách sắp Check-in", value = metrics.CheckIns, unit = "lượt" },
                new { code = "checkOuts", title = "Khách sắp Check-out", value = metrics.CheckOuts, unit = "lượt" },
                new { code = "availableRooms", title = "Phòng trống hiện tại", value = metrics.AvailableRooms, unit = "phòng" }
            },
            "WarehouseStaff" or "Warehouse" => new object[]
            {
                new { code = "inStockQuantity", title = "Tổng sản phẩm trong kho", value = metrics.InStockQuantity, unit = "món" },
                new { code = "lowStockItems", title = "Hàng sắp hết (<10)", value = metrics.LowStockItems, unit = "loại" },
                new { code = "currentDamagedQuantity", title = "Hàng hư hỏng", value = metrics.CurrentDamagedQuantity, unit = "món" },
                new { code = "damageReports", title = "Phiếu nhập/xuất", value = metrics.DamageReports, unit = "phiếu" }
            },
            "Accountant" => new object[]
            {
                new { code = "totalRevenue", title = "Doanh thu", value = metrics.TotalRevenue, unit = "VND" },
                new { code = "pendingPaymentAmount", title = "Chưa thanh toán", value = metrics.PendingPaymentAmount, unit = "VND" },
                new { code = "paidInvoices", title = "Hóa đơn đã trả", value = metrics.PaidInvoices, unit = "invoice" }
            },
            _ => new object[]
            {
                new { code = "totalBookings", title = "Tổng đặt phòng", value = metrics.TotalBookings, unit = "booking" },
                new { code = "totalRevenue", title = "Doanh thu", value = metrics.TotalRevenue, unit = "VND" },
                new { code = "occupancyRate", title = "Tỷ lệ lấp đầy", value = metrics.OccupancyRate, unit = "%" }
            }
        };
    }

    private static IReadOnlyList<object> BuildDepartmentOverview(DashboardMetrics metrics)
    {
        return new object[]
        {
            new { department = "Reception", status = metrics.PendingBookings > 0 ? "warning" : "normal", value = metrics.PendingBookings, metric = "pendingBookings" },
            new { department = "Accountant", status = metrics.PendingPaymentAmount > 0 ? "warning" : "normal", value = metrics.PendingPaymentAmount, metric = "pendingPaymentAmount" },
            new { department = "Warehouse", status = metrics.LowStockItems > 0 ? "warning" : "normal", value = metrics.LowStockItems, metric = "lowStockItems" },
            new { department = "Housekeeping", status = metrics.DirtyRooms > 0 ? "warning" : "normal", value = metrics.DirtyRooms, metric = "dirtyRooms" }
        };
    }

    private static IEnumerable<RecentAuditItem> ExtractAuditEvents(AuditLog log)
    {
        if (string.IsNullOrWhiteSpace(log.LogData))
        {
            yield break;
        }

        using var document = JsonDocument.Parse(log.LogData);
        if (!TryGetProperty(document.RootElement, "Events", "events", out var events) || events.ValueKind != JsonValueKind.Array)
        {
            yield break;
        }

        foreach (var item in events.EnumerateArray())
        {
            var entityType = GetString(item, "EntityType") ?? GetString(item, "entityType");
            if (entityType == "RoleDashboardPeriodState") continue;

            var timestamp = GetDateTime(item, "Timestamp") ?? GetDateTime(item, "timestamp") ?? log.LogDate;

            yield return new RecentAuditItem(
                UserId: log.UserId ?? 0,
                UserName: log.User?.FullName ?? log.User?.Email ?? "Hệ thống",
                RoleName: log.User?.Role?.Name ?? "Hệ thống",
                Action: GetString(item, "ActionType") ?? GetString(item, "actionType") ?? GetString(item, "Action") ?? GetString(item, "action") ?? "UNKNOWN",
                EntityType: entityType,
                Message: GetString(item, "Message") ?? GetString(item, "message"),
                Timestamp: timestamp);
        }
    }

    private static bool TryGetProperty(JsonElement element, string firstName, string secondName, out JsonElement value)
    {
        return element.TryGetProperty(firstName, out value) || element.TryGetProperty(secondName, out value);
    }

    private static string? GetString(JsonElement element, string propertyName)
    {
        return element.TryGetProperty(propertyName, out var value) && value.ValueKind == JsonValueKind.String
            ? value.GetString()
            : null;
    }

    private static DateTime? GetDateTime(JsonElement element, string propertyName)
    {
        return element.TryGetProperty(propertyName, out var value)
            && value.ValueKind == JsonValueKind.String
            && value.TryGetDateTime(out var result)
                ? result
                : null;
    }

    private static DashboardPeriodResponseDto ToResponseDto(RoleDashboardPeriodState entity)
    {
        return new DashboardPeriodResponseDto
        {
            Id = entity.Id,
            RoleId = entity.RoleId,
            RoleName = entity.RoleName,
            DashboardCode = entity.DashboardCode,
            DashboardTitle = entity.DashboardTitle,
            PeriodType = entity.PeriodType,
            PeriodKey = entity.PeriodKey,
            PeriodStart = entity.PeriodStart,
            PeriodEnd = entity.PeriodEnd,
            Status = entity.Status,
            IsCurrent = entity.IsCurrent,
            Version = entity.Version,
            UpdatedAt = entity.UpdatedAt,
            Dashboard = DeserializeJson(entity.DashboardJson),
            Comparison = string.IsNullOrWhiteSpace(entity.ComparisonJson) ? null : DeserializeJson(entity.ComparisonJson)
        };
    }

    private static JsonElement? DeserializeJson(string json)
    {
        if (string.IsNullOrWhiteSpace(json))
        {
            return null;
        }

        using var document = JsonDocument.Parse(json);
        return document.RootElement.Clone();
    }

    private sealed class DashboardMetrics
    {
        public int TotalUsers { get; init; }
        public int ActiveUsers { get; init; }
        public int NewCustomers { get; init; }
        public int AuditEvents { get; init; }
        public int UnreadNotifications { get; init; }
        public int LockedUsers { get; init; }
        public int ManagedRoles { get; init; }
        public IReadOnlyList<RoleUserCount> RoleUserCounts { get; init; } = Array.Empty<RoleUserCount>();
        public IReadOnlyList<RecentAuditItem> RecentAudits { get; init; } = Array.Empty<RecentAuditItem>();
        public int TotalBookings { get; init; }
        public int CompletedBookings { get; init; }
        public int CancelledBookings { get; init; }
        public int PendingBookings { get; init; }
        public int ConfirmedBookings { get; init; }
        public int InProgressBookings { get; init; }
        public int CheckIns { get; init; }
        public int CheckOuts { get; init; }
        public decimal TotalRevenue { get; init; }
        public IReadOnlyList<RevenueTrendItem> RevenueTrends { get; init; } = Array.Empty<RevenueTrendItem>();
        public decimal RoomRevenue { get; init; }
        public decimal ServiceRevenue { get; init; }
        public decimal PendingPaymentAmount { get; init; }
        public int PaidInvoices { get; init; }
        public int UnpaidInvoices { get; init; }
        public int TotalRooms { get; init; }
        public int AvailableRooms { get; init; }
        public int OccupiedRooms { get; init; }
        public int MaintenanceRooms { get; init; }
        public int DirtyRooms { get; init; }
        public int CleaningRooms { get; init; }
        public decimal OccupancyRate { get; init; }
        public int DamageReports { get; init; }
        public int DamagedQuantityInPeriod { get; init; }
        public decimal PenaltyAmount { get; init; }
        public int TotalEquipmentTypes { get; init; }
        public int InStockQuantity { get; init; }
        public int InUseQuantity { get; init; }
        public int CurrentDamagedQuantity { get; init; }
        public int LowStockItems { get; init; }
        public int NewReviews { get; init; }
        public decimal AverageRating { get; init; }
        public int TotalGuests { get; init; }
        public IReadOnlyList<TopServiceItem> TopServices { get; init; } = Array.Empty<TopServiceItem>();
        public IReadOnlyList<RecentBookingItem> RecentBookings { get; init; } = Array.Empty<RecentBookingItem>();
        public int NewStaffAccounts { get; init; }
    }

    private sealed record RoleUserCount(
        int RoleId,
        string RoleName,
        int UserCount);

    private sealed record RecentAuditItem(
        int UserId,
        string UserName,
        string RoleName,
        string Action,
        string? EntityType,
        string? Message,
        DateTime Timestamp);

    private sealed record RevenueTrendItem(
        string Date,
        decimal Value,
        decimal RoomValue = 0,
        decimal ServiceValue = 0);

    public record TopServiceItem(string Name, int Count, decimal TotalAmount);
    public record RecentBookingItem(string Code, string CustomerName, string Status, decimal Amount, DateTime CreatedAt);
}
