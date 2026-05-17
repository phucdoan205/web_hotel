using System.Linq;
using System.Threading.Tasks;
using backend.Common;
using backend.Data;
using backend.DTOs.Review;
using backend.Models;
using backend.Security;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/user-reviews")]
    [Tags("User Reviews")]
    public class UserReviewsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public UserReviewsController(AppDbContext context)
        {
            _context = context;
        }

        private int? ResolveCurrentUserId()
        {
            var header = Request.Headers["X-User-Id"].ToString();
            if (!string.IsNullOrWhiteSpace(header) && int.TryParse(header, out var headerUserId))
            {
                return headerUserId;
            }

            var claim = User.FindFirst("sub")?.Value
                     ?? User.FindFirst("nameid")?.Value
                     ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

            return int.TryParse(claim, out var claimUserId) ? claimUserId : null;
        }

        [HttpGet]
        [Permission]
        public async Task<ActionResult<IEnumerable<UserReviewResponseDTO>>> GetMyReviews()
        {
            var userId = ResolveCurrentUserId();
            if (!userId.HasValue)
            {
                return Unauthorized(new { message = "Khong xac dinh duoc nguoi dung hien tai." });
            }

            var reviews = await _context.Reviews
                .AsNoTracking()
                .Where(item => item.UserId == userId.Value && item.Status)
                .Include(item => item.RoomType)
                    .ThenInclude(roomType => roomType.RoomImages)
                .OrderByDescending(item => item.CreatedAt ?? DateTime.MinValue)
                .ThenByDescending(item => item.Id)
                .ToListAsync();

            var result = reviews.Select(review => new UserReviewResponseDTO
            {
                Id = review.Id,
                RoomTypeId = review.RoomTypeId,
                RoomTypeName = review.RoomType?.Name ?? "Phòng",
                RoomImageUrl = review.RoomType?.RoomImages?.FirstOrDefault()?.ImageUrl,
                StayDate = review.CreatedAt,
                Rating = review.Rating ?? 0,
                AmenitiesRating = review.AmenitiesRating,
                StaffRating = review.StaffRating,
                CleanlinessRating = review.CleanlinessRating,
                LocationRating = review.LocationRating,
                Comment = review.Comment ?? string.Empty,
                CreatedAt = review.CreatedAt,
                Status = review.Status
            });

            return Ok(result);
        }

        [HttpPost]
        [Permission]
        public async Task<ActionResult<UserReviewResponseDTO>> CreateMyReview([FromBody] UserReviewCreateDTO dto)
        {
            var userId = ResolveCurrentUserId();
            if (!userId.HasValue)
            {
                return Unauthorized(new { message = "Khong xac dinh duoc nguoi dung hien tai." });
            }

            if (dto.Rating < 1 || dto.Rating > 5)
            {
                return BadRequest(new { message = "Rating phai tu 1 den 5 sao." });
            }

            if (!dto.RoomTypeId.HasValue)
            {
                return BadRequest(new { message = "Khong xac dinh duoc loai phong de danh gia." });
            }

            var hasCompletedStay = await _context.Bookings
                .AsNoTracking()
                .Where(item => item.UserId == userId.Value)
                .AnyAsync(item =>
                    item.BookingDetails.Any(detail =>
                        detail.RoomTypeId == dto.RoomTypeId.Value &&
                        detail.Status == "Completed"));

            if (!hasCompletedStay)
            {
                return BadRequest(new { message = "Ban chi co the danh gia sau khi hoan tat luu tru va thanh toan." });
            }

            // Calculate average rating if categories are provided
            double? averageRating = (double?)dto.Rating;
            if (dto.AmenitiesRating.HasValue || dto.StaffRating.HasValue || dto.CleanlinessRating.HasValue || dto.LocationRating.HasValue)
            {
                int sum = (dto.AmenitiesRating ?? 0) + (dto.StaffRating ?? 0) + (dto.CleanlinessRating ?? 0) + (dto.LocationRating ?? 0);
                int count = (dto.AmenitiesRating.HasValue ? 1 : 0) + (dto.StaffRating.HasValue ? 1 : 0) + (dto.CleanlinessRating.HasValue ? 1 : 0) + (dto.LocationRating.HasValue ? 1 : 0);
                if (count > 0)
                {
                    averageRating = (double)sum / count;
                }
            }

            var review = new Review
            {
                UserId = userId.Value,
                RoomTypeId = dto.RoomTypeId,
                Rating = averageRating,
                AmenitiesRating = dto.AmenitiesRating,
                StaffRating = dto.StaffRating,
                CleanlinessRating = dto.CleanlinessRating,
                LocationRating = dto.LocationRating,
                Comment = dto.Comment?.Trim(),
                CreatedAt = DateTime.UtcNow,
                Status = true
            };

            _context.Reviews.Add(review);
            await _context.SaveChangesAsync();

            var roomType = await _context.RoomTypes
                .AsNoTracking()
                .Include(item => item.RoomImages)
                .FirstOrDefaultAsync(item => item.Id == dto.RoomTypeId.Value);

            return Ok(new UserReviewResponseDTO
            {
                Id = review.Id,
                RoomTypeId = review.RoomTypeId,
                RoomTypeName = roomType?.Name ?? "Phòng",
                RoomImageUrl = roomType?.RoomImages?.FirstOrDefault()?.ImageUrl,
                StayDate = review.CreatedAt,
                Rating = review.Rating ?? 0,
                AmenitiesRating = review.AmenitiesRating,
                StaffRating = review.StaffRating,
                CleanlinessRating = review.CleanlinessRating,
                LocationRating = review.LocationRating,
                Comment = review.Comment ?? string.Empty,
                CreatedAt = review.CreatedAt,
                Status = review.Status
            });
        }

        [HttpGet("room-type/{roomTypeId:int}")]
        public async Task<ActionResult<PagedResponse<object>>> GetRoomTypeReviews(
            int roomTypeId,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] int? minRating = null,
            [FromQuery] bool? hasComment = null,
            [FromQuery] string? sort = "newest")
        {
            var query = _context.Reviews
                .AsNoTracking()
                .Where(item => item.RoomTypeId == roomTypeId && item.Status)
                .Include(item => item.User)
                .AsQueryable();

            if (minRating.HasValue)
            {
                query = query.Where(item => item.Rating >= minRating.Value);
            }

            if (hasComment == true)
            {
                query = query.Where(item => !string.IsNullOrEmpty(item.Comment));
            }

            // Sorting logic
            query = sort switch
            {
                "newest" => query.OrderByDescending(r => r.CreatedAt).ThenByDescending(r => r.Id),
                "oldest" => query.OrderBy(r => r.CreatedAt).ThenBy(r => r.Id),
                "highest" => query.OrderByDescending(r => r.Rating).ThenByDescending(r => r.CreatedAt),
                "lowest" => query.OrderBy(r => r.Rating).ThenByDescending(r => r.CreatedAt),
                _ => query.OrderByDescending(r => r.CreatedAt).ThenByDescending(r => r.Id)
            };

            var total = await query.CountAsync();

            var reviews = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var result = reviews.Select(review => (object)new 
            {
                Id = review.Id,
                RoomTypeId = review.RoomTypeId,
                UserName = review.User?.FullName ?? "Khách ẩn danh",
                AvatarUrl = review.User?.AvatarUrl,
                Rating = review.Rating ?? 0,
                AmenitiesRating = review.AmenitiesRating,
                StaffRating = review.StaffRating,
                CleanlinessRating = review.CleanlinessRating,
                LocationRating = review.LocationRating,
                Comment = review.Comment ?? string.Empty,
                CreatedAt = review.CreatedAt
            }).ToList();

            return Ok(new PagedResponse<object>(result, total, page, pageSize));
        }
        [HttpGet("public")]
        public async Task<ActionResult<IEnumerable<object>>> GetPublicReviews([FromQuery] string? sort = "newest", [FromQuery] int limit = 6)
        {
            IQueryable<Review> query = _context.Reviews
                .AsNoTracking()
                .Where(item => item.Status)
                .Include(item => item.User)
                .Include(item => item.RoomType);

            if (sort == "oldest")
            {
                query = query.OrderBy(item => item.CreatedAt ?? DateTime.MaxValue).ThenBy(item => item.Id);
            }
            else
            {
                query = query.OrderByDescending(item => item.CreatedAt ?? DateTime.MinValue).ThenByDescending(item => item.Id);
            }

            var reviews = await query
                .Take(limit)
                .ToListAsync();

            var result = reviews.Select(review => new 
            {
                Id = review.Id,
                RoomTypeId = review.RoomTypeId,
                RoomTypeName = review.RoomType?.Name,
                UserName = review.User?.FullName ?? "Khách ẩn danh",
                AvatarUrl = review.User?.AvatarUrl,
                Rating = review.Rating ?? 0,
                AmenitiesRating = review.AmenitiesRating,
                StaffRating = review.StaffRating,
                CleanlinessRating = review.CleanlinessRating,
                LocationRating = review.LocationRating,
                Comment = review.Comment ?? string.Empty,
                CreatedAt = review.CreatedAt
            });

            return Ok(result);
        }
    }
}
