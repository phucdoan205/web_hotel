using backend.Data;
using backend.DTOs.Article;
using backend.DTOs.Service;
using backend.Models;
using backend.Security;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/public-services")]
    [Tags("Public Services")]
    public class PublicServicesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public PublicServicesController(AppDbContext context)
        {
            _context = context;
        }

        private static ServiceResponseDTO MapService(Service service, List<ServiceComment> allComments)
        {
            var serviceComments = allComments.Where(c => c.ServiceId == service.Id).ToList();
            return new ServiceResponseDTO
            {
                Id = service.Id,
                CategoryId = service.CategoryId,
                CategoryName = service.Category?.Name,
                Name = service.Name,
                ThumbnailUrl = service.ThumbnailUrl,
                Description = service.Description,
                Price = service.Price,
                Unit = service.Unit,
                Status = service.Status,
                Images = service.ServiceImages.Select(img => img.ImageUrl).ToList(),
                AverageRating = serviceComments.Any(c => c.Rating > 0) ? serviceComments.Where(c => c.Rating > 0).Average(c => c.Rating.Value) : 0,
                CommentCount = serviceComments.Count
            };
        }

        [HttpGet("categories")]
        public async Task<ActionResult<IEnumerable<ServiceCategoryResponseDTO>>> GetCategories()
        {
            var categories = await _context.ServiceCategories
                .AsNoTracking()
                .Where(c => c.Status)
                .OrderBy(c => c.Name)
                .Select(c => new ServiceCategoryResponseDTO
                {
                    Id = c.Id,
                    Name = c.Name,
                    IconUrl = c.IconUrl,
                    Status = c.Status
                })
                .ToListAsync();

            return Ok(categories);
        }

        [HttpGet]
        public async Task<ActionResult<object>> GetServices(
            [FromQuery] int? categoryId = null,
            [FromQuery] string? search = null,
            [FromQuery] string? sort = null,
            [FromQuery] int? minStars = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 16)
        {
            var query = _context.Services
                .AsNoTracking()
                .Include(s => s.Category)
                .Include(s => s.ServiceImages)
                .Where(s => s.Status)
                .AsQueryable();

            if (categoryId.HasValue)
            {
                query = query.Where(s => s.CategoryId == categoryId.Value);
            }

            if (!string.IsNullOrWhiteSpace(search))
            {
                var keyword = search.Trim().ToLower();
                query = query.Where(s => s.Name.ToLower().Contains(keyword) || (s.Description != null && s.Description.ToLower().Contains(keyword)));
            }

            // Rating filter requires getting comments first, but we can optimize this if needed.
            // For now, let's fetch services and then filter if rating is requested.
            
            var allServiceIds = await query.Select(s => s.Id).ToListAsync();
            var allComments = await _context.ServiceComments
                .AsNoTracking()
                .Where(c => allServiceIds.Contains(c.ServiceId))
                .ToListAsync();

            var services = await query.ToListAsync();
            var mappedServices = services.Select(s => MapService(s, allComments)).ToList();

            if (minStars.HasValue)
            {
                mappedServices = mappedServices.Where(s => s.AverageRating >= minStars.Value).ToList();
            }

            // Sorting
            if (sort == "price_asc")
            {
                mappedServices = mappedServices.OrderBy(s => s.Price).ToList();
            }
            else if (sort == "price_desc")
            {
                mappedServices = mappedServices.OrderByDescending(s => s.Price).ToList();
            }
            else if (sort == "rating_desc")
            {
                mappedServices = mappedServices.OrderByDescending(s => s.AverageRating).ToList();
            }
            else
            {
                mappedServices = mappedServices.OrderBy(s => s.Name).ToList();
            }

            var totalItems = mappedServices.Count;
            var totalPages = (int)Math.Ceiling(totalItems / (double)pageSize);
            var items = mappedServices.Skip((page - 1) * pageSize).Take(pageSize).ToList();

            return Ok(new
            {
                items,
                totalItems,
                totalPages,
                currentPage = page,
                pageSize
            });
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<ServiceResponseDTO>> GetServiceDetail(int id)
        {
            var service = await _context.Services
                .AsNoTracking()
                .Include(s => s.Category)
                .Include(s => s.ServiceImages)
                .FirstOrDefaultAsync(s => s.Id == id);

            if (service == null)
            {
                return NotFound("Không tìm thấy dịch vụ.");
            }

            var comments = await _context.ServiceComments
                .AsNoTracking()
                .Include(c => c.User)
                .Include(c => c.TaggedUser)
                .Where(c => c.ServiceId == id)
                .OrderBy(c => c.CreatedAt)
                .ToListAsync();

            var response = MapService(service, comments);
            response.Comments = BuildCommentTree(comments);

            return Ok(response);
        }

        [HttpPost("{id:int}/comments")]
        [Permission] // Requires login
        public async Task<IActionResult> CreateComment(int id, [FromBody] ArticleCommentCreateDTO request)
        {
            var userIdStr = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value 
                        ?? Request.Headers["X-User-Id"].FirstOrDefault();

            if (!int.TryParse(userIdStr, out var userId))
            {
                return Unauthorized("Không xác định được người dùng.");
            }

            var serviceExists = await _context.Services.AnyAsync(s => s.Id == id && s.Status);
            if (!serviceExists)
            {
                return NotFound("Không tìm thấy dịch vụ.");
            }

            if (string.IsNullOrWhiteSpace(request.Content))
            {
                return BadRequest("Nội dung bình luận là bắt buộc.");
            }

            if (request.ParentCommentId.HasValue)
            {
                var parentExists = await _context.ServiceComments.AnyAsync(c => c.Id == request.ParentCommentId.Value && c.ServiceId == id);
                if (!parentExists)
                {
                    return BadRequest("Không tìm thấy bình luận gốc.");
                }
            }

            var comment = new ServiceComment
            {
                ServiceId = id,
                UserId = userId,
                ParentCommentId = request.ParentCommentId,
                TaggedUserId = request.TaggedUserId,
                Rating = request.Rating,
                Content = request.Content.Trim(),
                CreatedAt = DateTime.UtcNow
            };

            _context.ServiceComments.Add(comment);
            await _context.SaveChangesAsync();

            var comments = await _context.ServiceComments
                .AsNoTracking()
                .Include(c => c.User)
                .Include(c => c.TaggedUser)
                .Where(c => c.ServiceId == id)
                .OrderBy(c => c.CreatedAt)
                .ToListAsync();

            return Ok(BuildCommentTree(comments));
        }

        private static List<ArticleCommentDTO> BuildCommentTree(List<ServiceComment> comments)
        {
            var lookup = comments
                .Select(c => new ArticleCommentDTO
                {
                    Id = c.Id,
                    ArticleId = c.ServiceId, // Reuse DTO field for ServiceId
                    UserId = c.UserId,
                    UserName = c.User?.FullName ?? "User",
                    UserAvatarUrl = c.User?.AvatarUrl,
                    ParentCommentId = c.ParentCommentId,
                    TaggedUserId = c.TaggedUserId,
                    TaggedUserName = c.TaggedUser?.FullName,
                    Rating = c.Rating,
                    Content = c.Content,
                    CreatedAt = DateTime.SpecifyKind(c.CreatedAt, DateTimeKind.Utc)
                })
                .ToDictionary(c => c.Id);

            var roots = new List<ArticleCommentDTO>();

            foreach (var comment in lookup.Values.OrderBy(c => c.CreatedAt))
            {
                if (comment.ParentCommentId.HasValue && lookup.TryGetValue(comment.ParentCommentId.Value, out var parent))
                {
                    parent.Replies.Add(comment);
                }
                else
                {
                    roots.Add(comment);
                }
            }

            return roots;
        }
    }
}
