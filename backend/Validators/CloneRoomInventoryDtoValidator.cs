using backend.Data;
using backend.DTOs.RoomInventory;
using FluentValidation;
using Microsoft.EntityFrameworkCore;

namespace backend.Validators
{
    public class CloneRoomInventoryDtoValidator : AbstractValidator<CloneRoomInventoryDTO>
    {
        private readonly AppDbContext _context;

        public CloneRoomInventoryDtoValidator(AppDbContext context)
        {
            _context = context;

            RuleFor(x => x.SourceInventoryId)
                .GreaterThan(0)
                .MustAsync(async (id, ct) =>
                    await _context.RoomInventory.AnyAsync(ri => ri.Id == id, ct))
                .WithMessage("Không tìm thấy vật dụng nguồn");

            RuleFor(x => x.TargetRoomId)
                .GreaterThan(0).When(x => x.TargetRoomId.HasValue)
                .MustAsync(async (id, ct) =>
                    await _context.Rooms.AnyAsync(r => r.Id == id && !r.IsDeleted, ct))
                .WithMessage("Phòng đích không tồn tại hoặc đã bị xóa");

            RuleFor(x => x.NewItemName)
                .MaximumLength(100).When(x => !string.IsNullOrWhiteSpace(x.NewItemName))
                .WithMessage("Tên vật dụng mới tối đa 100 ký tự");

            RuleFor(x => x.NewQuantity)
                .GreaterThanOrEqualTo(0).When(x => x.NewQuantity.HasValue)
                .WithMessage("Số lượng mới phải ≥ 0");

            // Kiểm tra unique tên (dùng tên mới nếu có, nếu không thì dùng tên nguồn)
            RuleFor(x => x)
                .MustAsync(async (dto, ct) =>
                {
                    var source = await _context.RoomInventory
                        .AsNoTracking()
                        .FirstOrDefaultAsync(ri => ri.Id == dto.SourceInventoryId, ct);

                    if (source == null) return false;

                    string finalName = !string.IsNullOrWhiteSpace(dto.NewItemName)
                        ? dto.NewItemName.Trim()
                        : source.ItemName;

                    int targetRoomId = dto.TargetRoomId ?? source.RoomId!.Value;

                    return !await _context.RoomInventory
                        .AnyAsync(ri =>
                            ri.RoomId == targetRoomId &&
                            ri.ItemName == finalName &&
                            ri.Id != dto.SourceInventoryId,  // tránh false positive nếu cùng phòng
                            ct);
                })
                .WithMessage("Tên vật dụng (mới hoặc cũ) đã tồn tại trong phòng đích");
        }
    }
}