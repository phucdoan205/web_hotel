using backend.Common;
using backend.DTOs.Room;
using FluentValidation;

namespace backend.Validators
{
    public class PatchRoomStatusDtoValidator : AbstractValidator<PatchRoomStatusDTO>
    {
        public PatchRoomStatusDtoValidator()
        {
            RuleFor(x => x.Status)
                .NotEmpty()
                .Must(RoomStatuses.IsValid)
                .WithMessage("Trạng thái không hợp lệ. Các giá trị cho phép: Available, Occupied, Maintenance, Cleaning, OutOfOrder");
        }
    }
}
