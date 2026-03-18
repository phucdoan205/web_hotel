using FluentValidation;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.DTOs.Room;
using backend.Models;

namespace backend.Validators
{
    public class UpdateRoomDtoValidator : AbstractValidator<UpdateRoomDTO>
    {
        private readonly AppDbContext _context;

        public UpdateRoomDtoValidator(AppDbContext context)
        {
            _context = context;

            // RoomNumber: nếu cung cấp thì phải unique (trừ chính phòng đang update)
            RuleFor(x => x.RoomNumber)
                .MaximumLength(10).WithMessage("Số phòng tối đa 10 ký tự")
                .When(x => !string.IsNullOrEmpty(x.RoomNumber))  // chỉ validate nếu client gửi giá trị mới
                .MustAsync(BeUniqueRoomNumberForUpdateAsync)
                .WithMessage("Số phòng '{PropertyValue}' đã tồn tại");

            // RoomTypeId: nếu gửi thì phải tồn tại
            RuleFor(x => x.RoomTypeId)
                .MustAsync(BeValidRoomTypeAsync)
                .WithMessage("Loại phòng không tồn tại")
                .When(x => x.RoomTypeId.HasValue);  // chỉ check nếu client gửi giá trị

            // Status: nếu gửi thì phải hợp lệ
            RuleFor(x => x.Status)
                .Must(BeValidStatus).WithMessage("Trạng thái không hợp lệ")
                .When(x => !string.IsNullOrEmpty(x.Status));

            // Floor: nếu gửi thì >= 0 (tùy theo quy ước khách sạn của bạn)
            RuleFor(x => x.Floor)
                .GreaterThanOrEqualTo(0).WithMessage("Tầng phải lớn hơn hoặc bằng 0")
                .When(x => x.Floor.HasValue);
        }

        private async Task<bool> BeUniqueRoomNumberForUpdateAsync(
        UpdateRoomDTO dto,
        string? newRoomNumber,
        CancellationToken ct)
        {
            if (string.IsNullOrEmpty(newRoomNumber)) return true;

            return !await _context.Rooms
                .AnyAsync(r => r.RoomNumber == newRoomNumber && r.Id != dto.ID, ct);
        }

        private async Task<bool> BeValidRoomTypeAsync(int? roomTypeId, CancellationToken ct)
        {
            if (!roomTypeId.HasValue) return true;
            return await _context.RoomTypes.AnyAsync(t => t.Id == roomTypeId.Value, ct);
        }

        private bool BeValidStatus(string? status)
        {
            if (string.IsNullOrEmpty(status)) return true;
            var validStatuses = new[] { "Available", "Occupied", "Maintenance", "Cleaning", "OutOfOrder" };
            return validStatuses.Contains(status);
        }
    }
}