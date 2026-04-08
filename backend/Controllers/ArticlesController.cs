using System.Globalization;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using backend.Data;
using backend.DTOs.Article;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ArticlesController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly CloudinaryService _cloudinaryService;

        public ArticlesController(AppDbContext context, CloudinaryService cloudinaryService)
        {
            _context = context;
            _cloudinaryService = cloudinaryService;
        }

        [HttpGet]
        public async Task<IActionResult> GetArticles(
            [FromQuery] string? scope = null,
            [FromQuery] string? approval = null,
            [FromQuery] int? authorId = null,
            [FromQuery] string? search = null)
        {
            var currentUser = await ResolveCurrentUserAsync();
            var normalizedScope = (scope ?? "public").Trim().ToLowerInvariant();
            var isAdminScope = normalizedScope == "admin";
            var isAuthorScope = normalizedScope == "author";
            var isPublicScope = !isAdminScope && !isAuthorScope;

            if (isAdminScope && !IsAdmin(currentUser))
            {
                return Forbid();
            }

            if (isAuthorScope && !IsReceptionist(currentUser))
            {
                return Forbid();
            }

            if (IsHousekeeping(currentUser))
            {
                return Ok(new List<ArticleListItemDTO>());
            }

            var query = isAdminScope
                ? _context.Articles.IgnoreQueryFilters().AsQueryable()
                : _context.Articles.AsQueryable();

            query = query
                .Include(a => a.Category)
                .Include(a => a.Author)
                .Include(a => a.Comments);

            if (isAuthorScope)
            {
                query = query.Where(a => a.AuthorId == currentUser!.Id);
            }

            if (authorId.HasValue)
            {
                query = query.Where(a => a.AuthorId == authorId.Value);
            }

            if (isPublicScope)
            {
                query = query.Where(a => a.IsApproved && a.Status && !a.IsDeleted);
            }

            var normalizedApproval = approval?.Trim().ToLowerInvariant();
            if (isAdminScope)
            {
                if (normalizedApproval == "approved")
                {
                    query = query.Where(a => a.IsApproved);
                }
                else if (normalizedApproval == "pending")
                {
                    query = query.Where(a => !a.IsApproved && !a.IsDeleted);
                }
                else if (normalizedApproval == "deleted")
                {
                    query = query.Where(a => a.IsDeleted);
                }
            }

            if (!string.IsNullOrWhiteSpace(search))
            {
                var keyword = search.Trim().ToLower();
                query = query.Where(a =>
                    a.Title.ToLower().Contains(keyword) ||
                    (a.Summary != null && a.Summary.ToLower().Contains(keyword)) ||
                    (a.Content != null && a.Content.ToLower().Contains(keyword)));
            }

            var items = await query
                .OrderByDescending(a => a.IsApproved)
                .ThenByDescending(a => a.PublishedAt ?? a.CreatedAt)
                .AsNoTracking()
                .Select(a => new ArticleListItemDTO
                {
                    Id = a.Id,
                    CategoryId = a.CategoryId,
                    CategoryName = a.Category != null ? a.Category.Name : null,
                    AuthorId = a.AuthorId,
                    AuthorName = a.Author != null ? a.Author.FullName : null,
                    Title = a.Title,
                    Slug = a.Slug,
                    Summary = a.Summary,
                    ThumbnailUrl = a.ThumbnailUrl,
                    PublishedAt = a.PublishedAt,
                    CreatedAt = a.CreatedAt,
                    Status = a.Status,
                    IsApproved = a.IsApproved,
                    IsDeleted = a.IsDeleted,
                    CommentCount = a.Comments.Count,
                    Tags = SplitTags(a.Tags)
                })
                .ToListAsync();

            return Ok(items);
        }

        [HttpGet("{idOrSlug}")]
        public async Task<IActionResult> GetArticle(string idOrSlug, [FromQuery] string? scope = null)
        {
            var currentUser = await ResolveCurrentUserAsync();
            var normalizedScope = (scope ?? "public").Trim().ToLowerInvariant();
            var isAdminScope = normalizedScope == "admin";
            var isAuthorScope = normalizedScope == "author";

            if (IsHousekeeping(currentUser))
            {
                return Forbid();
            }

            if (isAdminScope && !IsAdmin(currentUser))
            {
                return Forbid();
            }

            if (isAuthorScope && !IsReceptionist(currentUser))
            {
                return Forbid();
            }

            var query = isAdminScope
                ? _context.Articles.IgnoreQueryFilters().AsQueryable()
                : _context.Articles.AsQueryable();

            query = query
                .Include(a => a.Category)
                .Include(a => a.Author)
                .Include(a => a.ApprovedBy)
                .Include(a => a.Comments)
                    .ThenInclude(c => c.User)
                .Include(a => a.Comments)
                    .ThenInclude(c => c.TaggedUser);

            Article? article;
            if (int.TryParse(idOrSlug, out var id))
            {
                article = await query.FirstOrDefaultAsync(a => a.Id == id);
            }
            else
            {
                article = await query.FirstOrDefaultAsync(a => a.Slug == idOrSlug);
            }

            if (article == null)
            {
                return NotFound("Khong tim thay bai viet.");
            }

            if (!isAdminScope)
            {
                if (isAuthorScope)
                {
                    if (article.AuthorId != currentUser?.Id)
                    {
                        return Forbid();
                    }
                }
                else if (!article.IsApproved || !article.Status || article.IsDeleted)
                {
                    return NotFound("Bai viet chua san sang de hien thi.");
                }
            }

            return Ok(MapArticleDetail(article));
        }

        [HttpPost]
        [Consumes("multipart/form-data")]
        [RequestSizeLimit(20_000_000)]
        public async Task<IActionResult> CreateArticle([FromForm] CreateArticleDTO request)
        {
            var currentUser = await RequireCurrentUserAsync();
            if (currentUser == null)
            {
                return Unauthorized();
            }

            if (!IsReceptionist(currentUser))
            {
                return Forbid();
            }

            if (string.IsNullOrWhiteSpace(request.Title))
            {
                return BadRequest("Title is required.");
            }

            var slug = await BuildUniqueSlugAsync(request.Title);
            var article = new Article
            {
                CategoryId = request.CategoryId,
                AuthorId = currentUser.Id,
                Title = request.Title.Trim(),
                Slug = slug,
                Summary = NormalizeOptional(request.Summary),
                Content = NormalizeOptional(request.Content),
                Tags = NormalizeTags(request.Tags),
                PublishedAt = null,
                Status = false,
                IsApproved = false,
                CreatedAt = DateTime.UtcNow
            };

            if (!string.IsNullOrWhiteSpace(request.ThumbnailUrl))
            {
                article.ThumbnailUrl = request.ThumbnailUrl.Trim();
            }
            else if (request.ThumbnailFile != null)
            {
                var folder = BuildNewsFolder(slug);
                var uploadedUrl = await _cloudinaryService.UploadImageAsync(request.ThumbnailFile, folder);
                if (string.IsNullOrWhiteSpace(uploadedUrl))
                {
                    return StatusCode(500, "Upload anh bai viet len Cloudinary that bai.");
                }

                article.ThumbnailUrl = uploadedUrl;
            }

            _context.Articles.Add(article);
            await _context.SaveChangesAsync();

            var created = await _context.Articles
                .Include(a => a.Category)
                .Include(a => a.Author)
                .FirstAsync(a => a.Id == article.Id);

            return Ok(MapArticleDetail(created));
        }

        [HttpPut("{id:int}")]
        [Consumes("multipart/form-data")]
        [RequestSizeLimit(20_000_000)]
        public async Task<IActionResult> UpdateArticle(int id, [FromForm] CreateArticleDTO request)
        {
            var currentUser = await RequireCurrentUserAsync();
            if (currentUser == null)
            {
                return Unauthorized();
            }

            if (!IsReceptionist(currentUser))
            {
                return Forbid();
            }

            var article = await _context.Articles.IgnoreQueryFilters().FirstOrDefaultAsync(a => a.Id == id);
            if (article == null)
            {
                return NotFound("Khong tim thay bai viet.");
            }

            if (article.AuthorId != currentUser.Id)
            {
                return Forbid();
            }

            if (article.IsDeleted)
            {
                return BadRequest("Bai viet da bi xoa.");
            }

            if (string.IsNullOrWhiteSpace(request.Title))
            {
                return BadRequest("Title is required.");
            }

            var titleChanged = !string.Equals(article.Title, request.Title.Trim(), StringComparison.Ordinal);
            var oldImageUrl = article.ThumbnailUrl;

            article.CategoryId = request.CategoryId;
            article.Title = request.Title.Trim();
            article.Summary = NormalizeOptional(request.Summary);
            article.Content = NormalizeOptional(request.Content);
            article.Tags = NormalizeTags(request.Tags);
            article.UpdatedAt = DateTime.UtcNow;
            article.Status = false;

            if (titleChanged)
            {
                article.Slug = await BuildUniqueSlugAsync(article.Title, article.Id);
            }

            if (!string.IsNullOrWhiteSpace(request.ThumbnailUrl))
            {
                article.ThumbnailUrl = request.ThumbnailUrl.Trim();
            }
            else if (request.ThumbnailFile != null)
            {
                var folder = BuildNewsFolder(article.Slug ?? Slugify(article.Title));
                var uploadedUrl = await _cloudinaryService.UploadImageAsync(request.ThumbnailFile, folder);
                if (string.IsNullOrWhiteSpace(uploadedUrl))
                {
                    return StatusCode(500, "Upload anh bai viet len Cloudinary that bai.");
                }

                article.ThumbnailUrl = uploadedUrl;
            }

            if (article.IsApproved)
            {
                article.IsApproved = false;
                article.ApprovedAt = null;
                article.ApprovedById = null;
            }

            await _context.SaveChangesAsync();

            if (request.ThumbnailFile != null && !string.IsNullOrWhiteSpace(oldImageUrl) && oldImageUrl != article.ThumbnailUrl)
            {
                await _cloudinaryService.DeleteImageByUrlAsync(oldImageUrl);
            }

            var updated = await _context.Articles
                .Include(a => a.Category)
                .Include(a => a.Author)
                .FirstAsync(a => a.Id == article.Id);

            return Ok(MapArticleDetail(updated));
        }

        [HttpPut("{id:int}/approve")]
        public async Task<IActionResult> ApproveArticle(int id)
        {
            var currentUser = await RequireCurrentUserAsync();
            if (currentUser == null)
            {
                return Unauthorized();
            }

            if (!IsAdmin(currentUser))
            {
                return Forbid();
            }

            var article = await _context.Articles.IgnoreQueryFilters().FirstOrDefaultAsync(a => a.Id == id);
            if (article == null)
            {
                return NotFound("Khong tim thay bai viet.");
            }

            if (article.IsDeleted)
            {
                return BadRequest("Bai viet da bi xoa.");
            }

            article.IsApproved = true;
            article.Status = true;
            article.ApprovedAt = DateTime.UtcNow;
            article.ApprovedById = currentUser.Id;
            article.PublishedAt ??= DateTime.UtcNow;
            article.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpPost("upload-images")]
        [Consumes("multipart/form-data")]
        [RequestSizeLimit(30_000_000)]
        public async Task<IActionResult> UploadImages([FromForm] List<IFormFile> files, [FromForm] string? articleTitle = null)
        {
            var currentUser = await RequireCurrentUserAsync();
            if (currentUser == null)
            {
                return Unauthorized();
            }

            if (!IsReceptionist(currentUser))
            {
                return Forbid();
            }

            if (files == null || files.Count == 0)
            {
                return BadRequest("Chưa chọn ảnh để tải lên.");
            }

            var folder = BuildNewsFolder(Slugify(articleTitle ?? $"article-{DateTime.UtcNow:yyyyMMddHHmmss}"));
            var urls = new List<string>();

            foreach (var file in files)
            {
                var uploadedUrl = await _cloudinaryService.UploadImageAsync(file, folder);
                if (!string.IsNullOrWhiteSpace(uploadedUrl))
                {
                    urls.Add(uploadedUrl);
                }
            }

            if (urls.Count == 0)
            {
                return StatusCode(500, "Tải ảnh bài viết lên Cloudinary thất bại.");
            }

            return Ok(new ArticleImageUploadResponseDTO
            {
                Urls = urls
            });
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> DeleteArticle(int id)
        {
            var currentUser = await RequireCurrentUserAsync();
            if (currentUser == null)
            {
                return Unauthorized();
            }

            var article = await _context.Articles.IgnoreQueryFilters().FirstOrDefaultAsync(a => a.Id == id);
            if (article == null)
            {
                return NotFound("Khong tim thay bai viet.");
            }

            if (IsReceptionist(currentUser))
            {
                if (article.AuthorId != currentUser.Id)
                {
                    return Forbid();
                }

                if (article.IsApproved)
                {
                    article.IsDeleted = true;
                    article.DeletedAt = DateTime.UtcNow;
                    article.Status = false;
                    await _context.SaveChangesAsync();
                    return NoContent();
                }

                await HardDeleteArticleAsync(article);
                return NoContent();
            }

            if (IsAdmin(currentUser))
            {
                await HardDeleteArticleAsync(article);
                return NoContent();
            }

            return Forbid();
        }

        [HttpGet("{id:int}/comments")]
        public async Task<IActionResult> GetComments(int id)
        {
            var currentUser = await ResolveCurrentUserAsync();
            if (IsHousekeeping(currentUser))
            {
                return Forbid();
            }

            var article = await _context.Articles.FirstOrDefaultAsync(a => a.Id == id && a.IsApproved && a.Status && !a.IsDeleted);
            if (article == null)
            {
                return NotFound("Khong tim thay bai viet.");
            }

            var comments = await _context.ArticleComments
                .AsNoTracking()
                .Include(c => c.User)
                .Include(c => c.TaggedUser)
                .Where(c => c.ArticleId == id)
                .OrderBy(c => c.CreatedAt)
                .ToListAsync();

            return Ok(BuildCommentTree(comments));
        }

        [HttpPost("{id:int}/comments")]
        public async Task<IActionResult> CreateComment(int id, [FromBody] ArticleCommentCreateDTO request)
        {
            var currentUser = await RequireCurrentUserAsync();
            if (currentUser == null)
            {
                return Unauthorized();
            }

            if (IsHousekeeping(currentUser))
            {
                return Forbid();
            }

            var article = await _context.Articles.FirstOrDefaultAsync(a => a.Id == id && a.IsApproved && a.Status && !a.IsDeleted);
            if (article == null)
            {
                return NotFound("Khong tim thay bai viet.");
            }

            if (string.IsNullOrWhiteSpace(request.Content))
            {
                return BadRequest("Noi dung binh luan la bat buoc.");
            }

            if (request.ParentCommentId.HasValue)
            {
                var parentExists = await _context.ArticleComments.AnyAsync(c => c.Id == request.ParentCommentId.Value && c.ArticleId == id);
                if (!parentExists)
                {
                    return BadRequest("Khong tim thay binh luan goc.");
                }
            }

            var comment = new ArticleComment
            {
                ArticleId = id,
                UserId = currentUser.Id,
                ParentCommentId = request.ParentCommentId,
                TaggedUserId = request.TaggedUserId,
                Content = request.Content.Trim(),
                CreatedAt = DateTime.UtcNow
            };

            _context.ArticleComments.Add(comment);
            await _context.SaveChangesAsync();

            var comments = await _context.ArticleComments
                .AsNoTracking()
                .Include(c => c.User)
                .Include(c => c.TaggedUser)
                .Where(c => c.ArticleId == id)
                .OrderBy(c => c.CreatedAt)
                .ToListAsync();

            return Ok(BuildCommentTree(comments));
        }

        private async Task<User?> ResolveCurrentUserAsync()
        {
            var userIdClaim = User.FindFirstValue(JwtRegisteredClaimNames.NameId)
                ?? User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? Request.Headers["X-User-Id"].FirstOrDefault();

            if (!int.TryParse(userIdClaim, out var userId))
            {
                return null;
            }

            return await _context.Users
                .AsNoTracking()
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.Id == userId);
        }

        private async Task<User?> RequireCurrentUserAsync()
        {
            return await ResolveCurrentUserAsync();
        }

        private static bool IsReceptionist(User? user)
        {
            return string.Equals(user?.Role?.Name, "Receptionist", StringComparison.OrdinalIgnoreCase);
        }

        private static bool IsAdmin(User? user)
        {
            return string.Equals(user?.Role?.Name, "Admin", StringComparison.OrdinalIgnoreCase);
        }

        private static bool IsHousekeeping(User? user)
        {
            return string.Equals(user?.Role?.Name, "Housekeeping", StringComparison.OrdinalIgnoreCase);
        }

        private async Task HardDeleteArticleAsync(Article article)
        {
            var comments = await _context.ArticleComments.Where(c => c.ArticleId == article.Id).ToListAsync();
            if (comments.Count > 0)
            {
                _context.ArticleComments.RemoveRange(comments);
            }

            _context.Articles.Remove(article);
            await _context.SaveChangesAsync();

            if (!string.IsNullOrWhiteSpace(article.ThumbnailUrl))
            {
                await _cloudinaryService.DeleteImageByUrlAsync(article.ThumbnailUrl);
            }
        }

        private static ArticleDetailDTO MapArticleDetail(Article article)
        {
            var allComments = article.Comments?.OrderBy(c => c.CreatedAt).ToList() ?? new List<ArticleComment>();
            return new ArticleDetailDTO
            {
                Id = article.Id,
                CategoryId = article.CategoryId,
                CategoryName = article.Category?.Name,
                AuthorId = article.AuthorId,
                AuthorName = article.Author?.FullName,
                Title = article.Title,
                Slug = article.Slug,
                Summary = article.Summary,
                ThumbnailUrl = article.ThumbnailUrl,
                Content = article.Content,
                PublishedAt = article.PublishedAt,
                CreatedAt = article.CreatedAt,
                UpdatedAt = article.UpdatedAt,
                Status = article.Status,
                IsApproved = article.IsApproved,
                IsDeleted = article.IsDeleted,
                ApprovedAt = article.ApprovedAt,
                ApprovedById = article.ApprovedById,
                ApprovedByName = article.ApprovedBy?.FullName,
                CommentCount = allComments.Count,
                Tags = SplitTags(article.Tags),
                Comments = BuildCommentTree(allComments)
            };
        }

        private static List<ArticleCommentDTO> BuildCommentTree(List<ArticleComment> comments)
        {
            var lookup = comments
                .Select(c => new ArticleCommentDTO
                {
                    Id = c.Id,
                    ArticleId = c.ArticleId,
                    UserId = c.UserId,
                    UserName = c.User?.FullName ?? "User",
                    UserAvatarUrl = c.User?.AvatarUrl,
                    ParentCommentId = c.ParentCommentId,
                    TaggedUserId = c.TaggedUserId,
                    TaggedUserName = c.TaggedUser?.FullName,
                    Content = c.Content,
                    CreatedAt = c.CreatedAt
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

        private async Task<string> BuildUniqueSlugAsync(string title, int? ignoreArticleId = null)
        {
            var baseSlug = Slugify(title);
            if (string.IsNullOrWhiteSpace(baseSlug))
            {
                baseSlug = $"article-{DateTime.UtcNow:yyyyMMddHHmmss}";
            }

            var slug = baseSlug;
            var suffix = 2;

            while (await _context.Articles.IgnoreQueryFilters().AnyAsync(a => a.Slug == slug && (!ignoreArticleId.HasValue || a.Id != ignoreArticleId.Value)))
            {
                slug = $"{baseSlug}-{suffix++}";
            }

            return slug;
        }

        private static string BuildNewsFolder(string slug)
        {
            return $"home/News/{slug}";
        }

        private static string? NormalizeOptional(string? value)
        {
            var normalized = value?.Trim();
            return string.IsNullOrWhiteSpace(normalized) ? null : normalized;
        }

        private static string? NormalizeTags(string? tags)
        {
            var normalized = SplitTags(tags);
            return normalized.Count == 0 ? null : string.Join(",", normalized);
        }

        private static List<string> SplitTags(string? tags)
        {
            return (tags ?? string.Empty)
                .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .ToList();
        }

        private static string Slugify(string value)
        {
            var normalized = value.Normalize(NormalizationForm.FormD);
            var builder = new StringBuilder();

            foreach (var ch in normalized)
            {
                var unicodeCategory = CharUnicodeInfo.GetUnicodeCategory(ch);
                if (unicodeCategory != UnicodeCategory.NonSpacingMark)
                {
                    builder.Append(ch);
                }
            }

            var plain = builder.ToString().Normalize(NormalizationForm.FormC).ToLowerInvariant();
            var slugBuilder = new StringBuilder();

            foreach (var ch in plain)
            {
                if (char.IsLetterOrDigit(ch))
                {
                    slugBuilder.Append(ch);
                }
                else if (slugBuilder.Length == 0 || slugBuilder[^1] != '-')
                {
                    slugBuilder.Append('-');
                }
            }

            return slugBuilder.ToString().Trim('-');
        }
    }
}
