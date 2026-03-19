using backend.Data;
using backend.DTOs.RoomType;
using FluentValidation;
using Microsoft.EntityFrameworkCore;

namespace backend.Validators
{
    public class CreateRoomTypeDtoValidator : AbstractValidator<CreateRoomTypeDTO>
    {
        public CreateRoomTypeDtoValidator(AppDbContext context)
        {
            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("Tên loại phòng là bắt buộc")
                .MaximumLength(100)
                .MustAsync(async (name, ct) =>
                    !await context.RoomTypes.AnyAsync(t => t.Name == name, ct))
                .WithMessage("Tên loại phòng đã tồn tại");

            RuleFor(x => x.BasePrice).GreaterThan(0).WithMessage("Giá cơ bản phải > 0");
            RuleFor(x => x.CapacityAdults).GreaterThan(0).WithMessage("Sức chứa người lớn phải > 0");
            RuleFor(x => x.CapacityChildren).GreaterThanOrEqualTo(0);

            RuleForEach(x => x.AmenityIds)
                .MustAsync(async (id, ct) => await context.Amenities.AnyAsync(a => a.Id == id, ct))
                .When(x => x.AmenityIds?.Any() == true)
                .WithMessage("Một hoặc nhiều AmenityId không tồn tại");
        }
    }
}
