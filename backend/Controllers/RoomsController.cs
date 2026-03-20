using backend.Common;
using backend.Data;
using backend.DTOs.Room;
using backend.DTOs.RoomInventory;
using backend.Models;
using backend.Validators;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RoomsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IValidator<CreateRoomDTO> _createValidator;
        private readonly IValidator<UpdateRoomDTO> _updateValidator;
        private readonly IValidator<PatchRoomCleaningStatusDTO> _patchCleaningValidator;
        private readonly IValidator<PatchRoomStatusDTO> _patchStatusValidator;
        private readonly IValidator<BulkCreateRoomDTO> _bulkCreateValidator;
        private readonly IValidator<GetAvailableRoomsQuery> _queryValidator;

        public RoomsController(
            AppDbContext context,
            IValidator<CreateRoomDTO> createValidator,
            IValidator<UpdateRoomDTO> updateValidator,
            IValidator<PatchRoomCleaningStatusDTO> patchCleaningValidator,
            IValidator<PatchRoomStatusDTO> patchStatusValidator,
            IValidator<BulkCreateRoomDTO> bulkCreateValidator,
            IValidator<GetAvailableRoomsQuery> queryValidator)
        {
            _context = context;
            _createValidator = createValidator;
            _updateValidator = updateValidator;
            _patchCleaningValidator = patchCleaningValidator;
            _patchStatusValidator = patchStatusValidator;
            _bulkCreateValidator = bulkCreateValidator;
            _queryValidator = queryValidator;
        }

        private static RoomInventoryDTO MapInventory(RoomInventory item)
        {
            return new RoomInventoryDTO
            {
                Id = item.Id,
                RoomId = item.RoomId ?? 0,
                ItemName = item.ItemName,
                Quantity = item.Quantity,
                PriceIfLost = item.PriceIfLost,
                RoomNumber = item.Room?.RoomNumber
            };
        }

        private static RoomDetailDTO MapRoom(Room room)
        {
            return new RoomDetailDTO
            {
                Id = room.Id,
                RoomNumber = room.RoomNumber,
                Floor = room.Floor,
                Status = room.Status,
                RoomTypeId = room.RoomTypeId,
                RoomTypeName = room.RoomType?.Name ?? string.Empty,
                BasePrice = room.RoomType?.BasePrice ?? 0,
                CapacityAdults = room.RoomType?.CapacityAdults ?? 0,
                CapacityChildren = room.RoomType?.CapacityChildren ?? 0,
                BedType = room.RoomType?.BedType,
                Size = room.RoomType?.Size,
                CleaningStatus = room.CleaningStatus,
                LastCleaningUpdatedAt = room.LastCleaningUpdatedAt,
                IsDeleted = room.IsDeleted,
                DeletedAt = room.DeletedAt,
                Amenities = room.RoomType?.RoomTypeAmenities
                    .Where(rta => rta.Amenity != null)
                    .Select(rta => rta.Amenity.Name)
                    .ToList() ?? new List<string>(),
                Inventory = room.RoomInventory
                    .Select(MapInventory)
                    .ToList()
            };
        }

        private IQueryable<Room> BuildRoomQuery(bool includeDeleted = false)
        {
            var query = includeDeleted
                ? _context.Rooms.IgnoreQueryFilters()
                : _context.Rooms.AsQueryable();

            return query
                .Include(r => r.RoomType)
                    .ThenInclude(rt => rt!.RoomTypeAmenities)
                    .ThenInclude(rta => rta.Amenity)
                .Include(r => r.RoomInventory)
                .AsNoTracking();
        }

        [HttpGet]
        public async Task<ActionResult<PagedResponse<RoomDetailDTO>>> GetRooms(
            [FromQuery] string? status = null,
            [FromQuery] int? roomTypeId = null,
            [FromQuery] int? floor = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 15)
        {
            var query = BuildRoomQuery();

            if (!string.IsNullOrWhiteSpace(status))
                query = query.Where(r => r.Status == status);
            if (roomTypeId.HasValue)
                query = query.Where(r => r.RoomTypeId == roomTypeId.Value);
            if (floor.HasValue)
                query = query.Where(r => r.Floor == floor.Value);

            var totalCount = await query.CountAsync();
            var rooms = await query
                .OrderBy(r => r.RoomNumber)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return Ok(new PagedResponse<RoomDetailDTO>(rooms.Select(MapRoom).ToList(), totalCount, page, pageSize));
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<RoomDetailDTO>> GetRoom(int id)
        {
            var room = await BuildRoomQuery()
                .FirstOrDefaultAsync(r => r.Id == id);

            if (room == null)
            {
                return NotFound();
            }

            return Ok(MapRoom(room));
        }

        [HttpPost]
        public async Task<ActionResult<RoomDetailDTO>> Create([FromBody] CreateRoomDTO dto)
        {
            var validation = await _createValidator.ValidateAsync(dto);
            if (!validation.IsValid)
            {
                return BadRequest(validation.Errors);
            }

            var room = new Room
            {
                RoomTypeId = dto.RoomTypeId,
                RoomNumber = dto.RoomNumber.Trim(),
                Floor = dto.Floor,
                Status = string.IsNullOrWhiteSpace(dto.Status) ? RoomStatuses.Available : dto.Status.Trim(),
                CleaningStatus = RoomCleaningStatuses.Dirty
            };

            if (dto.InitialInventories?.Any() == true)
            {
                room.RoomInventory = dto.InitialInventories.Select(i => new RoomInventory
                {
                    ItemName = i.ItemName.Trim(),
                    Quantity = i.Quantity,
                    PriceIfLost = i.PriceIfLost
                }).ToList();
            }

            _context.Rooms.Add(room);
            await _context.SaveChangesAsync();

            var createdRoom = await BuildRoomQuery()
                .FirstAsync(r => r.Id == room.Id);

            return CreatedAtAction(nameof(GetRoom), new { id = room.Id }, MapRoom(createdRoom));
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateRoomDTO dto)
        {
            dto.ID = id;
            var validation = await _updateValidator.ValidateAsync(dto);
            if (!validation.IsValid)
            {
                return BadRequest(validation.Errors);
            }

            var room = await _context.Rooms.FirstOrDefaultAsync(r => r.Id == id);
            if (room == null)
            {
                return NotFound();
            }

            var currentRoomNumber = room.RoomNumber;
            var newRoomNumber = string.IsNullOrWhiteSpace(dto.RoomNumber) ? null : dto.RoomNumber.Trim();

            if (newRoomNumber != null && newRoomNumber != currentRoomNumber)
            {
                var hasBooking = await _context.BookingDetails
                    .AnyAsync(bd => bd.RoomId == id && bd.CheckOutDate >= DateTime.Today);

                if (hasBooking)
                {
                    return BadRequest("Phong da co dat phong, khong the doi so phong.");
                }

                room.RoomNumber = newRoomNumber;
            }

            if (dto.RoomTypeId.HasValue)
                room.RoomTypeId = dto.RoomTypeId.Value;
            if (dto.Floor.HasValue)
                room.Floor = dto.Floor.Value;
            if (!string.IsNullOrWhiteSpace(dto.Status))
                room.Status = dto.Status.Trim();

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var room = await _context.Rooms
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(r => r.Id == id);

            if (room == null)
            {
                return NotFound();
            }

            if (room.IsDeleted)
            {
                return BadRequest("Phong da bi xoa truoc do.");
            }

            var hasActiveBooking = await _context.BookingDetails
                .AnyAsync(bd => bd.RoomId == id && bd.CheckOutDate >= DateTime.UtcNow.Date);

            if (hasActiveBooking)
            {
                return BadRequest("Khong the xoa phong dang co booking hoat dong.");
            }

            _context.Rooms.Remove(room);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpPost("{id:int}/restore")]
        public async Task<IActionResult> RestoreRoom(int id)
        {
            var room = await _context.Rooms
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(r => r.Id == id);

            if (room == null || !room.IsDeleted)
            {
                return NotFound();
            }

            room.IsDeleted = false;
            room.DeletedAt = null;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpGet("deleted")]
        public async Task<ActionResult<PagedResponse<RoomDetailDTO>>> GetDeletedRooms(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 15,
            [FromQuery] string? searchRoomNumber = null)
        {
            var query = BuildRoomQuery(includeDeleted: true)
                .Where(r => r.IsDeleted);

            if (!string.IsNullOrWhiteSpace(searchRoomNumber))
            {
                query = query.Where(r => r.RoomNumber.Contains(searchRoomNumber.Trim()));
            }

            var totalCount = await query.CountAsync();
            var rooms = await query
                .OrderByDescending(r => r.DeletedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return Ok(new PagedResponse<RoomDetailDTO>(rooms.Select(MapRoom).ToList(), totalCount, page, pageSize));
        }

        [HttpGet("available")]
        public async Task<ActionResult<PagedResponse<RoomDetailDTO>>> GetAvailableRooms([FromQuery] GetAvailableRoomsQuery query)
        {
            var validationResult = await _queryValidator.ValidateAsync(query);
            if (!validationResult.IsValid)
            {
                return BadRequest(validationResult.Errors);
            }

            if (query.CheckIn.HasValue && query.CheckOut.HasValue)
            {
                if (query.CheckIn >= query.CheckOut)
                    return BadRequest("Check-in phai truoc check-out.");
                if (query.CheckIn < DateTime.Today)
                    return BadRequest("Check-in khong duoc trong qua khu.");
            }

            var q = BuildRoomQuery()
                .Where(r => !r.IsDeleted && r.Status == RoomStatuses.Available);

            if (query.CheckIn.HasValue && query.CheckOut.HasValue)
            {
                q = q.Where(r => !r.BookingDetails.Any(bd =>
                    bd.Booking != null &&
                    bd.CheckInDate < query.CheckOut &&
                    bd.CheckOutDate > query.CheckIn));
            }

            if (query.RoomTypeId.HasValue)
                q = q.Where(r => r.RoomTypeId == query.RoomTypeId.Value);
            if (query.Adults.HasValue)
                q = q.Where(r => r.RoomType != null && r.RoomType.CapacityAdults >= query.Adults.Value);
            if (query.Children.HasValue)
                q = q.Where(r => r.RoomType != null && r.RoomType.CapacityChildren >= query.Children.Value);

            var total = await q.CountAsync();
            var items = await q
                .OrderBy(r => r.RoomNumber)
                .Skip((query.Page - 1) * query.PageSize)
                .Take(query.PageSize)
                .ToListAsync();

            return Ok(new PagedResponse<RoomDetailDTO>(items.Select(MapRoom).ToList(), total, query.Page, query.PageSize));
        }

        [HttpPatch("{id:int}/status")]
        public async Task<IActionResult> PatchStatus(int id, [FromBody] PatchRoomStatusDTO dto)
        {
            var validation = await _patchStatusValidator.ValidateAsync(dto);
            if (!validation.IsValid)
            {
                return BadRequest(validation.Errors);
            }

            var room = await _context.Rooms.FirstOrDefaultAsync(r => r.Id == id);
            if (room == null)
            {
                return NotFound();
            }

            if (room.Status == RoomStatuses.Occupied &&
                dto.Status != RoomStatuses.Cleaning &&
                dto.Status != RoomStatuses.Maintenance)
            {
                return BadRequest($"Phong dang {RoomStatuses.Occupied}, chi duoc chuyen sang {RoomStatuses.Cleaning} hoac {RoomStatuses.Maintenance}.");
            }

            room.Status = dto.Status;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpPatch("{id:int}/cleaning-status")]
        public async Task<IActionResult> PatchCleaningStatus(int id, [FromBody] PatchRoomCleaningStatusDTO dto)
        {
            var validation = await _patchCleaningValidator.ValidateAsync(dto);
            if (!validation.IsValid)
            {
                return BadRequest(validation.Errors);
            }

            var room = await _context.Rooms.FirstOrDefaultAsync(r => r.Id == id);
            if (room == null)
            {
                return NotFound();
            }

            if (dto.CleaningStatus == RoomCleaningStatuses.Clean && room.Status == RoomStatuses.Occupied)
            {
                return BadRequest("Khong the danh dau Clean khi phong dang co khach.");
            }

            if (dto.CleaningStatus == RoomCleaningStatuses.Inspected &&
                room.CleaningStatus != RoomCleaningStatuses.Clean)
            {
                return BadRequest("Phong phai o trang thai Clean truoc khi chuyen sang Inspected.");
            }

            room.CleaningStatus = dto.CleaningStatus;
            room.LastCleaningUpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            var updatedRoom = await BuildRoomQuery().FirstAsync(r => r.Id == id);
            return Ok(MapRoom(updatedRoom));
        }

        [HttpPost("bulk-create")]
        public async Task<IActionResult> BulkCreate([FromBody] BulkCreateRoomDTO dto)
        {
            var validation = await _bulkCreateValidator.ValidateAsync(dto);
            if (!validation.IsValid)
            {
                return BadRequest(validation.Errors);
            }

            var roomNumbers = dto.Rooms.Select(r => r.RoomNumber.Trim()).ToList();
            var duplicatesInRequest = roomNumbers
                .GroupBy(n => n)
                .Where(g => g.Count() > 1)
                .Select(g => g.Key)
                .ToList();

            if (duplicatesInRequest.Any())
            {
                return BadRequest($"Co so phong trung lap trong danh sach: {string.Join(", ", duplicatesInRequest)}");
            }

            var existingNumbers = await _context.Rooms
                .Where(r => roomNumbers.Contains(r.RoomNumber))
                .Select(r => r.RoomNumber)
                .ToListAsync();

            if (existingNumbers.Any())
            {
                return BadRequest($"Cac so phong da ton tai: {string.Join(", ", existingNumbers)}");
            }

            var roomTypeIds = dto.Rooms
                .Where(r => r.RoomTypeId.HasValue)
                .Select(r => r.RoomTypeId!.Value)
                .Distinct()
                .ToList();

            var validRoomTypeCount = await _context.RoomTypes
                .CountAsync(rt => roomTypeIds.Contains(rt.Id));

            if (validRoomTypeCount != roomTypeIds.Count)
            {
                return BadRequest("Mot hoac nhieu RoomTypeId khong ton tai.");
            }

            var roomsToAdd = dto.Rooms.Select(roomDto => new Room
            {
                RoomTypeId = roomDto.RoomTypeId,
                RoomNumber = roomDto.RoomNumber.Trim(),
                Floor = roomDto.Floor,
                Status = string.IsNullOrWhiteSpace(roomDto.Status) ? RoomStatuses.Available : roomDto.Status.Trim(),
                CleaningStatus = RoomCleaningStatuses.Dirty,
                RoomInventory = roomDto.InitialInventories?.Select(i => new RoomInventory
                {
                    ItemName = i.ItemName.Trim(),
                    Quantity = i.Quantity,
                    PriceIfLost = i.PriceIfLost
                }).ToList() ?? new List<RoomInventory>()
            }).ToList();

            await _context.Rooms.AddRangeAsync(roomsToAdd);
            await _context.SaveChangesAsync();

            var createdIds = roomsToAdd.Select(r => r.Id).ToList();
            var createdRooms = await BuildRoomQuery()
                .Where(r => createdIds.Contains(r.Id))
                .OrderBy(r => r.RoomNumber)
                .ToListAsync();

            return CreatedAtAction(nameof(BulkCreate), new { }, new
            {
                CreatedCount = createdRooms.Count,
                Rooms = createdRooms.Select(MapRoom).ToList()
            });
        }
    }
}
