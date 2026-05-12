using AutoMapper;
using backend.Common;
using backend.Data;
using backend.DTOs.Attraction;
using backend.Models;
using backend.Security;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Globalization;
using System.Text;
using System.Text.RegularExpressions;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AttractionsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;
        private readonly CloudinaryService _cloudinaryService;

        public AttractionsController(
            AppDbContext context,
            IMapper mapper,
            CloudinaryService cloudinaryService)
        {
            _context = context;
            _mapper = mapper;
            _cloudinaryService = cloudinaryService;
        }

        [HttpGet]
        [Permission("VIEW_ATTRACTIONS")]
        public async Task<ActionResult<PagedResponse<AttractionDTO>>> GetAttractions(
            [FromQuery] bool? activeOnly = true,
            [FromQuery] string? search = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 15)
        {
            return await GetAttractionsInternal(activeOnly, search, page, pageSize);
        }

        [HttpGet("public")]
        public async Task<ActionResult<PagedResponse<AttractionDTO>>> GetPublicAttractions(
            [FromQuery] bool? activeOnly = true,
            [FromQuery] string? search = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 15)
        {
            return await GetAttractionsInternal(activeOnly, search, page, pageSize);
        }

        private async Task<ActionResult<PagedResponse<AttractionDTO>>> GetAttractionsInternal(
            bool? activeOnly,
            string? search,
            int page,
            int pageSize)
        {
            var missingSlugs = await _context.Attractions.Where(a => a.Slug == null).ToListAsync();
            if (missingSlugs.Any())
            {
                foreach (var a in missingSlugs)
                {
                    a.Slug = Slugify(a.Name);
                }
                await _context.SaveChangesAsync();
            }

            var query = _context.Attractions.Include(a => a.AttractionImages).AsNoTracking();

            if (activeOnly == true)
            {
                query = query.Where(a => a.IsActive);
            }

            if (!string.IsNullOrWhiteSpace(search))
            {
                var normalizedSearch = search.Trim();
                query = query.Where(a =>
                    a.Name.Contains(normalizedSearch) ||
                    (a.Category != null && a.Category.Contains(normalizedSearch)) ||
                    (a.Address != null && a.Address.Contains(normalizedSearch)) ||
                    (a.Description != null && a.Description.Contains(normalizedSearch)));
            }

            var totalCount = await query.CountAsync();

            var attractions = await query
                .OrderBy(a => a.Name)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var dtos = _mapper.Map<List<AttractionDTO>>(attractions);

            return Ok(new PagedResponse<AttractionDTO>(dtos, totalCount, page, pageSize));
        }

        [HttpGet("{idOrSlug}")]
        [Permission("VIEW_ATTRACTIONS")]
        public async Task<ActionResult<AttractionDTO>> GetAttraction(string idOrSlug)
        {
            return await GetAttractionInternal(idOrSlug);
        }

        [HttpGet("public/{idOrSlug}")]
        public async Task<ActionResult<AttractionDTO>> GetPublicAttraction(string idOrSlug)
        {
            return await GetAttractionInternal(idOrSlug);
        }

        private async Task<ActionResult<AttractionDTO>> GetAttractionInternal(string idOrSlug)
        {
            var isNumeric = int.TryParse(idOrSlug, out var id);
            
            var query = _context.Attractions
                .Include(a => a.AttractionImages)
                .AsNoTracking();
                
            var attraction = await (isNumeric 
                ? query.FirstOrDefaultAsync(a => a.Id == id)
                : query.FirstOrDefaultAsync(a => a.Slug == idOrSlug));

            if (attraction == null || !attraction.IsActive)
            {
                return NotFound();
            }

            return Ok(_mapper.Map<AttractionDTO>(attraction));
        }

        [HttpPost]
        [Permission("CREATE_ATTRACTIONS")]
        public async Task<IActionResult> Create([FromBody] AttractionUpsertDTO dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Name))
            {
                return BadRequest("Ten dia diem la bat buoc.");
            }

            var entity = new Attraction
            {
                Name = dto.Name.Trim(),
                Slug = Slugify(dto.Name),
                Category = NormalizeOptional(dto.Category),
                DistanceKm = dto.DistanceKm,
                Description = NormalizeOptional(dto.Description),
                MapEmbedLink = NormalizeOptional(dto.MapEmbedLink),
                Address = NormalizeOptional(dto.Address),
                IsActive = dto.IsActive,
                ImageUrl = NormalizeOptional(dto.ImageUrl),
                AttractionImages = dto.Images.Select(url => new AttractionImage { ImageUrl = url }).ToList()
            };

            if (!TryApplyCoordinates(entity, dto.MapEmbedLink, dto.Latitude, dto.Longitude, out var coordinateError))
            {
                return BadRequest(coordinateError);
            }

            _context.Attractions.Add(entity);
            await _context.SaveChangesAsync();

            var result = _mapper.Map<AttractionDTO>(entity);
            return CreatedAtAction(nameof(GetAttraction), new { id = entity.Id }, result);
        }

        [HttpPut("{id}")]
        [Permission("EDIT_ATTRACTIONS")]
        public async Task<IActionResult> Update(int id, [FromBody] AttractionUpsertDTO dto)
        {
            var attraction = await _context.Attractions
                .Include(a => a.AttractionImages)
                .FirstOrDefaultAsync(a => a.Id == id);

            if (attraction == null)
            {
                return NotFound();
            }

            if (dto.Name != null)
            {
                var normalizedName = dto.Name.Trim();
                if (string.IsNullOrWhiteSpace(normalizedName))
                {
                    return BadRequest("Ten dia diem la bat buoc.");
                }
                attraction.Name = normalizedName;
                attraction.Slug = Slugify(normalizedName);
            }

            attraction.Category = NormalizeOptional(dto.Category);
            attraction.DistanceKm = dto.DistanceKm;
            attraction.Description = NormalizeOptional(dto.Description);
            attraction.MapEmbedLink = NormalizeOptional(dto.MapEmbedLink);
            attraction.Address = NormalizeOptional(dto.Address);
            attraction.IsActive = dto.IsActive;

            // Delete old images from Cloudinary
            var currentImageUrls = attraction.AttractionImages.Select(img => img.ImageUrl).ToList();
            var newImageUrls = dto.Images;
            var imagesToDelete = currentImageUrls.Except(newImageUrls).ToList();

            if (!string.IsNullOrEmpty(attraction.ImageUrl) && attraction.ImageUrl != dto.ImageUrl)
            {
                imagesToDelete.Add(attraction.ImageUrl);
            }

            foreach (var imgUrl in imagesToDelete)
            {
                await _cloudinaryService.DeleteImageByUrlAsync(imgUrl);
            }

            attraction.ImageUrl = NormalizeOptional(dto.ImageUrl);

            if (!TryApplyCoordinates(attraction, dto.MapEmbedLink, dto.Latitude, dto.Longitude, out var coordinateError))
            {
                return BadRequest(coordinateError);
            }

            _context.AttractionImages.RemoveRange(attraction.AttractionImages);
            attraction.AttractionImages = dto.Images.Select(url => new AttractionImage { ImageUrl = url }).ToList();

            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete("{id}")]
        [Permission("DELETE_ATTRACTIONS")]
        public async Task<IActionResult> Delete(int id)
        {
            var attraction = await _context.Attractions
                .Include(a => a.AttractionImages)
                .FirstOrDefaultAsync(a => a.Id == id);

            if (attraction == null)
            {
                return NotFound();
            }

            if (!string.IsNullOrWhiteSpace(attraction.ImageUrl))
            {
                await _cloudinaryService.DeleteImageByUrlAsync(attraction.ImageUrl);
            }

            foreach (var img in attraction.AttractionImages)
            {
                await _cloudinaryService.DeleteImageByUrlAsync(img.ImageUrl);
            }

            _context.Attractions.Remove(attraction);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpPost("upload-images")]
        [Consumes("multipart/form-data")]
        [RequestSizeLimit(50_000_000)]
        [Permission("CREATE_ATTRACTIONS", "EDIT_ATTRACTIONS")]
        public async Task<ActionResult<object>> UploadAttractionImages([FromForm] List<IFormFile> files, [FromForm] string? attractionName = null)
        {
            if (files == null || files.Count == 0)
            {
                return BadRequest("Vui lòng chọn ít nhất một hình ảnh.");
            }

            var folderName = string.IsNullOrWhiteSpace(attractionName) ? "general" : Slugify(attractionName);
            var folder = $"Home/Attractions/{folderName}";

            var results = new List<string>();
            foreach (var file in files)
            {
                var uploadedUrl = await _cloudinaryService.UploadImageAsync(file, folder);
                if (!string.IsNullOrWhiteSpace(uploadedUrl))
                {
                    results.Add(uploadedUrl);
                }
            }

            if (results.Count == 0)
            {
                return StatusCode(500, "Upload ảnh lên Cloudinary thất bại.");
            }

            return Ok(new { urls = results, folder });
        }

        private static string? NormalizeOptional(string? value)
        {
            var normalized = value?.Trim();
            return string.IsNullOrWhiteSpace(normalized) ? null : normalized;
        }

        private static bool TryApplyCoordinates(
            Attraction attraction,
            string? mapEmbedLink,
            decimal? fallbackLatitude,
            decimal? fallbackLongitude,
            out string? error)
        {
            error = null;

            if (!string.IsNullOrWhiteSpace(mapEmbedLink))
            {
                if (TryExtractCoordinates(mapEmbedLink, out var latitude, out var longitude))
                {
                    attraction.Latitude = latitude;
                    attraction.Longitude = longitude;
                    return true;
                }

                if (fallbackLatitude.HasValue && fallbackLongitude.HasValue)
                {
                    attraction.Latitude = fallbackLatitude.Value;
                    attraction.Longitude = fallbackLongitude.Value;
                    return true;
                }

                error = "Khong the lay kinh do, vi do tu link Google Maps.";
                return false;
            }

            if (fallbackLatitude.HasValue && fallbackLongitude.HasValue)
            {
                attraction.Latitude = fallbackLatitude.Value;
                attraction.Longitude = fallbackLongitude.Value;
            }

            return true;
        }

        private static bool TryExtractCoordinates(string rawValue, out decimal latitude, out decimal longitude)
        {
            latitude = 0;
            longitude = 0;

            var value = ExtractMapSource(rawValue);
            if (string.IsNullOrWhiteSpace(value))
            {
                return false;
            }

            var decoded = Uri.UnescapeDataString(value.Trim());
            var directPatterns = new[]
            {
                @"[?&](?:q|query|ll|center)=(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)",
                @"@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)",
                @"!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)"
            };

            foreach (var pattern in directPatterns)
            {
                var match = Regex.Match(decoded, pattern, RegexOptions.IgnoreCase);
                if (!match.Success)
                {
                    continue;
                }

                if (!decimal.TryParse(match.Groups[1].Value, NumberStyles.Float, CultureInfo.InvariantCulture, out latitude) ||
                    !decimal.TryParse(match.Groups[2].Value, NumberStyles.Float, CultureInfo.InvariantCulture, out longitude))
                {
                    continue;
                }

                if (latitude is < -90 or > 90 || longitude is < -180 or > 180)
                {
                    continue;
                }

                return true;
            }

            // Common Google Maps embed URLs often encode longitude before latitude.
            var embedMatch = Regex.Match(
                decoded,
                @"!2d(-?\d+(?:\.\d+)?)!3d(-?\d+(?:\.\d+)?)",
                RegexOptions.IgnoreCase);

            if (embedMatch.Success &&
                decimal.TryParse(embedMatch.Groups[1].Value, NumberStyles.Float, CultureInfo.InvariantCulture, out var embedLongitude) &&
                decimal.TryParse(embedMatch.Groups[2].Value, NumberStyles.Float, CultureInfo.InvariantCulture, out var embedLatitude) &&
                embedLatitude is >= -90 and <= 90 &&
                embedLongitude is >= -180 and <= 180)
            {
                latitude = embedLatitude;
                longitude = embedLongitude;
                return true;
            }

            return false;
        }

        private static string ExtractMapSource(string value)
        {
            var match = Regex.Match(value, "src=[\"']([^\"']+)[\"']", RegexOptions.IgnoreCase);
            return match.Success ? match.Groups[1].Value : value;
        }

        private static string BuildAttractionFolder(string attractionName)
        {
            return $"Home/Attractions/{Slugify(attractionName)}";
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
