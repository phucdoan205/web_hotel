using AutoMapper;
using backend.Common;
using backend.Data;
using backend.DTOs.Room;
using backend.Models;
//using backend.Validators;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Linq.Dynamic.Core;
using System.Text;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RoomsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;
        private readonly CloudinaryService _cloudinaryService;

        public RoomsController(AppDbContext context, IMapper mapper, CloudinaryService cloudinaryService)
        {
            _context = context;
            _mapper = mapper;
            _cloudinaryService = cloudinaryService;
        }

        // GET: api/rooms
        [HttpGet]
        public async Task<ActionResult<PagedResult<RoomDetailDTO>>> GetRooms(
        [FromQuery] string? search = null,
        [FromQuery] string? status = null,
        [FromQuery] string? cleaningStatus = null,
        [FromQuery] int? roomTypeId = null,
        [FromQuery] int? floor = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 15)
        {
            var query = _context.Rooms
            .Include(r => r.RoomType)
            .ThenInclude(rt => rt!.RoomTypeAmenities)
            .ThenInclude(rta => rta.Amenity)
            .Include(r => r.RoomImages)
            .Include(r => r.RoomInventory)
            .ThenInclude(ri => ri.Equipment)
            .AsNoTracking();

            // Áp dụng filter
            if (!string.IsNullOrWhiteSpace(search))
                query = query.Where(r => r.RoomNumber.Contains(search.Trim()));

            if (!string.IsNullOrEmpty(status))
                query = query.Where(r => r.Status == status);

            if (!string.IsNullOrEmpty(cleaningStatus))
                query = query.Where(r => r.CleaningStatus == cleaningStatus);

            if (roomTypeId.HasValue)
                query = query.Where(r => r.RoomTypeId == roomTypeId.Value);

            if (floor.HasValue)
                query = query.Where(r => r.Floor == floor.Value);

            // Đếm tổng trước khi phân trang
            var totalCount = await query.CountAsync();

            // Lấy dữ liệu trang hiện tại
            var rooms = await query
                .OrderBy(r => r.RoomNumber)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            try
            {
                var dtos = _mapper.Map<List<RoomDetailDTO>>(rooms);
                var result = new PagedResponse<RoomDetailDTO>(
                    items: dtos,
                    totalCount: totalCount,
                    page: page,
                    pageSize: pageSize
                );

                return Ok(result);
            }
            catch (AutoMapperMappingException ex)
            {
                return StatusCode(500, new
                {
                    Error = "AutoMapper error",
                    Message = ex.Message,
                    Inner = ex.InnerException?.Message,
                    Stack = ex.InnerException?.StackTrace
                });
            }
        }

        // GET: api/rooms/5 (chi tiết)
        [HttpGet("{id}")]
        public async Task<ActionResult<RoomDetailDTO>> GetRoom(int id)
        {
            var room = await _context.Rooms
                .Include(r => r.RoomType).ThenInclude(rt => rt!.RoomTypeAmenities).ThenInclude(rta => rta.Amenity)
                .Include(r => r.RoomImages)
                .Include(r => r.RoomInventory)
                .ThenInclude(ri => ri.Equipment)
                .AsNoTracking()
                .FirstOrDefaultAsync(r => r.Id == id);

            if (room == null) return NotFound();

            return Ok(_mapper.Map<RoomDetailDTO>(room));
        }

        // POST: api/rooms
        [HttpPost]
        public async Task<ActionResult<RoomDetailDTO>> Create([FromBody] CreateRoomDTO dto)
        {

            //var validation = await _createValidator.ValidateAsync(dto);
            //if (!validation.IsValid) return BadRequest(validation.Errors);

            var room = _mapper.Map<Room>(dto);
            room.Status ??= RoomStatuses.Available;
            room.CleaningStatus ??= RoomCleaningStatuses.Dirty;
            if (dto.ImageUrls?.Any() == true)
            {
                room.RoomImages = dto.ImageUrls
                    .Where(url => !string.IsNullOrWhiteSpace(url))
                    .Select((url, index) => new RoomImage
                    {
                        ImageUrl = url.Trim(),
                        IsPrimary = index == 0
                    })
                    .ToList();
            }

            // Thêm inventory nếu có
            if (dto.InitialInventories?.Any() == true)
            {
                var inventories = _mapper.Map<List<RoomInventory>>(dto.InitialInventories);
                inventories.ForEach(i => i.Room = room); // hoặc i.RoomId = room.Id sau khi save
                room.RoomInventory = inventories;
            }

            _context.Rooms.Add(room);
            await _context.SaveChangesAsync();

            // Reload để lấy đầy đủ navigation properties
            await _context.Entry(room)
                .Reference(r => r.RoomType)
                .LoadAsync();

            var createdDto = _mapper.Map<RoomDetailDTO>(room);
            return CreatedAtAction(nameof(GetRoom), new { id = room.Id }, createdDto);
        }

        // PUT: api/rooms/5
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateRoomDTO dto)
        {
            dto.ID = id;
            //var validation = await _updateValidator.ValidateAsync(dto);
            //if (!validation.IsValid) return BadRequest(validation.Errors);

            var room = await _context.Rooms
                .Include(r => r.RoomImages)
                .FirstOrDefaultAsync(r => r.Id == id);
            if (room == null) return NotFound();

            var currentRoomNumber = room.RoomNumber;

            // Business rule: không cho đổi số phòng nếu đã có booking
            if (!string.IsNullOrEmpty(dto.RoomNumber) && dto.RoomNumber != currentRoomNumber)
            {
                var hasBooking = await _context.BookingDetails
                    .AnyAsync(bd => bd.RoomId == id && bd.CheckOutDate >= DateTime.Today);
                if (hasBooking) return BadRequest("Phòng đã có đặt phòng, không thể đổi số phòng");
            }

            _mapper.Map(dto, room); // chỉ map field không null

            if (dto.ImageUrls != null)
            {
                _context.RoomImages.RemoveRange(room.RoomImages);
                room.RoomImages = dto.ImageUrls
                    .Where(url => !string.IsNullOrWhiteSpace(url))
                    .Select((url, index) => new RoomImage
                    {
                        RoomId = room.Id,
                        ImageUrl = url.Trim(),
                        IsPrimary = index == 0
                    })
                    .ToList();
            }

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // DELETE: api/rooms/5 (soft-delete)
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var room = await _context.Rooms
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(r => r.Id == id);

            if (room == null)
                return NotFound();

            if (room.IsDeleted)
                return BadRequest("Phòng đã bị xóa (soft-delete) trước đó.");

            // Business rule: không cho xóa nếu đang có booking active
            var hasActiveBooking = await _context.BookingDetails
                .AnyAsync(bd => bd.RoomId == id
                             && bd.CheckOutDate >= DateTime.UtcNow.Date);

            if (hasActiveBooking)
                return BadRequest("Không thể xóa phòng đang có booking hoạt động.");

            _context.Rooms.Remove(room);  // ← sẽ bị interceptor chuyển thành soft-delete

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // POST: api/rooms/5/restore
        [HttpPost("{id}/restore")]
        public async Task<IActionResult> RestoreRoom(int id)
        {
            var room = await _context.Rooms
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(r => r.Id == id);

            if (room == null || !room.IsDeleted)
                return NotFound();

            room.IsDeleted = false;
            room.DeletedAt = null;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // GET: api/rooms/deleted
        [HttpGet("deleted")]
        public async Task<ActionResult<PagedResult<RoomDetailDTO>>> GetDeletedRooms(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 15,
            [FromQuery] string? searchRoomNumber = null)
        {
            // Bắt buộc IgnoreQueryFilters để thấy các bản ghi đã soft-delete
            var query = _context.Rooms
                .IgnoreQueryFilters()
                .Where(r => r.IsDeleted == true);

            // Optional: tìm kiếm theo số phòng (nếu client gửi)
            if (!string.IsNullOrWhiteSpace(searchRoomNumber))
            {
                query = query.Where(r => r.RoomNumber.Contains(searchRoomNumber.Trim()));
            }

            // Sắp xếp mặc định
            query = query.OrderByDescending(r => r.DeletedAt);

            // Đếm tổng trước khi phân trang
            var totalCount = await query.CountAsync();

            // Phân trang
            var rooms = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Include(r => r.RoomType)
                    .ThenInclude(rt => rt!.RoomTypeAmenities)
                    .ThenInclude(rta => rta.Amenity)
                .Include(r => r.RoomImages)
                .Include(r => r.RoomInventory)
                .ThenInclude(ri => ri.Equipment)
                .AsNoTracking()
                .ToListAsync();

            var dtos = _mapper.Map<List<RoomDetailDTO>>(rooms);

            var pagedResult = new PagedResponse<RoomDetailDTO>(
                dtos,
                totalCount,
                page,
                pageSize);

            return Ok(pagedResult);
        }

        // GET: api/Rooms/available
        [HttpGet("available")]
        public async Task<ActionResult<PagedResult<RoomDetailDTO>>> GetAvailableRooms([FromQuery] GetAvailableRoomsQuery query)
        {

            if (query.CheckIn.HasValue && query.CheckOut.HasValue)
            {
                if (query.CheckIn >= query.CheckOut)
                    return BadRequest("Check-in phải trước check-out");

                if (query.CheckIn < DateTime.Today)
                    return BadRequest("Check-in không được trong quá khứ");
            }

            var q = _context.Rooms
                .AsNoTracking()
                .Include(r => r.RoomType)
                    .ThenInclude(rt => rt.RoomTypeAmenities)
                        .ThenInclude(rta => rta.Amenity)
                .Where(r => !r.IsDeleted && r.Status == RoomStatuses.Available);

            // Lọc theo ngày chỉ khi CẢ HAI tham số đều có
            if (query.CheckIn.HasValue && query.CheckOut.HasValue)
            {
                // Logic kiểm tra phòng trống trong khoảng ngày
                // (tránh overlap booking)
                q = q.Where(r => !r.BookingDetails.Any(bd =>
                    bd.Booking != null &&
                    bd.CheckInDate < query.CheckOut &&
                    bd.CheckOutDate > query.CheckIn));
            }

            // Lọc theo loại phòng (nếu có)
            if (query.RoomTypeId.HasValue)
            {
                q = q.Where(r => r.RoomTypeId == query.RoomTypeId.Value);
            }

            // Lọc theo sức chứa (nếu có)
            if (query.Adults.HasValue)
            {
                q = q.Where(r => r.RoomType != null && r.RoomType.CapacityAdults >= query.Adults.Value);
            }

            if (query.Children.HasValue)
            {
                q = q.Where(r => r.RoomType != null && r.RoomType.CapacityChildren >= query.Children.Value);
            }

            // Phân trang
            var total = await q.CountAsync();
            var items = await q
                .OrderBy(r => r.RoomNumber)
                .Skip((query.Page - 1) * query.PageSize)
                .Take(query.PageSize)
                .ToListAsync();

            var dtos = _mapper.Map<List<RoomDetailDTO>>(items);

            var result = new PagedResponse<RoomDetailDTO>(dtos, total, query.Page, query.PageSize);

            return Ok(result);
        }

        // PATCH: api/rooms/{id}/status
        [HttpPatch("{id}/status")]
        public async Task<IActionResult> PatchStatus(int id, [FromBody] PatchRoomStatusDTO dto)
        {
            //var validation = await _patchStatusValidator.ValidateAsync(dto);
            //if (!validation.IsValid)
            //    return BadRequest(validation.Errors);

            var room = await _context.Rooms.FindAsync(id);
            if (room == null)
                return NotFound();

            // Business rule: một số trạng thái không được chuyển trực tiếp
            if (room.Status == RoomStatuses.Occupied && dto.Status != RoomStatuses.Cleaning && dto.Status != RoomStatuses.Maintenance)
            {
                return BadRequest($"Phòng đang {RoomStatuses.Occupied}, chỉ được chuyển sang {RoomStatuses.Cleaning} hoặc {RoomStatuses.Maintenance}");
            }

            room.Status = dto.Status;
            //room.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // PATCH: api/rooms/{id}/cleaning-status
        [HttpPatch("{id}/cleaning-status")]
        public async Task<IActionResult> PatchCleaningStatus(int id, [FromBody] PatchRoomCleaningStatusDTO dto)
        {
            //var validation = await _patchCleaningValidator.ValidateAsync(dto);
            //if (!validation.IsValid)
            //    return BadRequest(validation.Errors);

            var room = await _context.Rooms.FindAsync(id);
            if (room == null)
                return NotFound();

            // Business rules
            if (dto.CleaningStatus == RoomCleaningStatuses.Clean && room.Status == RoomStatuses.Occupied)
            {
                return BadRequest("Không thể đánh dấu Clean khi phòng đang có khách");
            }

            if (dto.CleaningStatus == RoomCleaningStatuses.Inspected && room.CleaningStatus != RoomCleaningStatuses.Clean)
            {
                return BadRequest("Phòng phải ở trạng thái Clean trước khi chuyển sang Inspected");
            }

            room.CleaningStatus = dto.CleaningStatus;
            room.LastCleaningUpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            var updatedRoom = await _context.Rooms
                .Include(r => r.RoomType)
                .ThenInclude(rt => rt!.RoomTypeAmenities).ThenInclude(a => a.Amenity)
                .Include(r => r.RoomImages)
                .Include(r => r.RoomInventory)
                .ThenInclude(ri => ri.Equipment)
                .FirstOrDefaultAsync(r => r.Id == id);

            var resultDto = _mapper.Map<RoomDetailDTO>(updatedRoom);

            return Ok(resultDto);
        }

        [HttpPost("bulk-create")]
        public async Task<IActionResult> BulkCreate([FromBody] BulkCreateRoomDTO dto)
        {
            //var validation = await _bulkCreateValidator.ValidateAsync(dto);
            //if (!validation.IsValid)
            //{
            //    return BadRequest(validation.Errors);
            //}

            // Kiểm tra duplicate RoomNumber trong danh sách gửi lên (trước khi vào DB)
            var roomNumbers = dto.Rooms.Select(r => r.RoomNumber.Trim()).ToList();
            var duplicatesInRequest = roomNumbers
                .GroupBy(n => n)
                .Where(g => g.Count() > 1)
                .Select(g => g.Key)
                .ToList();

            if (duplicatesInRequest.Any())
            {
                return BadRequest($"Có số phòng trùng lặp trong danh sách: {string.Join(", ", duplicatesInRequest)}");
            }

            // Kiểm tra RoomNumber đã tồn tại trong database
            var existingNumbers = await _context.Rooms
                .Where(r => roomNumbers.Contains(r.RoomNumber))
                .Select(r => r.RoomNumber)
                .ToListAsync();

            if (existingNumbers.Any())
            {
                return BadRequest($"Các số phòng đã tồn tại: {string.Join(", ", existingNumbers)}");
            }

            // Kiểm tra RoomTypeId tồn tại (nếu tất cả dùng chung 1 loại thì check 1 lần)
            var roomTypeIds = dto.Rooms
                .Where(r => r.RoomTypeId.HasValue)
                .Select(r => r.RoomTypeId!.Value)
                .Distinct()
                .ToList();

            var validRoomTypeCount = await _context.RoomTypes
                .CountAsync(rt => roomTypeIds.Contains(rt.Id));

            if (validRoomTypeCount != roomTypeIds.Count)
            {
                return BadRequest("Một hoặc nhiều RoomTypeId không tồn tại");
            }

            // Mapping & tạo entities
            var roomsToAdd = new List<Room>();

            foreach (var roomDto in dto.Rooms)
            {
                var room = _mapper.Map<Room>(roomDto);

                // Default value nếu cần
                room.Status ??= RoomStatuses.Available;
                room.CleaningStatus ??= RoomCleaningStatuses.Dirty;

                // Xử lý inventories nếu có
                if (roomDto.InitialInventories?.Any() == true)
                {
                    room.RoomInventory = _mapper.Map<List<RoomInventory>>(roomDto.InitialInventories);
                }

                roomsToAdd.Add(room);
            }

            // Bulk insert
            await _context.Rooms.AddRangeAsync(roomsToAdd);
            await _context.SaveChangesAsync();

            // Trả về danh sách phòng vừa tạo (với ID)
            var createdDtos = _mapper.Map<List<RoomDetailDTO>>(roomsToAdd);

            return CreatedAtAction(nameof(BulkCreate), new { }, new
            {
                CreatedCount = createdDtos.Count,
                Rooms = createdDtos
            });
        }

        [HttpPost("{id}/clone")]
        public async Task<ActionResult<RoomDetailDTO>> CloneRoom(int id, [FromBody] CloneRoomRequest request)
        {
            var originalRoom = await _context.Rooms
                .Include(r => r.RoomInventory)
                .Include(r => r.RoomImages)
                .FirstOrDefaultAsync(r => r.Id == id);

            if (originalRoom == null)
                return NotFound(new { message = "Không tìm thấy phòng" });

            if (await _context.Rooms.AnyAsync(r => r.RoomNumber == request.NewRoomNumber))
                return BadRequest(new { message = $"Số phòng {request.NewRoomNumber} đã tồn tại." });

            var newRoom = new Room
            {
                RoomTypeId = originalRoom.RoomTypeId,
                RoomNumber = request.NewRoomNumber,
                Floor = originalRoom.Floor,
                Status = originalRoom.Status,
                CleaningStatus = originalRoom.CleaningStatus,
                IsDeleted = false,
                LastCleaningUpdatedAt = DateTime.UtcNow
            };

            _context.Rooms.Add(newRoom);
            await _context.SaveChangesAsync();

            // Clone RoomInventory
            foreach (var item in originalRoom.RoomInventory)
            {
                _context.RoomInventory.Add(new RoomInventory
                {
                    RoomId = newRoom.Id,
                    EquipmentId = item.EquipmentId,
                    Note = item.Note,
                    Quantity = item.Quantity,
                    PriceIfLost = item.PriceIfLost,
                    IsActive = item.IsActive
                });
            }

            foreach (var image in originalRoom.RoomImages)
            {
                _context.RoomImages.Add(new RoomImage
                {
                    RoomId = newRoom.Id,
                    ImageUrl = image.ImageUrl,
                    IsPrimary = image.IsPrimary
                });
            }

            await _context.SaveChangesAsync();

            var createdRoom = await _context.Rooms
                .Include(r => r.RoomType)
                .ThenInclude(rt => rt!.RoomTypeAmenities)
                .ThenInclude(rta => rta.Amenity)
                .Include(r => r.RoomImages)
                .Include(r => r.RoomInventory)
                .ThenInclude(ri => ri.Equipment)
                .AsNoTracking()
                .FirstAsync(r => r.Id == newRoom.Id);

            var result = _mapper.Map<RoomDetailDTO>(createdRoom);
            return Ok(result);
        }

        [HttpGet("image-library")]
        public async Task<ActionResult<List<string>>> GetImageLibrary()
        {
            var images = await _context.RoomImages
                .AsNoTracking()
                .Where(ri => !string.IsNullOrWhiteSpace(ri.ImageUrl))
                .OrderByDescending(ri => ri.Id)
                .Select(ri => ri.ImageUrl)
                .Distinct()
                .ToListAsync();

            return Ok(images);
        }

        [HttpPost("upload-image")]
        [Consumes("multipart/form-data")]
        [RequestSizeLimit(20_000_000)]
        public async Task<ActionResult<object>> UploadRoomImage([FromForm] IFormFile file, [FromForm] string? roomName = null)
        {
            if (file == null || file.Length <= 0)
            {
                return BadRequest("Vui lòng chọn ảnh phòng.");
            }

            var folderName = Slugify(roomName);
            var folder = string.IsNullOrWhiteSpace(folderName)
                ? "home/RoomImage/general"
                : $"home/RoomImage/{folderName}";

            var uploadedUrl = await _cloudinaryService.UploadImageAsync(file, folder);
            if (string.IsNullOrWhiteSpace(uploadedUrl))
            {
                return StatusCode(500, "Upload ảnh phòng lên Cloudinary thất bại.");
            }

            return Ok(new { url = uploadedUrl, folder });
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
