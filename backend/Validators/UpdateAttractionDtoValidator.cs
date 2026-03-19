using backend.Data;
using backend.DTOs.Attraction;
using FluentValidation;
using Microsoft.EntityFrameworkCore;

namespace backend.Validators
{
    public class UpdateAttractionDtoValidator : AbstractValidator<UpdateAttractionDTO>
    {
        private readonly AppDbContext _context;

        public UpdateAttractionDtoValidator(AppDbContext context)
        {
            _context = context;

            RuleFor(x => x.Name)
                .MaximumLength(150)
                .When(x => !string.IsNullOrEmpty(x.Name))
                .MustAsync(async (dto, name, ctx, ct) =>
                {
                    if (string.IsNullOrEmpty(name)) return true;
                    var id = (int)ctx.RootContextData["AttractionId"]!;
                    return !await _context.Attractions
                        .AnyAsync(a => a.Name == name && a.Id != id, ct);
                })
                .WithMessage("Tên điểm tham quan đã tồn tại");

            RuleFor(x => x.DistanceKm).GreaterThanOrEqualTo(0).When(x => x.DistanceKm.HasValue);
            RuleFor(x => x.Latitude).InclusiveBetween(-90, 90).When(x => x.Latitude.HasValue);
            RuleFor(x => x.Longitude).InclusiveBetween(-180, 180).When(x => x.Longitude.HasValue);
        }
    }
}
