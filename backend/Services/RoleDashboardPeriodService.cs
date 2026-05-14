using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using backend.DTOs.Dashboard;
using backend.Helpers;
using backend.Models;
using backend.Data;
using backend.Common;

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

        var periodMetrics = await BuildMetricsAsync(periodType, period.PeriodStart, period.PeriodEnd, cancellationToken);
        var previousMetrics = await BuildMetricsAsync(periodType, period.PreviousPeriodStart, period.PreviousPeriodEnd, cancellationToken);

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

    private async Task<DashboardMetrics> BuildMetricsAsync(string periodType, DateTime start, DateTime end, CancellationToken cancellationToken)
    {
        var totalUsers = await _context.Users.CountAsync(cancellationToken);
        var activeUsers = await _context.Users.CountAsync(x => x.Status == true, cancellationToken);
        var userRoleCount = await _context.Users.CountAsync(u => u.Role != null && u.Role.Name == "User", cancellationToken);
        var guestRoleCount = await _context.Users.CountAsync(u => u.Role != null && u.Role.Name == "Guest", cancellationToken);
        var totalGuests = await _context.Guests.CountAsync(cancellationToken);
        var staffCount = totalUsers - userRoleCount - guestRoleCount;
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
        var inProgressBookings = await _context.Bookings.CountAsync(x => x.Status == "In_Progress" || x.Status == "CheckedIn", cancellationToken);

        var checkIns = await _context.BookingDetails
            .Where(x => x.CheckInDate >= start && x.CheckInDate <= end && x.Booking!.Status != "Cancelled")
            .Select(x => x.BookingId)
            .Distinct()
            .CountAsync(cancellationToken);

        var checkOuts = await _context.BookingDetails
            .Where(x => x.CheckOutDate >= start && x.CheckOutDate <= end && x.Booking!.Status != "Cancelled")
            .Select(x => x.BookingId)
            .Distinct()
            .CountAsync(cancellationToken);

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

        var checkInTrendsRaw = await _context.BookingDetails
            .Where(x => x.CheckInDate >= start && x.CheckInDate <= end && x.Booking!.Status != "Cancelled")
            .GroupBy(x => x.CheckInDate.Date)
            .Select(g => new { Date = g.Key, Count = g.Select(bd => bd.BookingId).Distinct().Count() })
            .ToListAsync(cancellationToken);

        var checkOutTrendsRaw = await _context.BookingDetails
            .Where(x => x.CheckOutDate >= start && x.CheckOutDate <= end && x.Booking!.Status != "Cancelled")
            .GroupBy(x => x.CheckOutDate.Date)
            .Select(g => new { Date = g.Key, Count = g.Select(bd => bd.BookingId).Distinct().Count() })
            .ToListAsync(cancellationToken);

        var allActiveBookings = await _context.BookingDetails
            .Include(x => x.Booking)
                .ThenInclude(b => b!.User)
            .Include(x => x.Room)
            .Where(x => x.Booking!.Status != "Cancelled" &&
                        ((x.CheckInDate >= start && x.CheckInDate <= end) ||
                         (x.CheckOutDate >= start && x.CheckOutDate <= end) ||
                         (x.CheckInDate <= start && x.CheckOutDate >= end)))
            .Select(x => new 
            { 
                x.BookingId, 
                x.CheckInDate, 
                x.CheckOutDate,
                GuestName = x.Booking!.User!.FullName ?? x.Booking!.Guest!.Name ?? "Khách vãng lai",
                RoomNumber = x.Room!.RoomNumber ?? "—",
                BookingStatus = x.Booking.Status
            })
            .Distinct()
            .ToListAsync(cancellationToken);

        var revenueTrends = new List<RevenueTrendItem>();
        List<RevenueTrendItem>? monthlyTrendsResult = null;
        var totalDays = (end.Date - start.Date).TotalDays;

        if (totalDays > 32)
        {
            // Group by Month for Yearly/Quarterly views
            var monthlyRaw = await _context.Invoices
                .Where(x => x.CreatedAt >= start && x.CreatedAt <= end && x.Status != "Cancelled")
                .GroupBy(x => new { x.CreatedAt!.Value.Year, x.CreatedAt.Value.Month })
                .Select(g => new
                {
                    Year = g.Key.Year,
                    Month = g.Key.Month,
                    Room = g.Sum(x => x.TotalRoomAmount ?? 0m),
                    Discount = g.Sum(x => x.DiscountAmount ?? 0m)
                })
                .ToListAsync(cancellationToken);

            var serviceMonthlyRaw = await _context.OrderServices
                .Where(x => x.OrderDate >= start && x.OrderDate <= end && x.Status != "Cancelled")
                .GroupBy(x => new { x.OrderDate!.Value.Year, x.OrderDate.Value.Month })
                .Select(g => new
                {
                    Year = g.Key.Year,
                    Month = g.Key.Month,
                    Service = g.Sum(x => x.TotalAmount ?? 0m)
                })
                .ToListAsync(cancellationToken);

            var monthlyTrends = new List<RevenueTrendItem>();
            for (var date = start.Date; date <= end.Date; date = date.AddMonths(1))
            {
                var raw = monthlyRaw.FirstOrDefault(x => x.Year == date.Year && x.Month == date.Month);
                var svcRaw = serviceMonthlyRaw.FirstOrDefault(x => x.Year == date.Year && x.Month == date.Month);
                
                var room = raw?.Room ?? 0m;
                var service = svcRaw?.Service ?? 0m;
                var discount = raw?.Discount ?? 0m;
                var total = room + service - discount;
                
                var cinCount = allActiveBookings.Count(x => x.CheckInDate.Year == date.Year && x.CheckInDate.Month == date.Month);
                var coutCount = allActiveBookings.Count(x => x.CheckOutDate.Year == date.Year && x.CheckOutDate.Month == date.Month);
                var occCount = allActiveBookings.Count(x => x.CheckInDate <= date && x.CheckOutDate >= date.AddMonths(1).AddDays(-1));

                var dayBookings = new List<BookingPreview>();
                foreach(var b in allActiveBookings.Where(x => x.CheckInDate.Year == date.Year && x.CheckInDate.Month == date.Month))
                    dayBookings.Add(new BookingPreview(b.GuestName, b.RoomNumber, b.BookingStatus!, "CHECK_IN", b.CheckInDate.ToString("HH:mm")));
                
                monthlyTrends.Add(new RevenueTrendItem(
                    Date: $"T{date.Month}",
                    Value: total < 0 ? 0 : total,
                    RoomValue: room,
                    ServiceValue: service,
                    CheckInCount: cinCount,
                    CheckOutCount: coutCount,
                    OccupiedCount: occCount,
                    Bookings: dayBookings
                ));
            }

            if (periodType == "YEARLY")
            {
                // Group into 4 Quarters
                for (int q = 1; q <= 4; q++)
                {
                    var qMonths = monthlyTrends.Where(x => {
                        int month = int.Parse(x.Date.Substring(1));
                        return ((month - 1) / 3) + 1 == q;
                    }).ToList();

                    revenueTrends.Add(new RevenueTrendItem(
                        Date: $"Q{q}",
                        Value: qMonths.Sum(x => x.Value),
                        RoomValue: qMonths.Sum(x => x.RoomValue),
                        ServiceValue: qMonths.Sum(x => x.ServiceValue),
                        CheckInCount: qMonths.Sum(x => x.CheckInCount),
                        CheckOutCount: qMonths.Sum(x => x.CheckOutCount),
                        OccupiedCount: qMonths.Count > 0 ? (int)qMonths.Average(x => x.OccupiedCount) : 0,
                        Bookings: qMonths.SelectMany(m => m.Bookings).ToList()
                    ));
                }
                // Store monthly trends for YEARLY view
                monthlyTrendsResult = monthlyTrends;
            }
            else
            {
                revenueTrends = monthlyTrends;
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

                var cinCount = allActiveBookings.Count(x => x.CheckInDate.Date == date.Date);
                var coutCount = allActiveBookings.Count(x => x.CheckOutDate.Date == date.Date);
                var occCount = allActiveBookings.Count(x => x.CheckInDate.Date <= date.Date && x.CheckOutDate.Date >= date.Date);

                var dayBookings = new List<BookingPreview>();
                foreach(var b in allActiveBookings.Where(x => x.CheckInDate.Date == date.Date))
                    dayBookings.Add(new BookingPreview(b.GuestName, b.RoomNumber, b.BookingStatus!, "CHECK_IN", b.CheckInDate.ToString("HH:mm")));
                foreach(var b in allActiveBookings.Where(x => x.CheckOutDate.Date == date.Date))
                    dayBookings.Add(new BookingPreview(b.GuestName, b.RoomNumber, b.BookingStatus!, "CHECK_OUT", b.CheckOutDate.ToString("HH:mm")));
                foreach(var b in allActiveBookings.Where(x => x.CheckInDate.Date < date.Date && x.CheckOutDate.Date > date.Date))
                    dayBookings.Add(new BookingPreview(b.GuestName, b.RoomNumber, b.BookingStatus!, "STAYING", ""));

                revenueTrends.Add(new RevenueTrendItem(
                    Date: date.ToString("dd/MM"),
                    Value: total < 0 ? 0 : total,
                    RoomValue: room,
                    ServiceValue: service,
                    CheckInCount: cinCount,
                    CheckOutCount: coutCount,
                    OccupiedCount: occCount,
                    Bookings: dayBookings
                ));
            }
        }

        var trueServiceRevenue = await _context.OrderServices
            .Where(x => x.OrderDate >= start && x.OrderDate <= end && x.Status != "Cancelled")
            .SumAsync(x => x.TotalAmount ?? 0m, cancellationToken);

        var invoiceMetrics = await _context.Invoices
            .Where(x => x.CreatedAt >= start && x.CreatedAt <= end)
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
        var availableRooms = await _context.Rooms.CountAsync(x => x.Status == RoomStatuses.Available, cancellationToken);
        var occupiedRooms = await _context.Rooms.CountAsync(x => x.Status == RoomStatuses.Occupied, cancellationToken);
        var maintenanceRooms = await _context.Rooms.CountAsync(x => x.Status == RoomStatuses.Maintenance, cancellationToken);
        var outOfOrderRooms = await _context.Rooms.CountAsync(x => x.Status == RoomStatuses.OutOfOrder, cancellationToken);
        var dirtyRooms = await _context.Rooms.CountAsync(x => x.CleaningStatus == "Dirty" || x.CleaningStatus == "dirty", cancellationToken);
        var cleaningRooms = await _context.Rooms.CountAsync(x => x.CleaningStatus == "InProgress" || x.CleaningStatus == "inprogress" || x.CleaningStatus == "Cleaning" || x.CleaningStatus == "cleaning" || x.Status == "Cleaning" || x.Status == "cleaning", cancellationToken);
        var cleanRooms = await _context.Rooms.CountAsync(x => x.CleaningStatus == "Clean" || x.CleaningStatus == "clean" || x.CleaningStatus == "Inspected" || x.CleaningStatus == "inspected" || x.CleaningStatus == null || x.CleaningStatus == "", cancellationToken);
        var pickupRooms = await _context.Rooms.CountAsync(x => x.CleaningStatus == "Pickup" || x.CleaningStatus == "pickup", cancellationToken);
        var occupancyRate = totalRooms == 0 ? 0m : Math.Round((decimal)occupiedRooms / totalRooms * 100m, 2);

        var damageMetrics = await _context.LossAndDamages
            // Bỏ lọc period cho warehouse metrics chính để khớp với trang vật tư
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
                // Tính toán trực tiếp để tránh lệch do chưa cập nhật cột InStockQuantity
                InStockQuantity = g.Sum(x => x.TotalQuantity - x.InUseQuantity - x.DamagedQuantity),
                InUseQuantity = g.Sum(x => x.InUseQuantity),
                CurrentDamagedQuantity = g.Sum(x => x.DamagedQuantity),
                LiquidatedQuantity = g.Sum(x => x.LiquidatedQuantity),
                LowStockItems = g.Count(x => (x.TotalQuantity - x.InUseQuantity - x.DamagedQuantity) < 30)
            })
            .FirstOrDefaultAsync(cancellationToken);

        var lowStockItemsListRaw = await _context.Equipments
            .AsNoTracking()
            .Where(x => x.IsActive && (x.TotalQuantity - x.InUseQuantity - x.DamagedQuantity) < 30)
            .Select(x => new { x.Name, Quantity = x.TotalQuantity - x.InUseQuantity - x.DamagedQuantity })
            .OrderBy(x => x.Quantity)
            .ToListAsync(cancellationToken);

        var recentDamageReportsRaw = await _context.LossAndDamages
            .AsNoTracking()
            .Include(x => x.RoomInventory)
                .ThenInclude(ri => ri!.Equipment)
            .Include(x => x.RoomInventory)
                .ThenInclude(ri => ri!.Room)
            // Bỏ lọc theo period để danh sách không bị trống khi mới sang kỳ mới
            .OrderByDescending(x => x.CreatedAt)
            .Take(10)
            .Select(x => new
            {
                ItemName = x.RoomInventory!.Equipment!.Name,
                RoomNumber = x.RoomInventory!.Room!.RoomNumber,
                x.Quantity,
                x.PenaltyAmount,
                x.Description,
                Time = x.CreatedAt ?? DateTime.UtcNow
            })
            .ToListAsync(cancellationToken);

        var reviewMetrics = await _context.Reviews
            .Where(x => x.CreatedAt >= start && x.CreatedAt <= end)
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

        var recentAudits = ExtractAuditEvents(recentAuditLogs, start, end, true)
            .OrderByDescending(x => x.Timestamp)
            .Take(10)
            .ToList();

        var recentEquipmentAuditLogs = await _context.EquipmentHistories
            .AsNoTracking()
            .Include(x => x.CreatedBy)
                .ThenInclude(u => u!.Role)
            .Include(x => x.Equipment)
            .OrderByDescending(x => x.CreatedAt)
            .Take(10)
            .ToListAsync(cancellationToken);

        var recentEquipmentAudits = recentEquipmentAuditLogs.Select(x => new RecentAuditItem(
            UserId: x.CreatedById ?? 0,
            UserName: x.CreatedBy?.FullName ?? x.CreatedBy?.Email ?? "Hệ thống",
            RoleName: x.CreatedBy?.Role?.Name ?? "Hệ thống",
            Action: x.ActionType,
            EntityType: "Equipment",
            Message: $"{x.Note}: {x.Equipment?.Name} ({x.QuantityChanged} món, từ {x.PreviousQuantity} lên {x.NewQuantity})",
            Timestamp: x.CreatedAt
        )).ToList();

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
            .Include(x => x.Guest)
            .OrderByDescending(x => x.CreatedAt)
            .Take(5)
            .Select(x => new
            {
                Id = x.Id,
                BookingCode = x.BookingCode,
                FullName = x.User != null ? x.User.FullName : (x.Guest != null ? x.Guest.Name : "Khách vãng lai"),
                Status = x.Status,
                TotalAmount = x.Invoices.Any(i => (i.FinalTotal ?? 0m) > 0) 
                    ? x.Invoices.Sum(i => i.FinalTotal ?? 0m) 
                    : x.BookingDetails.Sum(bd => bd.PricePerNight),
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

        // --- Receptionist Real-time Action Lists ---
        var today = DateTime.UtcNow.Date;
        var tomorrow = today.AddDays(1);

        var upcomingCheckInsRaw = await _context.BookingDetails
            .Include(x => x.Booking)
                .ThenInclude(b => b!.User)
            .Include(x => x.Booking)
                .ThenInclude(b => b!.Guest)
            .Include(x => x.Booking)
                .ThenInclude(b => b!.Invoices)
            .Include(x => x.Room)
                .ThenInclude(r => r!.RoomType)
            .Where(x => x.CheckInDate >= today && x.CheckInDate <= tomorrow 
                && (x.Booking!.Status == "Confirmed" || x.Booking.Status == "Pending"))
            .OrderBy(x => x.CheckInDate)
            .Take(10)
            .Select(x => new
            {
                Id = x.Id.ToString(),
                Title = x.Booking!.User!.FullName ?? x.Booking!.Guest!.Name ?? "Khách vãng lai",
                Subtitle = $"Phòng {x.Room!.RoomNumber} - {x.Room.RoomType!.Name}",
                Status = x.Booking.Status!,
                Time = x.CheckInDate,
                RefCode = x.Booking.BookingCode,
                PaymentStatus = x.Booking.Invoices.Any(i => i.Status == "Paid") ? "Đã thanh toán" : "Chưa thanh toán"
            })
            .ToListAsync(cancellationToken);

        var upcomingCheckOutsRaw = await _context.BookingDetails
            .Include(x => x.Booking)
                .ThenInclude(b => b!.User)
            .Include(x => x.Booking)
                .ThenInclude(b => b!.Guest)
            .Include(x => x.Booking)
                .ThenInclude(b => b!.Invoices)
            .Include(x => x.Room)
            .Where(x => x.CheckOutDate >= today && x.CheckOutDate <= tomorrow 
                && x.Booking!.Status == "In_Progress")
            .OrderBy(x => x.CheckOutDate)
            .Take(10)
            .Select(x => new
            {
                Id = x.Id.ToString(),
                Title = x.Booking!.User!.FullName ?? x.Booking!.Guest!.Name ?? "Khách vãng lai",
                Subtitle = $"Phòng {x.Room!.RoomNumber}",
                Status = "Đang ở",
                Time = x.CheckOutDate,
                RefCode = x.Booking.BookingCode,
                TotalBill = x.Booking.Invoices.Any(i => (i.FinalTotal ?? 0m) > 0)
                    ? x.Booking.Invoices.Sum(i => i.FinalTotal ?? 0m)
                    : x.PricePerNight
            })
            .ToListAsync(cancellationToken);

        var todayBookingsRaw = await _context.Bookings
            .Include(x => x.User)
            .Include(x => x.Guest)
            .Include(x => x.BookingDetails)
                .ThenInclude(bd => bd.Room)
            .Where(x => x.CreatedAt >= today)
            .OrderByDescending(x => x.CreatedAt)
            .Take(10)
            .Select(x => new
            {
                Id = x.Id.ToString(),
                Title = x.User!.FullName ?? x.Guest!.Name ?? "Khách vãng lai",
                Subtitle = string.Join(", ", x.BookingDetails.Select(bd => bd.Room != null ? "Phòng " + bd.Room.RoomNumber : "Chưa gán")),
                Status = x.Status!,
                Time = x.CreatedAt,
                RefCode = x.BookingCode
            })
            .ToListAsync(cancellationToken);

        var pendingServicesRaw = await _context.OrderServices
            .Include(x => x.BookingDetail)
                .ThenInclude(bd => bd!.Booking)
                    .ThenInclude(b => b!.User)
            .Include(x => x.BookingDetail)
                .ThenInclude(bd => bd!.Booking)
                    .ThenInclude(b => b!.Guest)
            .Include(x => x.BookingDetail)
                .ThenInclude(bd => bd!.Room)
            .Where(x => x.Status == "Unpaid")
            .OrderByDescending(x => x.OrderDate)
            .Take(10)
            .Select(x => new
            {
                Id = x.Id.ToString(),
                Title = $"Yêu cầu từ Phòng {x.BookingDetail!.Room!.RoomNumber}",
                Subtitle = x.BookingDetail!.Booking!.User!.FullName ?? x.BookingDetail!.Booking!.Guest!.Name ?? "Khách vãng lai",
                Status = "Chờ xử lý",
                Time = x.OrderDate ?? DateTime.UtcNow,
                RefCode = $"SRV-{x.Id}",
                Amount = x.TotalAmount
            })
            .ToListAsync(cancellationToken);

        var pendingPaymentsRaw = await _context.Invoices
            .Include(x => x.Booking)
                .ThenInclude(b => b!.User)
            .Include(x => x.Booking)
                .ThenInclude(b => b!.Guest)
            .Where(x => x.Status == "Unpaid")
            .OrderByDescending(x => x.CreatedAt)
            .Take(10)
            .Select(x => new
            {
                Id = x.Id.ToString(),
                Title = x.Booking!.User!.FullName ?? x.Booking!.Guest!.Name ?? "Khách vãng lai",
                Subtitle = x.Code,
                Status = "Chưa thanh toán",
                Time = x.CreatedAt ?? DateTime.UtcNow,
                RefCode = x.Code,
                Amount = x.FinalTotal
            })
            .ToListAsync(cancellationToken);

        var recentServicesRaw = await _context.OrderServices
            .Include(x => x.BookingDetail)
                .ThenInclude(bd => bd!.Booking)
                    .ThenInclude(b => b!.User)
            .Include(x => x.BookingDetail)
                .ThenInclude(bd => bd!.Booking)
                    .ThenInclude(b => b!.Guest)
            .Include(x => x.BookingDetail)
                .ThenInclude(bd => bd!.Room)
            .OrderByDescending(x => x.OrderDate)
            .Take(10)
            .Select(x => new
            {
                Id = x.Id.ToString(),
                Title = $"Yêu cầu từ Phòng {x.BookingDetail!.Room!.RoomNumber}",
                Subtitle = x.BookingDetail!.Booking!.User!.FullName ?? x.BookingDetail!.Booking!.Guest!.Name ?? "Khách vãng lai",
                Status = x.Status ?? "N/A",
                Time = x.OrderDate ?? DateTime.UtcNow,
                RefCode = $"SRV-{x.Id}",
                Amount = x.TotalAmount
            })
            .ToListAsync(cancellationToken);

        var bookingsToConfirmRaw = await _context.Bookings
            .Include(x => x.User)
            .Include(x => x.Guest)
            .Where(x => x.Status == "Pending")
            .OrderByDescending(x => x.CreatedAt)
            .Take(10)
            .Select(x => new
            {
                Id = x.Id.ToString(),
                Title = x.User!.FullName ?? x.Guest!.Name ?? "Khách vãng lai",
                Subtitle = "Cần xác nhận",
                Status = "Chờ duyệt",
                Time = x.CreatedAt,
                RefCode = x.BookingCode
            })
            .ToListAsync(cancellationToken);

        var recentNotifications = await _context.Notifications
            .AsNoTracking()
            .Where(x => x.CreatedAt.HasValue && x.CreatedAt.Value >= start && x.CreatedAt.Value <= end)
            .OrderByDescending(x => x.CreatedAt)
            .Take(10)
            .ToListAsync(cancellationToken);

        var notifications = recentNotifications
            .Select(x => new DashboardTaskItem(
                x.Id.ToString(),
                x.Title ?? "Thông báo",
                x.Content ?? "",
                x.Type ?? "Info",
                "NOTIFICATION",
                x.CreatedAt ?? DateTime.UtcNow,
                x.ReferenceLink,
                null
            ))
            .ToList();

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
            UserRoleCount = userRoleCount,
            RecentAudits = recentAudits,
            RecentEquipmentAudits = recentEquipmentAudits,
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
            MonthlyTrends = monthlyTrendsResult,
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
            CleanRooms = cleanRooms,
            PickupRooms = pickupRooms,
            OutOfOrderRooms = outOfOrderRooms,
            OccupancyRate = occupancyRate,
            DamageReports = damageMetrics?.Reports ?? 0,
            DamagedQuantityInPeriod = damageMetrics?.Quantity ?? 0,
            PenaltyAmount = damageMetrics?.PenaltyAmount ?? 0m,
            TotalEquipmentTypes = equipmentMetrics?.TotalEquipmentTypes ?? 0,
            InStockQuantity = equipmentMetrics?.InStockQuantity ?? 0,
            InUseQuantity = equipmentMetrics?.InUseQuantity ?? 0,
            CurrentDamagedQuantity = equipmentMetrics?.CurrentDamagedQuantity ?? 0,
            LiquidatedQuantity = equipmentMetrics?.LiquidatedQuantity ?? 0,
            LowStockItems = equipmentMetrics?.LowStockItems ?? 0,
            NewReviews = reviewMetrics?.NewReviews ?? 0,
            AverageRating = Math.Round(reviewMetrics?.AverageRating ?? 0m, 2),
            TotalGuests = totalGuests,
            StaffCount = staffCount,
            TopServices = topServices,
            RecentBookings = recentBookings,
            
            UpcomingCheckIns = upcomingCheckInsRaw.Select(x => new DashboardTaskItem(x.Id, x.Title, x.Subtitle, x.Status, "CHECK_IN", x.Time, x.RefCode, null, x.PaymentStatus)).ToList(),
            UpcomingCheckOuts = upcomingCheckOutsRaw.Select(x => new DashboardTaskItem(x.Id, x.Title, x.Subtitle, x.Status, "CHECK_OUT", x.Time, x.RefCode, x.TotalBill)).ToList(),
            TodayBookings = todayBookingsRaw.Select(x => new DashboardTaskItem(x.Id, x.Title, x.Subtitle, x.Status, "BOOKING", x.Time, x.RefCode)).ToList(),
            PendingServiceRequests = pendingServicesRaw.Select(x => new DashboardTaskItem(x.Id, x.Title, x.Subtitle, x.Status, "SERVICE", x.Time, x.RefCode, x.Amount)).ToList(),
            PendingPayments = pendingPaymentsRaw.Select(x => new DashboardTaskItem(x.Id, x.Title, x.Subtitle, x.Status, "PAYMENT", x.Time, x.RefCode, x.Amount)).ToList(),
            BookingsToConfirm = bookingsToConfirmRaw.Select(x => new DashboardTaskItem(x.Id, x.Title, x.Subtitle, x.Status, "BOOKING", x.Time, x.RefCode)).ToList(),
            RecentServices = recentServicesRaw.Select(x => new DashboardTaskItem(x.Id, x.Title, x.Subtitle, x.Status, "SERVICE", x.Time, x.RefCode, x.Amount)).ToList(),
            Notifications = notifications,
            LowStockItemsList = lowStockItemsListRaw.Select(x => new LowStockItem(x.Name, x.Quantity)).ToList(),
            RecentDamageReports = recentDamageReportsRaw.Select(x => new DamageReportItem(x.ItemName, x.RoomNumber, x.Quantity, x.PenaltyAmount, x.Description, x.Time)).ToList()
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
                    staffCount = metrics.StaffCount,
                    activeUsers = metrics.ActiveUsers,
                    lockedUsers = metrics.LockedUsers,
                    totalGuests = metrics.TotalGuests,
                    userRoleCount = metrics.UserRoleCount
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
                    monthlyTrends = metrics.MonthlyTrends,
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
                    cleanRooms = metrics.CleanRooms,
                    pickupRooms = metrics.PickupRooms,
                    outOfOrderRooms = metrics.OutOfOrderRooms,
                    occupancyRate = metrics.OccupancyRate
                },
                services = new
                {
                    topServices = metrics.TopServices,
                    pendingServices = metrics.PendingServiceRequests,
                    recentHistory = metrics.RecentServices
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
                    monthlyTrends = metrics.MonthlyTrends,
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
                    cleanRooms = metrics.CleanRooms,
                    pickupRooms = metrics.PickupRooms,
                    outOfOrderRooms = metrics.OutOfOrderRooms,
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
                    revenueTrends = metrics.RevenueTrends,
                    monthlyTrends = metrics.MonthlyTrends
                },
                rooms = new
                {
                    totalRooms = metrics.TotalRooms,
                    availableRooms = metrics.AvailableRooms,
                    occupiedRooms = metrics.OccupiedRooms,
                    maintenanceRooms = metrics.MaintenanceRooms,
                    dirtyRooms = metrics.DirtyRooms,
                    cleaningRooms = metrics.CleaningRooms,
                    cleanRooms = metrics.CleanRooms,
                    pickupRooms = metrics.PickupRooms,
                    outOfOrderRooms = metrics.OutOfOrderRooms,
                    occupancyRate = metrics.OccupancyRate
                },
                tasks = new
                {
                    upcomingCheckIns = metrics.UpcomingCheckIns,
                    upcomingCheckOuts = metrics.UpcomingCheckOuts,
                    todayBookings = metrics.TodayBookings,
                    notifications = metrics.Notifications
                },
                services = new
                {
                    topServices = metrics.TopServices,
                    pendingServices = metrics.PendingServiceRequests,
                    recentHistory = metrics.RecentServices
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
                    liquidatedQuantity = metrics.LiquidatedQuantity,
                    lowStockItems = metrics.LowStockItems,
                    lowStockItemsList = metrics.LowStockItemsList,
                    recentDamageReports = metrics.RecentDamageReports,
                    damageReports = metrics.DamageReports,
                    damagedQuantityInPeriod = metrics.DamagedQuantityInPeriod,
                    recentEquipmentAudits = metrics.RecentEquipmentAudits,
                    penaltyAmount = metrics.PenaltyAmount
                }
            },
            _ => (object)new
            {
                booking = new { totalBookings = metrics.TotalBookings },
                revenue = new { totalRevenue = metrics.TotalRevenue, revenueTrends = metrics.RevenueTrends, monthlyTrends = metrics.MonthlyTrends },
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
            kpiCards = BuildKpiCards(roleName, metrics, period.PeriodType),
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
                damagedQuantityInPeriod = CompareMetric(current.DamagedQuantityInPeriod, previous.DamagedQuantityInPeriod, "lower_is_better"),
                totalGuests = CompareMetric(current.TotalGuests, previous.TotalGuests, "higher_is_better"),
                userRoleCount = CompareMetric(current.UserRoleCount, previous.UserRoleCount, "higher_is_better")
            }
        };

        return JsonSerializer.Serialize(payload, JsonOptions);
    }

    private static object CompareMetric(decimal current, decimal previous, string directionMeaning)
    {
        var growthRate = DashboardPeriodHelper.CalculateGrowthRate(current, previous);
        return new
        {
            current,
            previous,
            difference = current - previous,
            growthRate,
            trend = DashboardPeriodHelper.ResolveTrend(current, previous),
            directionMeaning,
            growthDescription = growthRate > 0 ? "Tăng trưởng so với kỳ trước" : growthRate < 0 ? "Giảm sút so với kỳ trước" : "Ổn định so với kỳ trước"
        };
    }

    private static object CompareMetric(int current, int previous, string directionMeaning)
    {
        return CompareMetric((decimal)current, previous, directionMeaning);
    }

    private static IReadOnlyList<object> BuildKpiCards(string roleName, DashboardMetrics metrics, string periodType)
    {
        return roleName switch
        {
            "Admin" => new object[]
            {
                new { code = "totalRevenue", title = "Tổng doanh thu", value = metrics.TotalRevenue, unit = "VND" },
                new { code = "totalBookings", title = "Tổng Booking", value = metrics.TotalBookings, unit = "booking" },
                new { code = "totalGuests", title = "Số khách hàng", value = metrics.TotalGuests, unit = "khách" },
                new { code = "userRoleCount", title = "Số User", value = metrics.UserRoleCount, unit = "người" }
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
                new { code = "totalBookings", title = $"Tổng Booking {GetPeriodLabel(periodType)}", value = metrics.TotalBookings, unit = "đặt phòng" },
                new { code = "checkIns", title = $"Tổng Check-in {GetPeriodLabel(periodType)}", value = metrics.CheckIns, unit = "lượt" },
                new { code = "checkOuts", title = $"Tổng Check-out {GetPeriodLabel(periodType)}", value = metrics.CheckOuts, unit = "lượt" },
                new { code = "availableRooms", title = "Phòng trống hiện tại", value = metrics.AvailableRooms, unit = "phòng" }
            },
            "WarehouseStaff" or "Warehouse" => new object[]
            {
                new { code = "inStockQuantity", title = "Tổng sản phẩm trong kho", value = metrics.InStockQuantity, unit = "món" },
                new { code = "lowStockItems", title = "Hàng sắp hết (<30)", value = metrics.LowStockItems, unit = "loại" },
                new { code = "currentDamagedQuantity", title = "Hàng hư hỏng", value = metrics.CurrentDamagedQuantity, unit = "món" },
                new { code = "damageReports", title = "Báo cáo hư hỏng", value = metrics.DamageReports, unit = "báo cáo" }
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

    private static object BuildDepartmentOverview(DashboardMetrics metrics)
    {
        return new[]
        {
            new { department = "Lễ tân", value = metrics.PendingBookings, status = metrics.PendingBookings > 0 ? "warning" : "normal" },
            new { department = "Buồng phòng", value = metrics.DirtyRooms, status = metrics.DirtyRooms > 0 ? "warning" : "normal" },
            new { department = "Kho vật tư", value = metrics.LowStockItems, status = metrics.LowStockItems > 0 ? "warning" : "normal" },
            new { department = "Kế toán", value = metrics.UnpaidInvoices, status = metrics.UnpaidInvoices > 0 ? "warning" : "normal" }
        };
    }

    private static string GetPeriodLabel(string periodType) => periodType.ToUpperInvariant() switch
    {
        "DAILY" => "hôm nay",
        "WEEKLY" => "tuần này",
        "MONTHLY" => "tháng này",
        "YEARLY" => "năm này",
        _ => "kỳ này"
    };

    private static List<RecentAuditItem> ExtractAuditEvents(
        IReadOnlyList<AuditLog> logs,
        DateTime start,
        DateTime end,
        bool ignorePeriod = false)
    {
        var result = new List<RecentAuditItem>();
        foreach (var log in logs)
        {
            if (string.IsNullOrWhiteSpace(log.LogData)) continue;

            try
            {
                using var document = JsonDocument.Parse(log.LogData);
                if (!TryGetProperty(document.RootElement, "Events", "events", out var events) || events.ValueKind != JsonValueKind.Array)
                {
                    continue;
                }

                foreach (var item in events.EnumerateArray())
                {
                    var entityType = GetString(item, "EntityType") ?? GetString(item, "entityType");
                    if (entityType == "RoleDashboardPeriodState") continue;

                    var timestamp = GetDateTime(item, "Timestamp") ?? GetDateTime(item, "timestamp") ?? log.LogDate;

                    if (!ignorePeriod && (timestamp < start || timestamp > end)) continue;

                    result.Add(new RecentAuditItem(
                        UserId: log.UserId ?? 0,
                        UserName: log.User?.FullName ?? log.User?.Email ?? "Hệ thống",
                        RoleName: log.User?.Role?.Name ?? "Hệ thống",
                        Action: GetString(item, "ActionType") ?? GetString(item, "actionType") ?? GetString(item, "Action") ?? GetString(item, "action") ?? "UNKNOWN",
                        EntityType: entityType,
                        Message: GetString(item, "Message") ?? GetString(item, "message"),
                        Timestamp: timestamp));
                }
            }
            catch { continue; }
        }
        return result;
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
        public IReadOnlyList<RecentAuditItem> RecentEquipmentAudits { get; init; } = Array.Empty<RecentAuditItem>();
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
        public IReadOnlyList<RevenueTrendItem>? MonthlyTrends { get; init; }
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
        public int CleanRooms { get; init; }
        public int PickupRooms { get; init; }
        public int OutOfOrderRooms { get; init; }
        public decimal OccupancyRate { get; init; }
        public int DamageReports { get; init; }
        public int DamagedQuantityInPeriod { get; init; }
        public decimal PenaltyAmount { get; init; }
        public int TotalEquipmentTypes { get; init; }
        public int InStockQuantity { get; init; }
        public int InUseQuantity { get; init; }
        public int CurrentDamagedQuantity { get; init; }
        public int LiquidatedQuantity { get; init; }
        public int LowStockItems { get; init; }
        public int NewReviews { get; init; }
        public decimal AverageRating { get; init; }
        public int TotalGuests { get; init; }
        public IReadOnlyList<TopServiceItem> TopServices { get; init; } = Array.Empty<TopServiceItem>();
        public IReadOnlyList<RecentBookingItem> RecentBookings { get; init; } = Array.Empty<RecentBookingItem>();
        public int UserRoleCount { get; init; }
        public int StaffCount { get; init; }

        // Receptionist specific lists
        public IReadOnlyList<DashboardTaskItem> UpcomingCheckIns { get; init; } = Array.Empty<DashboardTaskItem>();
        public IReadOnlyList<DashboardTaskItem> UpcomingCheckOuts { get; init; } = Array.Empty<DashboardTaskItem>();
        public IReadOnlyList<DashboardTaskItem> TodayBookings { get; init; } = Array.Empty<DashboardTaskItem>();
        public IReadOnlyList<DashboardTaskItem> PendingServiceRequests { get; init; } = Array.Empty<DashboardTaskItem>();
        public IReadOnlyList<DashboardTaskItem> PendingPayments { get; init; } = Array.Empty<DashboardTaskItem>();
        public IReadOnlyList<DashboardTaskItem> BookingsToConfirm { get; init; } = Array.Empty<DashboardTaskItem>();
        public IReadOnlyList<DashboardTaskItem> Notifications { get; init; } = Array.Empty<DashboardTaskItem>();
        public IReadOnlyList<DashboardTaskItem> RecentServices { get; init; } = Array.Empty<DashboardTaskItem>();
        public IReadOnlyList<LowStockItem> LowStockItemsList { get; init; } = Array.Empty<LowStockItem>();
        public IReadOnlyList<DamageReportItem> RecentDamageReports { get; init; } = Array.Empty<DamageReportItem>();
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

    private sealed record BookingPreview(
        string GuestName,
        string RoomNumber,
        string Status,
        string Type, // CHECK_IN, CHECK_OUT, STAYING
        string Time);

    private sealed record RevenueTrendItem(
        string Date,
        decimal Value,
        decimal RoomValue = 0,
        decimal ServiceValue = 0,
        int CheckInCount = 0,
        int CheckOutCount = 0,
        int OccupiedCount = 0,
        IReadOnlyList<BookingPreview> Bookings = null!);

    public record TopServiceItem(string Name, int Count, decimal TotalAmount);
    public record RecentBookingItem(string Code, string CustomerName, string Status, decimal Amount, DateTime CreatedAt);
    public record LowStockItem(string Name, int Quantity);
    public record DamageReportItem(string ItemName, string RoomNumber, int Quantity, decimal Penalty, string? Description, DateTime Time);
    
    public sealed record DashboardTaskItem(
        string Id,
        string Title,
        string? Subtitle,
        string Status,
        string Type, // CHECK_IN, CHECK_OUT, BOOKING, SERVICE, PAYMENT, NOTIFICATION
        DateTime Time,
        string? ReferenceCode = null,
        decimal? Amount = null,
        string? Extra = null);
}
