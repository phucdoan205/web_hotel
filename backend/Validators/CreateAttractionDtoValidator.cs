using backend.Data;
using backend.DTOs.Attraction;
using FluentValidation;
using Microsoft.EntityFrameworkCore;

namespace backend.Validators
{
    public class CreateAttractionDtoValidator : AbstractValidator<CreateAttractionDTO>
    {
        private readonly AppDbContext _context;

        public CreateAttractionDtoValidator(AppDbContext context)
        {
            _context = context;

            RuleFor(x => x.Name)
                .NotEmpty()
                .MaximumLength(150)
                .MustAsync(async (name, ct) =>
                    !await _context.Attractions.AnyAsync(a => a.Name == name, ct))
                .WithMessage("Tên điểm tham quan đã tồn tại");

            RuleFor(x => x.DistanceKm).GreaterThanOrEqualTo(0).When(x => x.DistanceKm.HasValue);
            RuleFor(x => x.Latitude).InclusiveBetween(-90, 90).When(x => x.Latitude.HasValue);
            RuleFor(x => x.Longitude).InclusiveBetween(-180, 180).When(x => x.Longitude.HasValue);
        }
    }
}
