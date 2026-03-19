using backend.Data;
using backend.DTOs.RoomType;
using FluentValidation;
using Microsoft.EntityFrameworkCore;

namespace backend.Validators
{
    public class UpdateRoomTypeDtoValidator : AbstractValidator<UpdateRoomTypeDTO>
    {
        private readonly AppDbContext _context;

        public UpdateRoomTypeDtoValidator(AppDbContext context)
        {
            _context = context;

            RuleFor(x => x.Name)
                .MaximumLength(100)
                .When(x => !string.IsNullOrEmpty(x.Name))
                .MustAsync(async (dto, name, context, ct) =>
                {
                    if (string.IsNullOrEmpty(name)) return true;

                    // Lấy id từ RootContextData (do controller truyền vào)
                    if (!context.RootContextData.TryGetValue("RoomTypeId", out var idObj)
                        || idObj is not int id)
                    {
                        return true; // hoặc throw nếu bắt buộc phải có id
                    }

                    return !await _context.RoomTypes
                        .AnyAsync(t => t.Name == name && t.Id != id, ct);
                })
                .WithMessage("Tên loại phòng '{PropertyValue}' đã tồn tại bởi loại phòng khác");
        }
    }
}
