using backend.Data;
using backend.DTOs.Room;
using FluentValidation;
using backend.Models;
using Microsoft.EntityFrameworkCore;
using backend.DTOs.RoomInventory;

namespace backend.Validators
{
    public class CreateRoomDtoValidator : AbstractValidator<CreateRoomDTO>
    {
        private readonly AppDbContext _context;

        public CreateRoomDtoValidator(AppDbContext context)
        {
            _context = context;

            RuleFor(x => x.RoomNumber)
                .NotEmpty().WithMessage("Số phòng bắt buộc")
                .MaximumLength(10)
                .MustAsync(async (number, ct) =>
                    !await _context.Rooms.AnyAsync(r => r.RoomNumber == number, ct))
                .WithMessage("Số phòng '{PropertyValue}' đã tồn tại");

            RuleFor(x => x.RoomTypeId)
                .NotNull().WithMessage("Loại phòng bắt buộc")
                .MustAsync(async (id, ct) =>
                    id == null || await _context.RoomTypes.AnyAsync(t => t.Id == id, ct))
                .WithMessage("Loại phòng không tồn tại");

            RuleFor(x => x.Status)
                .Must(BeValidStatus).WithMessage("Trạng thái không hợp lệ");

            When(x => x.InitialInventories != null && x.InitialInventories.Any(), () =>
            {
                RuleForEach(x => x.InitialInventories)
                    .SetValidator(new CreateRoomInventoryDTOValidator());
            });
        }

        private bool BeValidStatus(string? status)
        {
            if (string.IsNullOrEmpty(status)) return true;
            var valid = new[] { "Available", "Occupied", "Maintenance", "Cleaning", "OutOfOrder" };
            return valid.Contains(status);
        }
    }

    public class CreateRoomInventoryDTOValidator : AbstractValidator<CreateRoomInventoryDTO>
    {
        public CreateRoomInventoryDTOValidator()
        {
            RuleFor(x => x.ItemName).NotEmpty().MaximumLength(100);
            RuleFor(x => x.Quantity).GreaterThanOrEqualTo(0);
            RuleFor(x => x.PriceIfLost).GreaterThanOrEqualTo(0);
        }
    }
}
