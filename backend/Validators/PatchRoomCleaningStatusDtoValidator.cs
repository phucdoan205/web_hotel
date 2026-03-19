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
                .Must(BeValidCleaningStatus)
                .WithMessage("Trạng thái dọn phòng không hợp lệ. Các giá trị: Dirty, InProgress, Clean, Inspected, Pickup");
        }

        private bool BeValidCleaningStatus(string? status)
        {
            if (string.IsNullOrEmpty(status)) return false;
            var valid = new[] { "Dirty", "InProgress", "Clean", "Inspected", "Pickup" };
            return valid.Contains(status, StringComparer.OrdinalIgnoreCase);
        }
    }
}
