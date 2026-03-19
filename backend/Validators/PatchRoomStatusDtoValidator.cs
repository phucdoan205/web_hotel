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
                .Must(BeValidStatus)
                .WithMessage("Trạng thái không hợp lệ. Các giá trị cho phép: Available, Occupied, Maintenance, Cleaning, OutOfOrder");
        }

        private bool BeValidStatus(string status)
        {
            var valid = new[] { "Available", "Occupied", "Maintenance", "Cleaning", "OutOfOrder" };
            return valid.Contains(status, StringComparer.OrdinalIgnoreCase);
        }
    }
}
