using backend.Data;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    public interface IMembershipService
    {
        Task AddPointsAsync(int userId, decimal amount, CancellationToken cancellationToken = default);
    }

    public class MembershipService : IMembershipService
    {
        private readonly AppDbContext _context;
        private readonly NotificationService _notificationService;
        private readonly ILogger<MembershipService> _logger;

        public MembershipService(
            AppDbContext context, 
            NotificationService notificationService,
            ILogger<MembershipService> logger)
        {
            _context = context;
            _notificationService = notificationService;
            _logger = logger;
        }

        public async Task AddPointsAsync(int userId, decimal amount, CancellationToken cancellationToken = default)
        {
            var user = await _context.Users
                .Include(u => u.Membership)
                .FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);

            if (user == null) return;

            // 1 point per 1000 VND
            int pointsToAdd = (int)Math.Floor(amount / 1000);
            if (pointsToAdd <= 0) return;

            // Explicitly add to current points to ensure accumulation
            int currentPoints = user.Points;
            user.Points = currentPoints + pointsToAdd;

            // Notify user about points increase
            await _notificationService.CreateAsync(
                "Tích điểm thành công!",
                $"Bạn vừa được cộng {pointsToAdd} điểm từ giao dịch thanh toán. Tổng điểm hiện tại: {user.Points} điểm.",
                "Info",
                "/profile/membership",
                user.Id
            );

            // Check for membership upgrade
            var allTiers = await _context.Memberships
                .OrderByDescending(m => m.MinPoints ?? 0)
                .ToListAsync(cancellationToken);

            var bestTier = allTiers.FirstOrDefault(m => (m.MinPoints ?? 0) <= user.Points);

            if (bestTier != null && bestTier.Id != user.MembershipId)
            {
                var oldTierName = user.Membership?.TierName ?? "Bình thường";
                user.MembershipId = bestTier.Id;
                
                // Send upgrade notification
                await _notificationService.CreateAsync(
                    "Thăng hạng thành viên!",
                    $"Chúc mừng! Bạn đã đạt mức {user.Points} điểm và được thăng hạng lên {bestTier.TierName}.",
                    "Success",
                    "/profile/membership",
                    user.Id
                );
            }

            await _context.SaveChangesAsync(cancellationToken);
        }
    }
}
