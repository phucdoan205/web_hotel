using backend.Common;
using backend.Data;
using backend.DTOs.Service;
using backend.Models;
using backend.Security;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Tags("Services")]
    public class ServicesController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly CloudinaryService _cloudinaryService;

        public ServicesController(AppDbContext context, CloudinaryService cloudinaryService)
        {
            _context = context;
            _cloudinaryService = cloudinaryService;
        }

        private static ServiceResponseDTO MapService(Service service) => new()
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
            Images = service.ServiceImages.Select(img => img.ImageUrl).ToList()
        };

        private static ServiceUsageResponseDTO MapUsage(OrderServiceDetail detail) => new()
        {
            Id = detail.Id,
            OrderServiceId = detail.OrderServiceId ?? 0,
            BookingId = detail.OrderService?.BookingDetail?.BookingId,
            BookingDetailId = detail.OrderService?.BookingDetailId,
            BookingCode = detail.OrderService?.BookingDetail?.Booking?.BookingCode ?? string.Empty,
            RoomNumber = detail.OrderService?.BookingDetail?.Room?.RoomNumber ?? "--",
            RoomName = detail.OrderService?.BookingDetail?.RoomType?.Name ?? "Phòng",
            GuestName = detail.OrderService?.BookingDetail?.Booking?.Guest?.Name ?? "Khách",
            ServiceId = detail.ServiceId ?? 0,
            ServiceName = detail.Service?.Name ?? "Dịch vụ",
            Quantity = detail.Quantity,
            UnitPrice = detail.UnitPrice,
            LineTotal = detail.UnitPrice * detail.Quantity,
            UsedAt = detail.OrderService?.OrderDate,
            PaymentStatus = string.Equals(detail.OrderService?.Status, "Paid", StringComparison.OrdinalIgnoreCase)
                ? "Paid"
                : "Unpaid"
        };

        [HttpGet]
        [Permission("VIEW_SERVICES")]
        public async Task<ActionResult<IEnumerable<ServiceResponseDTO>>> GetServices([FromQuery] bool includeInactive = true)
        {
            var query = _context.Services.AsNoTracking().AsQueryable();

            if (!includeInactive)
            {
                query = query.Where(service => service.Status);
            }

            var services = await query
                .Include(service => service.Category)
                .Include(service => service.ServiceImages)
                .OrderByDescending(service => service.Status)
                .ThenBy(service => service.Name)
                .ToListAsync();

            return Ok(services.Select(MapService));
        }

        [HttpGet("{id:int}")]
        [Permission("VIEW_SERVICES")]
        public async Task<ActionResult<ServiceResponseDTO>> GetService(int id)
        {
            var service = await _context.Services
                .AsNoTracking()
                .Include(service => service.Category)
                .Include(service => service.ServiceImages)
                .FirstOrDefaultAsync(item => item.Id == id);

            if (service == null)
            {
                return NotFound("Không tìm thấy dịch vụ.");
            }

            return Ok(MapService(service));
        }

        [HttpGet("in-house")]
        [Permission("VIEW_SERVICES")]
        public async Task<ActionResult<IEnumerable<InHouseRoomResponseDTO>>> GetInHouseRooms()
        {
            var rooms = await _context.BookingDetails
                .AsNoTracking()
                .Include(detail => detail.Booking)
                    .ThenInclude(booking => booking!.Guest)
                .Include(detail => detail.Room)
                .Include(detail => detail.RoomType)
                .Where(detail => detail.Status == "CheckedIn")
                .OrderBy(detail => detail.Room != null ? detail.Room.RoomNumber : string.Empty)
                .Select(detail => new InHouseRoomResponseDTO
                {
                    BookingId = detail.BookingId ?? 0,
                    BookingDetailId = detail.Id,
                    BookingCode = detail.Booking != null ? detail.Booking.BookingCode : string.Empty,
                    RoomNumber = detail.Room != null ? detail.Room.RoomNumber : "--",
                    RoomName = detail.RoomType != null ? detail.RoomType.Name : "Phòng",
                    GuestName = detail.Booking != null && detail.Booking.Guest != null
                        ? detail.Booking.Guest.Name ?? "Khách"
                        : "Khách",
                    CheckInDate = detail.CheckInDate,
                    CheckOutDate = detail.CheckOutDate
                })
                .ToListAsync();

            return Ok(rooms);
        }

        [HttpGet("history")]
        [Permission("VIEW_SERVICES")]
        public async Task<ActionResult<IEnumerable<ServiceUsageResponseDTO>>> GetUsageHistory(
            [FromQuery] string? paymentStatus = null,
            [FromQuery] int? bookingDetailId = null,
            [FromQuery] string? search = null)
        {
            var query = _context.OrderServiceDetails
                .AsNoTracking()
                .Include(detail => detail.Service)
                .Include(detail => detail.OrderService)
                    .ThenInclude(order => order!.BookingDetail)
                        .ThenInclude(bookingDetail => bookingDetail!.Booking)
                            .ThenInclude(booking => booking!.Guest)
                .Include(detail => detail.OrderService)
                    .ThenInclude(order => order!.BookingDetail)
                        .ThenInclude(bookingDetail => bookingDetail!.Room)
                .Include(detail => detail.OrderService)
                    .ThenInclude(order => order!.BookingDetail)
                        .ThenInclude(bookingDetail => bookingDetail!.RoomType)
                .AsQueryable();

            if (bookingDetailId.HasValue)
            {
                query = query.Where(detail => detail.OrderService != null && detail.OrderService.BookingDetailId == bookingDetailId.Value);
            }

            if (!string.IsNullOrWhiteSpace(paymentStatus))
            {
                var normalizedStatus = paymentStatus.Trim().ToLowerInvariant();
                if (normalizedStatus == "paid")
                {
                    query = query.Where(detail => detail.OrderService != null && detail.OrderService.Status == "Paid");
                }
                else if (normalizedStatus == "unpaid")
                {
                    query = query.Where(detail => detail.OrderService == null || detail.OrderService.Status != "Paid");
                }
            }

            if (!string.IsNullOrWhiteSpace(search))
            {
                var normalizedSearch = search.Trim().ToLowerInvariant();
                query = query.Where(detail =>
                    (detail.Service != null && detail.Service.Name.ToLower().Contains(normalizedSearch)) ||
                    (detail.OrderService != null &&
                        detail.OrderService.BookingDetail != null &&
                        ((detail.OrderService.BookingDetail.Room != null &&
                          detail.OrderService.BookingDetail.Room.RoomNumber.ToLower().Contains(normalizedSearch)) ||
                         (detail.OrderService.BookingDetail.Booking != null &&
                          detail.OrderService.BookingDetail.Booking.BookingCode.ToLower().Contains(normalizedSearch)) ||
                         (detail.OrderService.BookingDetail.Booking != null &&
                          detail.OrderService.BookingDetail.Booking.Guest != null &&
                          (detail.OrderService.BookingDetail.Booking.Guest.Name ?? string.Empty).ToLower().Contains(normalizedSearch)))));
            }

            var items = await query
                .OrderByDescending(detail => detail.OrderService != null ? detail.OrderService.OrderDate : DateTime.MinValue)
                .ThenByDescending(detail => detail.Id)
                .ToListAsync();

            return Ok(items.Select(MapUsage));
        }

        [HttpPost("apply")]
        [Permission("CREATE_SERVICES")]
        public async Task<ActionResult<ServiceUsageResponseDTO>> ApplyService([FromBody] ApplyServiceDTO request)
        {
            if (!request.BookingDetailId.HasValue || !request.ServiceId.HasValue)
            {
                return BadRequest("Thiếu phòng hoặc dịch vụ cần áp dụng.");
            }

            if (request.Quantity <= 0)
            {
                return BadRequest("Số lượng phải lớn hơn 0.");
            }

            var bookingDetail = await _context.BookingDetails
                .Include(detail => detail.Booking)
                    .ThenInclude(booking => booking!.Guest)
                .Include(detail => detail.Room)
                .Include(detail => detail.RoomType)
                .FirstOrDefaultAsync(detail => detail.Id == request.BookingDetailId.Value);

            if (bookingDetail == null)
            {
                return NotFound("Không tìm thấy phòng lưu trú.");
            }

            if (!string.Equals(bookingDetail.Status, "CheckedIn", StringComparison.OrdinalIgnoreCase))
            {
                return BadRequest("Chỉ được áp dụng dịch vụ cho phòng đang lưu trú.");
            }

            var service = await _context.Services.FirstOrDefaultAsync(item => item.Id == request.ServiceId.Value);
            if (service == null || !service.Status)
            {
                return NotFound("Không tìm thấy dịch vụ đang hoạt động.");
            }

            var orderService = new OrderService
            {
                BookingDetailId = bookingDetail.Id,
                OrderDate = DateTime.UtcNow,
                Status = "Unpaid",
                TotalAmount = service.Price * request.Quantity
            };

            var orderServiceDetail = new OrderServiceDetail
            {
                ServiceId = service.Id,
                Quantity = request.Quantity,
                UnitPrice = service.Price,
                OrderService = orderService
            };

            _context.OrderServices.Add(orderService);
            _context.OrderServiceDetails.Add(orderServiceDetail);
            await _context.SaveChangesAsync();

            orderService.BookingDetail = bookingDetail;
            orderServiceDetail.OrderServiceId = orderService.Id;
            orderServiceDetail.OrderService = orderService;
            orderServiceDetail.Service = service;

            return Created($"/api/Services/history?bookingDetailId={bookingDetail.Id}", MapUsage(orderServiceDetail));
        }

        [HttpPost]
        [Permission("CREATE_SERVICES")]
        public async Task<ActionResult<ServiceResponseDTO>> CreateService([FromBody] ServiceUpsertDTO request)
        {
            if (string.IsNullOrWhiteSpace(request.Name))
            {
                return BadRequest("Tên dịch vụ là bắt buộc.");
            }

            if (request.Price < 0)
            {
                return BadRequest("Giá dịch vụ không hợp lệ.");
            }

            var service = new Service
            {
                CategoryId = request.CategoryId,
                Name = request.Name.Trim(),
                ThumbnailUrl = request.ThumbnailUrl,
                Description = request.Description,
                Price = request.Price,
                Unit = string.IsNullOrWhiteSpace(request.Unit) ? null : request.Unit.Trim(),
                Status = request.Status,
                ServiceImages = request.Images.Select(url => new ServiceImage { ImageUrl = url }).ToList()
            };

            _context.Services.Add(service);
            await _context.SaveChangesAsync();

            return Created($"/api/Services/{service.Id}", MapService(service));
        }

        [HttpPut("{id:int}")]
        [Permission("EDIT_SERVICES")]
        public async Task<ActionResult<ServiceResponseDTO>> UpdateService(int id, [FromBody] ServiceUpsertDTO request)
        {
            var service = await _context.Services
                .Include(s => s.ServiceImages)
                .FirstOrDefaultAsync(item => item.Id == id);

            if (service == null)
            {
                return NotFound("Không tìm thấy dịch vụ.");
            }

            if (string.IsNullOrWhiteSpace(request.Name))
            {
                return BadRequest("Tên dịch vụ là bắt buộc.");
            }

            if (request.Price < 0)
            {
                return BadRequest("Giá dịch vụ không hợp lệ.");
            }

            // Identify images to delete from Cloudinary
            var currentImageUrls = service.ServiceImages.Select(img => img.ImageUrl).ToList();
            var newImageUrls = request.Images;
            var imagesToDelete = currentImageUrls.Except(newImageUrls).ToList();

            // Also check thumbnail
            if (!string.IsNullOrEmpty(service.ThumbnailUrl) && service.ThumbnailUrl != request.ThumbnailUrl)
            {
                imagesToDelete.Add(service.ThumbnailUrl);
            }

            foreach (var imageUrl in imagesToDelete)
            {
                await _cloudinaryService.DeleteImageByUrlAsync(imageUrl);
            }

            service.CategoryId = request.CategoryId;
            service.Name = request.Name.Trim();
            service.ThumbnailUrl = request.ThumbnailUrl;
            service.Description = request.Description;
            service.Price = request.Price;
            service.Unit = string.IsNullOrWhiteSpace(request.Unit) ? null : request.Unit.Trim();
            service.Status = request.Status;

            // Update images in database
            _context.ServiceImages.RemoveRange(service.ServiceImages);
            service.ServiceImages = request.Images.Select(url => new ServiceImage { ImageUrl = url }).ToList();

            await _context.SaveChangesAsync();

            return Ok(MapService(service));
        }

        [HttpDelete("{id:int}")]
        [Permission("DELETE_SERVICES")]
        public async Task<IActionResult> DeleteService(int id)
        {
            var service = await _context.Services
                .Include(s => s.ServiceImages)
                .FirstOrDefaultAsync(item => item.Id == id);

            if (service == null)
            {
                return NotFound("Không tìm thấy dịch vụ.");
            }

            // Cleanup Cloudinary
            if (!string.IsNullOrEmpty(service.ThumbnailUrl))
            {
                await _cloudinaryService.DeleteImageByUrlAsync(service.ThumbnailUrl);
            }

            foreach (var img in service.ServiceImages)
            {
                await _cloudinaryService.DeleteImageByUrlAsync(img.ImageUrl);
            }

            _context.Services.Remove(service);
            await _context.SaveChangesAsync();

            return NoContent();
        }
        [HttpPost("upload-images")]
        [Consumes("multipart/form-data")]
        [RequestSizeLimit(50_000_000)]
        [Permission("CREATE_SERVICES", "EDIT_SERVICES")]
        public async Task<ActionResult<object>> UploadServiceImages([FromForm] List<IFormFile> files, [FromForm] string? serviceName = null)
        {
            if (files == null || files.Count == 0)
            {
                return BadRequest("Vui lòng chọn ít nhất một hình ảnh.");
            }

            var folderName = Slugify(serviceName);
            var folder = string.IsNullOrWhiteSpace(folderName)
                ? "home/services/general"
                : $"home/services/{folderName}";

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

        private static string Slugify(string? value)
        {
            if (string.IsNullOrWhiteSpace(value))
            {
                return string.Empty;
            }

            var builder = new StringBuilder();
            foreach (var ch in value.Trim().ToLowerInvariant())
            {
                if (char.IsLetterOrDigit(ch))
                {
                    builder.Append(ch);
                }
                else if (builder.Length > 0 && builder[^1] != '-')
                {
                    builder.Append('-');
                }
            }

            return builder.ToString().Trim('-');
        }
    }
}
