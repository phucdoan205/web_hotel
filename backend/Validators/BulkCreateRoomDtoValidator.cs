using backend.Data;
using backend.DTOs.Room;
using FluentValidation;

namespace backend.Validators
{
    public class BulkCreateRoomDtoValidator : AbstractValidator<BulkCreateRoomDTO>
    {
        private readonly AppDbContext _context;
        public BulkCreateRoomDtoValidator(AppDbContext context)
        {
            _context = context;

            RuleFor(x => x.Rooms)
                .NotEmpty().WithMessage("Danh sách phòng không được để trống")
                .Must(list => list.Count <= 100).WithMessage("Chỉ được tạo tối đa 100 phòng trong một lần gọi");

            RuleForEach(x => x.Rooms)
                .SetValidator(new CreateRoomDtoValidator(_context))
                .When(x => x.Rooms != null && x.Rooms.Any());
        }
    }
}
