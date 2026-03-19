using backend.Common;
using backend.DTOs.Room;
using FluentValidation;

namespace backend.Validators
{
    public class PatchRoomCleaningStatusDtoValidator : AbstractValidator<PatchRoomCleaningStatusDTO>
    {
        public PatchRoomCleaningStatusDtoValidator()
        {
            RuleFor(x => x.CleaningStatus)
                .NotEmpty()
                .Must(RoomCleaningStatuses.IsValid)
                .WithMessage("Trạng thái dọn phòng không hợp lệ. Các giá trị: Dirty, InProgress, Clean, Inspected, Pickup");
        }
    }
}
