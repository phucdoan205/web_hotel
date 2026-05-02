using System.Globalization;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using backend.Data;
using backend.DTOs.Article;
using backend.Models;
using backend.Security;
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
            var normalizedApproval = approval?.Trim().ToLowerInvariant();
            var isAdminScope = normalizedScope == "admin";
            var isAuthorScope = normalizedScope == "author";
            var isPublicScope = !isAdminScope && !isAuthorScope;
            var includeDeleted = (isAdminScope || isAuthorScope) && normalizedApproval == "deleted";

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

            var query = (isAdminScope || includeDeleted)
                ? _context.Articles.IgnoreQueryFilters().AsQueryable()
                : _context.Articles.AsQueryable();

            query = query
                .Include(a => a.Category)
                .Include(a => a.Attraction)
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

            if (isAdminScope || isAuthorScope)
            {
                if (normalizedApproval == "approved")
                {
                    query = query.Where(a => a.IsApproved && !a.IsDeleted);
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

            var articles = await query
                .OrderByDescending(a => a.IsApproved)
                .ThenByDescending(a => a.PublishedAt ?? a.CreatedAt)
                .AsNoTracking()
                .ToListAsync();

            var items = articles
                .Select(a => MapArticleListItem(a))
                .ToList();

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
                .Include(a => a.Attraction)
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
        [Permission("CREATE_CONTENT")]
        public async Task<IActionResult> CreateArticle([FromForm] CreateArticleDTO request)
        {
            var currentUser = await RequireCurrentUserAsync();
            if (currentUser == null)
            {
                return Unauthorized();
            }
            // Permisssion "CREATE_CONTENT" is handled by the [Permission] attribute


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
                GalleryUrls = NormalizeGalleryUrls(request.GalleryUrls, request.ThumbnailUrl),
                AttractionId = request.AttractionId,
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
                .Include(a => a.Attraction)
                .Include(a => a.Author)
                .FirstAsync(a => a.Id == article.Id);

            return Ok(MapArticleDetail(created));
        }

        [HttpPut("{id:int}")]
        [Consumes("multipart/form-data")]
        [RequestSizeLimit(20_000_000)]
        [Permission("EDIT_CONTENT")]
        public async Task<IActionResult> UpdateArticle(int id, [FromForm] CreateArticleDTO request)
        {
            var currentUser = await RequireCurrentUserAsync();
            if (currentUser == null)
            {
                return Unauthorized();
            }

            // For now, we rely on the [Permission("EDIT_CONTENT")] attribute
            var article = await _context.Articles.IgnoreQueryFilters().FirstOrDefaultAsync(a => a.Id == id);
            if (article == null)
            {
                return NotFound("Khong tim thay bai viet.");
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
            article.GalleryUrls = NormalizeGalleryUrls(request.GalleryUrls, request.ThumbnailUrl);
            article.AttractionId = request.AttractionId;
            article.UpdatedAt = DateTime.UtcNow;
            article.Status = article.IsApproved;
            article.ApprovedAt = article.IsApproved ? article.ApprovedAt : null;
            article.ApprovedById = article.IsApproved ? article.ApprovedById : null;
            article.PublishedAt = article.IsApproved ? article.PublishedAt : null;

            if (titleChanged)
            {
                article.Slug = await BuildUniqueSlugAsync(article.Title, article.Id);
            }

            if (request.RemoveThumbnail)
            {
                article.ThumbnailUrl = null;
            }
            else if (!string.IsNullOrWhiteSpace(request.ThumbnailUrl))
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

            await _context.SaveChangesAsync();

            if ((request.ThumbnailFile != null || request.RemoveThumbnail) && !string.IsNullOrWhiteSpace(oldImageUrl) && oldImageUrl != article.ThumbnailUrl)
            {
                await _cloudinaryService.DeleteImageByUrlAsync(oldImageUrl);
            }

            var updated = await _context.Articles
                .Include(a => a.Category)
                .Include(a => a.Attraction)
                .Include(a => a.Author)
                .FirstAsync(a => a.Id == article.Id);

            return Ok(MapArticleDetail(updated));
        }

        [HttpPut("{id:int}/approve")]
        [Permission("PUBLISH_CONTENT")]
        public async Task<IActionResult> ApproveArticle(int id)
        {
            var currentUser = await RequireCurrentUserAsync();
            if (currentUser == null)
            {
                return Unauthorized();
            }

            // Permission "PUBLISH_CONTENT" is handled by the [Permission] attribute


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
        [Permission("CREATE_CONTENT", "EDIT_CONTENT")]
        public async Task<IActionResult> UploadImages([FromForm] List<IFormFile> files, [FromForm] string? articleTitle = null)
        {
            var currentUser = await RequireCurrentUserAsync();
            if (currentUser == null)
            {
                return Unauthorized();
            }

            // Permission is handled by [Permission] attribute


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
        [Permission("DELETE_CONTENT")]
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

            // Soft-delete or hard-delete based on approval status
            if (!article.IsApproved)
            {
                await HardDeleteArticleAsync(article);
                return NoContent();
            }

            article.IsDeleted = true;
            article.DeletedAt = DateTime.UtcNow;
            article.Status = false;
            article.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id:int}/hard-delete")]
        [Permission("DELETE_CONTENT")]
        public async Task<IActionResult> HardDeleteArticle(int id)
        {
            var currentUser = await RequireCurrentUserAsync();
            if (currentUser == null)
            {
                return Unauthorized();
            }

            // Permission "DELETE_CONTENT" is handled by the [Permission] attribute


            var article = await _context.Articles.IgnoreQueryFilters().FirstOrDefaultAsync(a => a.Id == id);
            if (article == null)
            {
                return NotFound("Khong tim thay bai viet.");
            }

            await HardDeleteArticleAsync(article);
            return NoContent();
        }

        [HttpPost("{id:int}/restore")]
        [Permission("DELETE_CONTENT")]
        public async Task<IActionResult> RestoreArticle(int id)
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

            // Permission "DELETE_CONTENT" is handled by the [Permission] attribute


            // Permission "DELETE_CONTENT" is handled by the [Permission] attribute


            if (!article.IsDeleted)
            {
                return BadRequest("Bai viet khong nam trong thung rac.");
            }

            article.IsDeleted = false;
            article.DeletedAt = null;
            article.IsApproved = true;
            article.Status = true;
            article.ApprovedAt ??= DateTime.UtcNow;
            article.PublishedAt ??= DateTime.UtcNow;
            article.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return NoContent();
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
            var comments = await _context.ArticleComments
                .Where(c => c.ArticleId == article.Id)
                .OrderByDescending(c => c.ParentCommentId.HasValue)
                .ToListAsync();

            if (comments.Count > 0)
            {
                _context.ArticleComments.RemoveRange(comments);
                await _context.SaveChangesAsync();
            }

            await _context.Database.ExecuteSqlInterpolatedAsync(
                $"DELETE FROM Articles WHERE Id = {article.Id}");

            if (!string.IsNullOrWhiteSpace(article.ThumbnailUrl))
            {
                try
                {
                    await _cloudinaryService.DeleteImageByUrlAsync(article.ThumbnailUrl);
                }
                catch
                {
                    // Keep database deletion successful even if remote image cleanup fails.
                }
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
                AttractionId = article.AttractionId,
                AttractionName = article.Attraction?.Name,
                AuthorId = article.AuthorId,
                AuthorName = article.Author?.FullName,
                Title = article.Title,
                Slug = article.Slug,
                Summary = article.Summary,
                ThumbnailUrl = article.ThumbnailUrl,
                GalleryUrls = SplitGalleryUrls(article.GalleryUrls),
                Content = article.Content,
                PublishedAt = AsUtc(article.PublishedAt),
                CreatedAt = AsUtc(article.CreatedAt),
                UpdatedAt = AsUtc(article.UpdatedAt),
                Status = article.Status,
                IsApproved = article.IsApproved,
                IsDeleted = article.IsDeleted,
                ApprovedAt = AsUtc(article.ApprovedAt),
                ApprovedById = article.ApprovedById,
                ApprovedByName = article.ApprovedBy?.FullName,
                CommentCount = allComments.Count,
                Tags = SplitTags(article.Tags),
                Comments = BuildCommentTree(allComments)
            };
        }

        private static ArticleListItemDTO MapArticleListItem(Article article)
        {
            return new ArticleListItemDTO
            {
                Id = article.Id,
                CategoryId = article.CategoryId,
                CategoryName = article.Category?.Name,
                AttractionId = article.AttractionId,
                AttractionName = article.Attraction?.Name,
                AuthorId = article.AuthorId,
                AuthorName = article.Author?.FullName,
                Title = article.Title,
                Slug = article.Slug,
                Summary = article.Summary,
                ThumbnailUrl = article.ThumbnailUrl,
                GalleryUrls = SplitGalleryUrls(article.GalleryUrls),
                PublishedAt = AsUtc(article.PublishedAt),
                CreatedAt = AsUtc(article.CreatedAt),
                UpdatedAt = AsUtc(article.UpdatedAt),
                ApprovedAt = AsUtc(article.ApprovedAt),
                DeletedAt = AsUtc(article.DeletedAt),
                Status = article.Status,
                IsApproved = article.IsApproved,
                IsDeleted = article.IsDeleted,
                CommentCount = article.Comments.Count,
                Tags = SplitTags(article.Tags)
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
                    CreatedAt = AsUtc(c.CreatedAt)
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

            string slug;
            do
            {
                slug = $"{baseSlug}-{RandomNumberGenerator.GetInt32(1000, 10000)}";
            }
            while (await _context.Articles.IgnoreQueryFilters().AnyAsync(a => a.Slug == slug && (!ignoreArticleId.HasValue || a.Id != ignoreArticleId.Value)));

            return slug;
        }

        private static string BuildNewsFolder(string slug)
        {
            return $"home/News/{slug}";
        }

        private static DateTime AsUtc(DateTime value)
        {
            return value.Kind == DateTimeKind.Utc
                ? value
                : DateTime.SpecifyKind(value, DateTimeKind.Utc);
        }

        private static DateTime? AsUtc(DateTime? value)
        {
            return value.HasValue ? AsUtc(value.Value) : null;
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

        private static string? NormalizeGalleryUrls(string? galleryUrls, string? thumbnailUrl = null)
        {
            var normalized = SplitGalleryUrls(galleryUrls);

            return normalized.Count == 0 ? null : string.Join("\n", normalized);
        }

        private static List<string> SplitTags(string? tags)
        {
            return (tags ?? string.Empty)
                .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .ToList();
        }

        private static List<string> SplitGalleryUrls(string? galleryUrls)
        {
            return (galleryUrls ?? string.Empty)
                .Split(new[] { '\n', '\r', ',' }, StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
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
