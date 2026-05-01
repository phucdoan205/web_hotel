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
            var query = _context.Attractions.AsNoTracking();

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

        [HttpGet("{id}")]
        [Permission("VIEW_ATTRACTIONS")]
        public async Task<ActionResult<AttractionDTO>> GetAttraction(int id)
        {
            var attraction = await _context.Attractions
                .AsNoTracking()
                .FirstOrDefaultAsync(a => a.Id == id);

            if (attraction == null)
            {
                return NotFound();
            }

            return Ok(_mapper.Map<AttractionDTO>(attraction));
        }

        [HttpPost]
        [Consumes("multipart/form-data")]
        [RequestSizeLimit(20_000_000)]
        [Permission("CREATE_ATTRACTIONS")]
        public async Task<IActionResult> Create([FromForm] CreateAttractionDTO dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Name))
            {
                return BadRequest("Ten dia diem la bat buoc.");
            }

            var entity = new Attraction
            {
                Name = dto.Name.Trim(),
                Category = NormalizeOptional(dto.Category),
                DistanceKm = dto.DistanceKm,
                Description = NormalizeOptional(dto.Description),
                MapEmbedLink = NormalizeOptional(dto.MapEmbedLink),
                Address = NormalizeOptional(dto.Address),
                IsActive = dto.IsActive,
                ImageUrl = NormalizeOptional(dto.ImageUrl)
            };

            if (!TryApplyCoordinates(entity, dto.MapEmbedLink, dto.Latitude, dto.Longitude, out var coordinateError))
            {
                return BadRequest(coordinateError);
            }

            if (dto.ImageFile != null)
            {
                var uploadedUrl = await _cloudinaryService.UploadImageAsync(
                    dto.ImageFile,
                    BuildAttractionFolder(entity.Name));

                if (string.IsNullOrWhiteSpace(uploadedUrl))
                {
                    return StatusCode(500, "Upload anh dia diem len Cloudinary that bai.");
                }

                entity.ImageUrl = uploadedUrl;
            }

            _context.Attractions.Add(entity);
            await _context.SaveChangesAsync();

            var result = _mapper.Map<AttractionDTO>(entity);
            return CreatedAtAction(nameof(GetAttraction), new { id = entity.Id }, result);
        }

        [HttpPut("{id}")]
        [Consumes("multipart/form-data")]
        [RequestSizeLimit(20_000_000)]
        [Permission("EDIT_ATTRACTIONS")]
        public async Task<IActionResult> Update(int id, [FromForm] UpdateAttractionDTO dto)
        {
            var attraction = await _context.Attractions.FindAsync(id);
            if (attraction == null)
            {
                return NotFound();
            }

            var oldImageUrl = attraction.ImageUrl;

            if (dto.Name != null)
            {
                var normalizedName = dto.Name.Trim();
                if (string.IsNullOrWhiteSpace(normalizedName))
                {
                    return BadRequest("Ten dia diem la bat buoc.");
                }

                attraction.Name = normalizedName;
            }

            if (dto.Category != null)
            {
                attraction.Category = NormalizeOptional(dto.Category);
            }

            if (dto.DistanceKm.HasValue)
            {
                attraction.DistanceKm = dto.DistanceKm.Value;
            }

            if (dto.Description != null)
            {
                attraction.Description = NormalizeOptional(dto.Description);
            }

            if (dto.MapEmbedLink != null)
            {
                attraction.MapEmbedLink = NormalizeOptional(dto.MapEmbedLink);
            }

            if (dto.Address != null)
            {
                attraction.Address = NormalizeOptional(dto.Address);
            }

            if (dto.IsActive.HasValue)
            {
                attraction.IsActive = dto.IsActive.Value;
            }

            if (dto.ImageUrl != null)
            {
                attraction.ImageUrl = NormalizeOptional(dto.ImageUrl);
            }

            if (!TryApplyCoordinates(attraction, dto.MapEmbedLink, dto.Latitude, dto.Longitude, out var coordinateError))
            {
                return BadRequest(coordinateError);
            }

            if (dto.ImageFile != null)
            {
                var uploadedUrl = await _cloudinaryService.UploadImageAsync(
                    dto.ImageFile,
                    BuildAttractionFolder(attraction.Name));

                if (string.IsNullOrWhiteSpace(uploadedUrl))
                {
                    return StatusCode(500, "Upload anh dia diem len Cloudinary that bai.");
                }

                attraction.ImageUrl = uploadedUrl;
            }

            await _context.SaveChangesAsync();

            if (dto.ImageFile != null &&
                !string.IsNullOrWhiteSpace(oldImageUrl) &&
                oldImageUrl != attraction.ImageUrl)
            {
                await _cloudinaryService.DeleteImageByUrlAsync(oldImageUrl);
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        [Permission("DELETE_ATTRACTIONS")]
        public async Task<IActionResult> Delete(int id)
        {
            var attraction = await _context.Attractions.FindAsync(id);
            if (attraction == null)
            {
                return NotFound();
            }

            _context.Attractions.Remove(attraction);
            await _context.SaveChangesAsync();

            if (!string.IsNullOrWhiteSpace(attraction.ImageUrl))
            {
                await _cloudinaryService.DeleteImageByUrlAsync(attraction.ImageUrl);
            }

            return NoContent();
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
