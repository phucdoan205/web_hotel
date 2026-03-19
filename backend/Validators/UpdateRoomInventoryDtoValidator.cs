using backend.DTOs.RoomInventory;
using FluentValidation;

namespace backend.Validators
{
    public class UpdateRoomInventoryDtoValidator : AbstractValidator<UpdateRoomInventoryDTO>
    {
        public UpdateRoomInventoryDtoValidator()
        {
            RuleFor(x => x.ItemName)
                .MaximumLength(100)
                .When(x => !string.IsNullOrEmpty(x.ItemName));

            RuleFor(x => x.Quantity)
                .GreaterThanOrEqualTo(0)
                .When(x => x.Quantity.HasValue);

            RuleFor(x => x.PriceIfLost)
                .GreaterThanOrEqualTo(0)
                .When(x => x.PriceIfLost.HasValue);
        }
    }
}
