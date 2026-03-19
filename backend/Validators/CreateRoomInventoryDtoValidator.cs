using backend.Data;
using backend.DTOs.RoomInventory;
using FluentValidation;
using Microsoft.EntityFrameworkCore;

namespace backend.Validators
{
    public class CreateRoomInventoryDtoValidator : AbstractValidator<CreateRoomInventoryDTO>
    {
        private readonly AppDbContext _context;

        public CreateRoomInventoryDtoValidator(AppDbContext context)
        {
            _context = context;

            RuleFor(x => x.RoomId)
                .GreaterThan(0)
                .MustAsync(async (id, ct) =>
                    await _context.Rooms.AnyAsync(r => r.Id == id && !r.IsDeleted, ct))
                .WithMessage("Phòng không tồn tại hoặc đã bị xóa");

            RuleFor(x => x.ItemName)
                .NotEmpty().WithMessage("Tên vật dụng là bắt buộc")
                .MaximumLength(100);

            RuleFor(x => x.Quantity).GreaterThanOrEqualTo(0);
            RuleFor(x => x.PriceIfLost).GreaterThanOrEqualTo(0);

            RuleFor(x => x)
                .MustAsync(async (dto, ct) =>
                {
                    return !await _context.RoomInventory
                        .AnyAsync(ri => ri.RoomId == dto.RoomId
                                     && ri.ItemName == dto.ItemName
                                     && !ri.Room!.IsDeleted, ct);
                })
                .WithMessage("Vật dụng này đã tồn tại trong phòng");
        }
    }
}
