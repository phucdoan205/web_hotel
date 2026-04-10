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

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RoomsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;

        public RoomsController(AppDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
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
            .Include(r => r.RoomType)
            .ThenInclude(rt => rt!.RoomImages)
            .Include(r => r.RoomInventory)
            .ThenInclude(ri => ri.Equipment)
            .AsNoTracking();

            // Ãp dá»¥ng filter
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

            // Äáº¿m tá»•ng trÆ°á»›c khi phÃ¢n trang
            var totalCount = await query.CountAsync();

            // Láº¥y dá»¯ liá»‡u trang hiá»‡n táº¡i
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

        // GET: api/rooms/5 (chi tiáº¿t)
        [HttpGet("{id}")]
        public async Task<ActionResult<RoomDetailDTO>> GetRoom(int id)
        {
            var room = await _context.Rooms
                .Include(r => r.RoomType).ThenInclude(rt => rt!.RoomTypeAmenities).ThenInclude(rta => rta.Amenity)
                .Include(r => r.RoomType).ThenInclude(rt => rt!.RoomImages)
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

            // ThÃªm inventory náº¿u cÃ³
            if (dto.InitialInventories?.Any() == true)
            {
                var inventories = _mapper.Map<List<RoomInventory>>(dto.InitialInventories);
                inventories.ForEach(i => i.Room = room); // hoáº·c i.RoomId = room.Id sau khi save
                room.RoomInventory = inventories;
            }

            _context.Rooms.Add(room);
            await _context.SaveChangesAsync();

            // Reload Ä‘á»ƒ láº¥y Ä‘áº§y Ä‘á»§ navigation properties
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

            var room = await _context.Rooms.FirstOrDefaultAsync(r => r.Id == id);
            if (room == null) return NotFound();

            var currentRoomNumber = room.RoomNumber;

            // Business rule: khÃ´ng cho Ä‘á»•i sá»‘ phÃ²ng náº¿u Ä‘Ã£ cÃ³ booking
            if (!string.IsNullOrEmpty(dto.RoomNumber) && dto.RoomNumber != currentRoomNumber)
            {
                var hasBooking = await _context.BookingDetails
                    .AnyAsync(bd => bd.RoomId == id && bd.CheckOutDate >= DateTime.Today);
                if (hasBooking) return BadRequest("PhÃ²ng Ä‘Ã£ cÃ³ Ä‘áº·t phÃ²ng, khÃ´ng thá»ƒ Ä‘á»•i sá»‘ phÃ²ng");
            }

            _mapper.Map(dto, room); // chá»‰ map field khÃ´ng null

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // DELETE: api/rooms/5 (mark OutOfOrder)
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var room = await _context.Rooms
                .FirstOrDefaultAsync(r => r.Id == id);

            if (room == null)
                return NotFound();

            if (room.Status == RoomStatuses.OutOfOrder)
                return BadRequest("Phong da o trang thai OutOfOrder.");

            // Business rule: khong cho chuyen sang OutOfOrder neu dang co booking active
            var hasActiveBooking = await _context.BookingDetails
                .AnyAsync(bd => bd.RoomId == id
                             && bd.CheckOutDate >= DateTime.UtcNow.Date);

            if (hasActiveBooking)
                return BadRequest("Khong the chuyen phong dang co booking hoat dong sang OutOfOrder.");

            room.Status = RoomStatuses.OutOfOrder;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // POST: api/rooms/5/restore
        [HttpPost("{id}/restore")]
        public async Task<IActionResult> RestoreRoom(int id)
        {
            var room = await _context.Rooms
                .FirstOrDefaultAsync(r => r.Id == id);

            if (room == null)
                return NotFound();

            if (room.Status != RoomStatuses.OutOfOrder)
                return BadRequest("Phong hien khong o trang thai OutOfOrder.");

            room.Status = RoomStatuses.Available;
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
            // Báº¯t buá»™c IgnoreQueryFilters Ä‘á»ƒ tháº¥y cÃ¡c báº£n ghi Ä‘Ã£ soft-delete
            var query = _context.Rooms
                .IgnoreQueryFilters()
                .Where(r => r.IsDeleted == true);

            // Optional: tÃ¬m kiáº¿m theo sá»‘ phÃ²ng (náº¿u client gá»­i)
            if (!string.IsNullOrWhiteSpace(searchRoomNumber))
            {
                query = query.Where(r => r.RoomNumber.Contains(searchRoomNumber.Trim()));
            }

            // Sáº¯p xáº¿p máº·c Ä‘á»‹nh
            query = query.OrderByDescending(r => r.DeletedAt);

            // Äáº¿m tá»•ng trÆ°á»›c khi phÃ¢n trang
            var totalCount = await query.CountAsync();

            // PhÃ¢n trang
            var rooms = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Include(r => r.RoomType)
                    .ThenInclude(rt => rt!.RoomTypeAmenities)
                    .ThenInclude(rta => rta.Amenity)
                .Include(r => r.RoomType)
                    .ThenInclude(rt => rt!.RoomImages)
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
                    return BadRequest("Check-in pháº£i trÆ°á»›c check-out");

                if (query.CheckIn < DateTime.Today)
                    return BadRequest("Check-in khÃ´ng Ä‘Æ°á»£c trong quÃ¡ khá»©");
            }

            var q = _context.Rooms
                .AsNoTracking()
                .Include(r => r.RoomType)
                    .ThenInclude(rt => rt!.RoomTypeAmenities)
                        .ThenInclude(rta => rta.Amenity)
                .Where(r => !r.IsDeleted && r.Status == RoomStatuses.Available);

            // Lá»c theo ngÃ y chá»‰ khi Cáº¢ HAI tham sá»‘ Ä‘á»u cÃ³
            if (query.CheckIn.HasValue && query.CheckOut.HasValue)
            {
                // Logic kiá»ƒm tra phÃ²ng trá»‘ng trong khoáº£ng ngÃ y
                // (trÃ¡nh overlap booking)
                q = q.Where(r => !r.BookingDetails.Any(bd =>
                    bd.Booking != null &&
                    bd.CheckInDate < query.CheckOut &&
                    bd.CheckOutDate > query.CheckIn));
            }

            // Lá»c theo loáº¡i phÃ²ng (náº¿u cÃ³)
            if (query.RoomTypeId.HasValue)
            {
                q = q.Where(r => r.RoomTypeId == query.RoomTypeId.Value);
            }

            // Lá»c theo sá»©c chá»©a (náº¿u cÃ³)
            if (query.Adults.HasValue)
            {
                q = q.Where(r => r.RoomType != null && r.RoomType.CapacityAdults >= query.Adults.Value);
            }

            if (query.Children.HasValue)
            {
                q = q.Where(r => r.RoomType != null && r.RoomType.CapacityChildren >= query.Children.Value);
            }

            // PhÃ¢n trang
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

            // Business rule: má»™t sá»‘ tráº¡ng thÃ¡i khÃ´ng Ä‘Æ°á»£c chuyá»ƒn trá»±c tiáº¿p
            if (room.Status == RoomStatuses.Occupied && dto.Status != RoomStatuses.Cleaning && dto.Status != RoomStatuses.Maintenance)
            {
                return BadRequest($"PhÃ²ng Ä‘ang {RoomStatuses.Occupied}, chá»‰ Ä‘Æ°á»£c chuyá»ƒn sang {RoomStatuses.Cleaning} hoáº·c {RoomStatuses.Maintenance}");
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
                return BadRequest("KhÃ´ng thá»ƒ Ä‘Ã¡nh dáº¥u Clean khi phÃ²ng Ä‘ang cÃ³ khÃ¡ch");
            }

            if (dto.CleaningStatus == RoomCleaningStatuses.Inspected && room.CleaningStatus != RoomCleaningStatuses.Clean)
            {
                return BadRequest("PhÃ²ng pháº£i á»Ÿ tráº¡ng thÃ¡i Clean trÆ°á»›c khi chuyá»ƒn sang Inspected");
            }

            room.CleaningStatus = dto.CleaningStatus;
            room.LastCleaningUpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            var updatedRoom = await _context.Rooms
                .Include(r => r.RoomType)
                .ThenInclude(rt => rt!.RoomTypeAmenities).ThenInclude(a => a.Amenity)
                .Include(r => r.RoomType)
                .ThenInclude(rt => rt!.RoomImages)
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

            // Kiá»ƒm tra duplicate RoomNumber trong danh sÃ¡ch gá»­i lÃªn (trÆ°á»›c khi vÃ o DB)
            var roomNumbers = dto.Rooms.Select(r => r.RoomNumber.Trim()).ToList();
            var duplicatesInRequest = roomNumbers
                .GroupBy(n => n)
                .Where(g => g.Count() > 1)
                .Select(g => g.Key)
                .ToList();

            if (duplicatesInRequest.Any())
            {
                return BadRequest($"CÃ³ sá»‘ phÃ²ng trÃ¹ng láº·p trong danh sÃ¡ch: {string.Join(", ", duplicatesInRequest)}");
            }

            // Kiá»ƒm tra RoomNumber Ä‘Ã£ tá»“n táº¡i trong database
            var existingNumbers = await _context.Rooms
                .Where(r => roomNumbers.Contains(r.RoomNumber))
                .Select(r => r.RoomNumber)
                .ToListAsync();

            if (existingNumbers.Any())
            {
                return BadRequest($"CÃ¡c sá»‘ phÃ²ng Ä‘Ã£ tá»“n táº¡i: {string.Join(", ", existingNumbers)}");
            }

            // Kiá»ƒm tra RoomTypeId tá»“n táº¡i (náº¿u táº¥t cáº£ dÃ¹ng chung 1 loáº¡i thÃ¬ check 1 láº§n)
            var roomTypeIds = dto.Rooms
                .Where(r => r.RoomTypeId.HasValue)
                .Select(r => r.RoomTypeId!.Value)
                .Distinct()
                .ToList();

            var validRoomTypeCount = await _context.RoomTypes
                .CountAsync(rt => roomTypeIds.Contains(rt.Id));

            if (validRoomTypeCount != roomTypeIds.Count)
            {
                return BadRequest("Má»™t hoáº·c nhiá»u RoomTypeId khÃ´ng tá»“n táº¡i");
            }

            // Mapping & táº¡o entities
            var roomsToAdd = new List<Room>();

            foreach (var roomDto in dto.Rooms)
            {
                var room = _mapper.Map<Room>(roomDto);

                // Default value náº¿u cáº§n
                room.Status ??= RoomStatuses.Available;
                room.CleaningStatus ??= RoomCleaningStatuses.Dirty;

                // Xá»­ lÃ½ inventories náº¿u cÃ³
                if (roomDto.InitialInventories?.Any() == true)
                {
                    room.RoomInventory = _mapper.Map<List<RoomInventory>>(roomDto.InitialInventories);
                }

                roomsToAdd.Add(room);
            }

            // Bulk insert
            await _context.Rooms.AddRangeAsync(roomsToAdd);
            await _context.SaveChangesAsync();

            // Tráº£ vá» danh sÃ¡ch phÃ²ng vá»«a táº¡o (vá»›i ID)
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
                .FirstOrDefaultAsync(r => r.Id == id);

            if (originalRoom == null)
                return NotFound(new { message = "KhÃ´ng tÃ¬m tháº¥y phÃ²ng" });

            if (await _context.Rooms.AnyAsync(r => r.RoomNumber == request.NewRoomNumber))
                return BadRequest(new { message = $"Sá»‘ phÃ²ng {request.NewRoomNumber} Ä‘Ã£ tá»“n táº¡i." });

            if (!string.IsNullOrWhiteSpace(request.CleaningStatus) &&
                !RoomCleaningStatuses.IsValid(request.CleaningStatus))
            {
                return BadRequest(new { message = "Tr\u1ea1ng th\u00e1i d\u1ecdn ph\u00f2ng kh\u00f4ng h\u1ee3p l\u1ec7." });
            }

            var newRoom = new Room
            {
                RoomTypeId = originalRoom.RoomTypeId,
                RoomNumber = request.NewRoomNumber,
                Floor = request.Floor ?? originalRoom.Floor,
                Status = RoomStatuses.Available,
                CleaningStatus = request.CleaningStatus ?? RoomCleaningStatuses.Dirty,
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

            await _context.SaveChangesAsync();

            var createdRoom = await _context.Rooms
                .Include(r => r.RoomType)
                .ThenInclude(rt => rt!.RoomTypeAmenities)
                .ThenInclude(rta => rta.Amenity)
                .Include(r => r.RoomType)
                .ThenInclude(rt => rt!.RoomImages)
                .Include(r => r.RoomInventory)
                .ThenInclude(ri => ri.Equipment)
                .AsNoTracking()
                .FirstAsync(r => r.Id == newRoom.Id);

            var result = _mapper.Map<RoomDetailDTO>(createdRoom);
            return Ok(result);
        }

    }
}

