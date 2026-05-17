using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using backend.DTOs.Dashboard;
using backend.Services;
using Microsoft.Extensions.Caching.Memory;

namespace backend.Controllers;

[Route("api/dashboard-periods")]
[ApiController]
[Authorize]
public class DashboardPeriodsController : ControllerBase
{
    private readonly IRoleDashboardPeriodService _dashboardService;
    private readonly IMemoryCache _cache;

    public DashboardPeriodsController(IRoleDashboardPeriodService dashboardService, IMemoryCache cache)
    {
        _dashboardService = dashboardService;
        _cache = cache;
    }

    [HttpGet("current")]
    public async Task<IActionResult> GetCurrentDashboard(
        [FromQuery] string? roleName,
        [FromQuery] string periodType = "MONTHLY",
        CancellationToken cancellationToken = default)
    {
        var resolvedRoleName = ResolveRoleName(roleName);
        var cacheKey = $"Dashboard_Current_{resolvedRoleName}_{periodType}";

        if (_cache.TryGetValue(cacheKey, out DashboardPeriodResponseDto? cachedDashboard))
        {
            return Ok(cachedDashboard);
        }

        var dashboard = await _dashboardService.GetRealtimeDashboardAsync(
            resolvedRoleName,
            periodType,
            cancellationToken);

        if (dashboard == null)
        {
            await _dashboardService.RebuildDashboardAsync(
                resolvedRoleName,
                periodType,
                DateTime.UtcNow,
                ResolveUserId(),
                "AUTO_ON_DEMAND",
                null,
                cancellationToken);

            dashboard = await _dashboardService.GetRealtimeDashboardAsync(
                resolvedRoleName,
                periodType,
                cancellationToken);
        }

        if (dashboard != null)
        {
            _cache.Set(cacheKey, dashboard, TimeSpan.FromSeconds(15));
        }

        return dashboard == null
            ? NotFound(new { message = "Không tìm thấy dashboard hiện tại." })
            : Ok(dashboard);
    }

    [HttpGet("{roleName}/{periodType}/{periodKey}")]
    public async Task<IActionResult> GetDashboardByPeriod(
        string roleName,
        string periodType,
        string periodKey,
        CancellationToken cancellationToken = default)
    {
        var dashboard = await _dashboardService.GetDashboardAsync(
            roleName,
            periodType,
            periodKey,
            currentOnly: false,
            cancellationToken);

        return dashboard == null
            ? NotFound(new { message = "Không tìm thấy dashboard theo kỳ." })
            : Ok(dashboard);
    }

    [HttpGet("{roleName}/{periodType}/history")]
    public async Task<IActionResult> GetHistory(
        string roleName,
        string periodType,
        [FromQuery] int take = 12,
        CancellationToken cancellationToken = default)
    {
        var items = await _dashboardService.GetHistoryAsync(roleName, periodType, take, cancellationToken);
        return Ok(items);
    }

    [HttpPost("rebuild")]
    public async Task<IActionResult> RebuildDashboard(
        [FromBody] DashboardRebuildRequestDto request,
        CancellationToken cancellationToken = default)
    {
        var userId = ResolveUserId();
        var occurredAt = request.OccurredAtUtc ?? DateTime.UtcNow;

        await _dashboardService.RebuildDashboardAsync(
            request.RoleName,
            request.PeriodType,
            occurredAt,
            userId,
            "MANUAL_REBUILD",
            null,
            cancellationToken);

        _cache.Remove($"Dashboard_Current_{request.RoleName}_{request.PeriodType}");

        return Ok(new { message = "Đã rebuild dashboard theo kỳ." });
    }

    [HttpPost("rebuild-current")]
    public async Task<IActionResult> RebuildAllCurrent(CancellationToken cancellationToken = default)
    {
        await _dashboardService.RebuildAllCurrentDashboardsAsync(ResolveUserId(), cancellationToken);
        
        var roles = new[] { "Admin", "Manager", "Receptionist", "Accountant", "Housekeeping", "WarehouseStaff", "Warehouse" };
        var periods = new[] { "DAILY", "MONTHLY", "QUARTERLY", "YEARLY" };
        foreach(var r in roles)
        {
            foreach(var p in periods)
            {
                _cache.Remove($"Dashboard_Current_{r}_{p}");
            }
        }

        return Ok(new { message = "Đã rebuild toàn bộ dashboard hiện tại." });
    }

    [HttpPost("events/rebuild-affected")]
    public async Task<IActionResult> RebuildAffectedByEvent(
        [FromBody] DashboardEventRequestDto request,
        CancellationToken cancellationToken = default)
    {
        await _dashboardService.RebuildAffectedDashboardsAsync(
            request.EventType,
            request.OccurredAtUtc ?? DateTime.UtcNow,
            ResolveUserId(),
            request.RefId,
            cancellationToken);

        return Ok(new { message = "Đã cập nhật các dashboard bị ảnh hưởng bởi sự kiện." });
    }

    private string ResolveRoleName(string? requestedRoleName)
    {
        if (!string.IsNullOrWhiteSpace(requestedRoleName))
        {
            return requestedRoleName.Trim();
        }

        return User.FindFirst(ClaimTypes.Role)?.Value ?? "Guest";
    }

    private int? ResolveUserId()
    {
        var raw = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return int.TryParse(raw, out var userId) ? userId : null;
    }
}
