
using backend.DTOs.Room;
using FluentValidation;

namespace backend.Validators
{
    public class GetAvailableRoomsQueryValidator : AbstractValidator<GetAvailableRoomsQuery>
    {
        public GetAvailableRoomsQueryValidator()
        {
            When(x => x.CheckIn.HasValue || x.CheckOut.HasValue, () =>
            {
                RuleFor(x => x.CheckIn)
                    .NotNull().WithMessage("CheckIn là bắt buộc khi có CheckOut")
                    .LessThan(x => x.CheckOut).WithMessage("CheckIn phải trước CheckOut")
                    .When(x => x.CheckOut.HasValue);

                RuleFor(x => x.CheckOut)
                    .NotNull().WithMessage("CheckOut là bắt buộc khi có CheckIn")
                    .GreaterThan(x => x.CheckIn).WithMessage("CheckOut phải sau CheckIn")
                    .When(x => x.CheckIn.HasValue);
            });

            RuleFor(x => x.Page)
                .GreaterThanOrEqualTo(1);

            RuleFor(x => x.PageSize)
                .InclusiveBetween(1, 100);
        }
    }
}
