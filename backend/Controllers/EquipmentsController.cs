using System.Globalization;
using System.Text;
using backend.Data;
using backend.DTOs.Equipment;
using backend.Models;
using backend.Security;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Tags("Equipments")]
    public class EquipmentsController : ControllerBase
    {
        private static readonly string[] DefaultCategories =
        [
            "Điện tử",
            "Đồ vải",
            "Minibar"
        ];

        private readonly AppDbContext _context;
        private readonly CloudinaryService _cloudinaryService;

        public EquipmentsController(AppDbContext context, CloudinaryService cloudinaryService)
        {
            _context = context;
            _cloudinaryService = cloudinaryService;
        }

        [HttpGet("summary")]
        [Permission("VIEW_INVENTORY")]
        public async Task<ActionResult<EquipmentSummaryDTO>> GetSummary()
        {
            var summarySource = await _context.Equipments
                .AsNoTracking()
                .Where(e => e.IsActive)
                .ToListAsync();

            return Ok(new EquipmentSummaryDTO
            {
                TotalQuantity = summarySource.Sum(e => e.TotalQuantity),
                InUseQuantity = summarySource.Sum(e => e.InUseQuantity),
                InStockQuantity = summarySource.Sum(e => CalculateInStockQuantity(
                    e.TotalQuantity,
                    e.InUseQuantity,
                    e.DamagedQuantity,
                    e.LiquidatedQuantity))
            });
        }

        [HttpGet]
        [Permission("VIEW_INVENTORY")]
        public async Task<ActionResult<EquipmentListResponseDTO>> GetList(
            [FromQuery] string? search = null,
            [FromQuery] string? category = null,
            [FromQuery] string? quantitySort = "desc",
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            page = page < 1 ? 1 : page;
            pageSize = pageSize <= 0 ? 10 : Math.Min(pageSize, 100);

            var query = _context.Equipments
                .AsNoTracking()
                .Where(e => e.IsActive);

            if (!string.IsNullOrWhiteSpace(search))
            {
                var normalizedSearch = search.Trim().ToLower();
                query = query.Where(e =>
                    e.ItemCode.ToLower().Contains(normalizedSearch) ||
                    e.Name.ToLower().Contains(normalizedSearch) ||
                    (e.Supplier != null && e.Supplier.ToLower().Contains(normalizedSearch)));
            }

            if (!string.IsNullOrWhiteSpace(category) &&
                !string.Equals(category.Trim(), "all", StringComparison.OrdinalIgnoreCase))
            {
                var normalizedCategory = category.Trim().ToLower();
                query = query.Where(e => e.Category.ToLower() == normalizedCategory);
            }

            query = string.Equals(quantitySort, "asc", StringComparison.OrdinalIgnoreCase)
                ? query.OrderBy(e => e.TotalQuantity).ThenBy(e => e.Name)
                : query.OrderByDescending(e => e.TotalQuantity).ThenBy(e => e.Name);

            var totalCount = await query.CountAsync();
            var equipments = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var categories = await _context.Equipments
                .AsNoTracking()
                .Where(e => e.IsActive)
                .Select(e => e.Category)
                .Distinct()
                .OrderBy(c => c)
                .ToListAsync();

            var mergedCategories = DefaultCategories
                .Concat(categories)
                .Where(c => !string.IsNullOrWhiteSpace(c))
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .OrderBy(c => c)
                .ToList();

            return Ok(new EquipmentListResponseDTO
            {
                Items = equipments.Select(MapEquipment).ToList(),
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize,
                Categories = mergedCategories,
                Summary = new EquipmentSummaryDTO()
            });
        }

        [HttpGet("{id:int}")]
        [Permission("VIEW_INVENTORY")]
        public async Task<ActionResult<EquipmentListItemDTO>> GetById(int id)
        {
            var equipment = await _context.Equipments
                .AsNoTracking()
                .FirstOrDefaultAsync(e => e.Id == id && e.IsActive);

            if (equipment == null)
            {
                return NotFound("Khong tim thay vat tu.");
            }

            return Ok(MapEquipment(equipment));
        }

        [HttpPost]
        [Consumes("multipart/form-data")]
        [RequestSizeLimit(20_000_000)]
        public async Task<ActionResult<EquipmentListItemDTO>> Create([FromForm] EquipmentUpsertRequestDTO request)
        {
            var normalizedItemCode = NormalizeRequired(request.ItemCode);
            var normalizedName = NormalizeRequired(request.Name);
            var normalizedCategory = NormalizeRequired(request.Category);
            var normalizedUnit = NormalizeRequired(request.Unit);
            var normalizedSupplier = NormalizeOptional(request.Supplier);

            if (string.IsNullOrWhiteSpace(normalizedItemCode) ||
                string.IsNullOrWhiteSpace(normalizedName) ||
                string.IsNullOrWhiteSpace(normalizedCategory) ||
                string.IsNullOrWhiteSpace(normalizedUnit))
            {
                return BadRequest("Ma vat tu, ten vat tu, danh muc va don vi tinh la bat buoc.");
            }

            var validationError = ValidateEquipmentRequest(
                request.TotalQuantity,
                request.InUseQuantity,
                request.DamagedQuantity,
                request.LiquidatedQuantity,
                request.BasePrice,
                request.DefaultPriceIfLost);

            if (validationError != null)
            {
                return BadRequest(validationError);
            }

            var itemCodeExists = await _context.Equipments.AnyAsync(e => e.ItemCode == normalizedItemCode);
            if (itemCodeExists)
            {
                return BadRequest("Ma vat tu da ton tai.");
            }

            var equipment = new Equipment
            {
                ItemCode = normalizedItemCode,
                Name = normalizedName,
                Category = normalizedCategory,
                Unit = normalizedUnit,
                TotalQuantity = request.TotalQuantity,
                InUseQuantity = request.InUseQuantity,
                DamagedQuantity = request.DamagedQuantity,
                LiquidatedQuantity = request.LiquidatedQuantity,
                InStockQuantity = CalculateInStockQuantity(
                    request.TotalQuantity,
                    request.InUseQuantity,
                    request.DamagedQuantity,
                    request.LiquidatedQuantity),
                BasePrice = request.BasePrice,
                DefaultPriceIfLost = request.DefaultPriceIfLost,
                Supplier = normalizedSupplier,
                IsActive = request.IsActive,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            if (request.ImageFile != null)
            {
                var folder = BuildEquipmentFolder(normalizedCategory);
                var uploadedUrl = await _cloudinaryService.UploadImageAsync(request.ImageFile, folder);

                if (string.IsNullOrWhiteSpace(uploadedUrl))
                {
                    return StatusCode(500, "Upload anh vat tu len Cloudinary that bai.");
                }

                equipment.ImageUrl = uploadedUrl;
            }

            _context.Equipments.Add(equipment);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = equipment.Id }, MapEquipment(equipment));
        }

        [HttpPut("{id:int}")]
        [Consumes("multipart/form-data")]
        [RequestSizeLimit(20_000_000)]
        public async Task<ActionResult<EquipmentListItemDTO>> Update(int id, [FromForm] EquipmentUpsertRequestDTO request)
        {
            var equipment = await _context.Equipments.FirstOrDefaultAsync(e => e.Id == id && e.IsActive);
            if (equipment == null)
            {
                return NotFound("Khong tim thay vat tu.");
            }

            var normalizedItemCode = NormalizeRequired(request.ItemCode);
            var normalizedName = NormalizeRequired(request.Name);
            var normalizedCategory = NormalizeRequired(request.Category);
            var normalizedUnit = NormalizeRequired(request.Unit);
            var normalizedSupplier = NormalizeOptional(request.Supplier);

            if (string.IsNullOrWhiteSpace(normalizedItemCode) ||
                string.IsNullOrWhiteSpace(normalizedName) ||
                string.IsNullOrWhiteSpace(normalizedCategory) ||
                string.IsNullOrWhiteSpace(normalizedUnit))
            {
                return BadRequest("Ma vat tu, ten vat tu, danh muc va don vi tinh la bat buoc.");
            }

            var validationError = ValidateEquipmentRequest(
                request.TotalQuantity,
                request.InUseQuantity,
                request.DamagedQuantity,
                request.LiquidatedQuantity,
                request.BasePrice,
                request.DefaultPriceIfLost);

            if (validationError != null)
            {
                return BadRequest(validationError);
            }

            var duplicatedItemCode = await _context.Equipments.AnyAsync(e =>
                e.Id != id &&
                e.ItemCode == normalizedItemCode);

            if (duplicatedItemCode)
            {
                return BadRequest("Ma vat tu da ton tai.");
            }

            var oldImageUrl = equipment.ImageUrl;

            equipment.ItemCode = normalizedItemCode;
            equipment.Name = normalizedName;
            equipment.Category = normalizedCategory;
            equipment.Unit = normalizedUnit;
            equipment.TotalQuantity = request.TotalQuantity;
            equipment.InUseQuantity = request.InUseQuantity;
            equipment.DamagedQuantity = request.DamagedQuantity;
            equipment.LiquidatedQuantity = request.LiquidatedQuantity;
            equipment.InStockQuantity = CalculateInStockQuantity(
                request.TotalQuantity,
                request.InUseQuantity,
                request.DamagedQuantity,
                request.LiquidatedQuantity);
            equipment.BasePrice = request.BasePrice;
            equipment.DefaultPriceIfLost = request.DefaultPriceIfLost;
            equipment.Supplier = normalizedSupplier;
            equipment.IsActive = request.IsActive;
            equipment.UpdatedAt = DateTime.UtcNow;

            if (request.ImageFile != null)
            {
                var folder = BuildEquipmentFolder(normalizedCategory);
                var uploadedUrl = await _cloudinaryService.UploadImageAsync(request.ImageFile, folder);

                if (string.IsNullOrWhiteSpace(uploadedUrl))
                {
                    return StatusCode(500, "Upload anh vat tu len Cloudinary that bai.");
                }

                equipment.ImageUrl = uploadedUrl;
            }

            await _context.SaveChangesAsync();

            if (request.ImageFile != null && !string.IsNullOrWhiteSpace(oldImageUrl) && oldImageUrl != equipment.ImageUrl)
            {
                await _cloudinaryService.DeleteImageByUrlAsync(oldImageUrl);
            }

            return Ok(MapEquipment(equipment));
        }

        private static EquipmentListItemDTO MapEquipment(Equipment equipment)
        {
            return new EquipmentListItemDTO
            {
                Id = equipment.Id,
                ItemCode = equipment.ItemCode,
                Name = equipment.Name,
                Category = equipment.Category,
                Unit = equipment.Unit,
                TotalQuantity = equipment.TotalQuantity,
                InUseQuantity = equipment.InUseQuantity,
                DamagedQuantity = equipment.DamagedQuantity,
                LiquidatedQuantity = equipment.LiquidatedQuantity,
                InStockQuantity = CalculateInStockQuantity(
                    equipment.TotalQuantity,
                    equipment.InUseQuantity,
                    equipment.DamagedQuantity,
                    equipment.LiquidatedQuantity),
                BasePrice = equipment.BasePrice,
                DefaultPriceIfLost = equipment.DefaultPriceIfLost,
                Supplier = equipment.Supplier,
                ImageUrl = equipment.ImageUrl,
                IsActive = equipment.IsActive,
                UpdatedAt = equipment.UpdatedAt
            };
        }

        private static string? ValidateEquipmentRequest(
            int totalQuantity,
            int inUseQuantity,
            int damagedQuantity,
            int liquidatedQuantity,
            decimal basePrice,
            decimal defaultPriceIfLost)
        {
            if (totalQuantity < 0 || inUseQuantity < 0 || damagedQuantity < 0 || liquidatedQuantity < 0)
            {
                return "So luong khong duoc am.";
            }

            if (basePrice < 0 || defaultPriceIfLost < 0)
            {
                return "Gia khong duoc am.";
            }

            var remainingQuantity = totalQuantity - inUseQuantity - damagedQuantity - liquidatedQuantity;
            if (remainingQuantity < 0)
            {
                return "Tong so luong phai lon hon hoac bang tong dang su dung, hong va thanh ly.";
            }

            return null;
        }

        private static int CalculateInStockQuantity(int totalQuantity, int inUseQuantity, int damagedQuantity, int liquidatedQuantity)
        {
            return Math.Max(0, totalQuantity - inUseQuantity - damagedQuantity - liquidatedQuantity);
        }

        private static string NormalizeRequired(string? value)
        {
            return value?.Trim() ?? string.Empty;
        }

        private static string? NormalizeOptional(string? value)
        {
            var normalized = value?.Trim();
            return string.IsNullOrWhiteSpace(normalized) ? null : normalized;
        }

        private static string BuildEquipmentFolder(string category)
        {
            return $"home/equipment/{Slugify(category)}";
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
