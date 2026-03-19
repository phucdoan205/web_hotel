using AutoMapper;
using backend.Common;
using backend.DTOs;
using backend.DTOs.Room;
using backend.Models;

namespace backend.Mappers
{
    public class AutoMapperProfile : Profile
    {
        public AutoMapperProfile()
        {
            CreateMap<User, UserResponseDTO>()
                .ForMember(dest => dest.RoleName, opt => opt.Ignore())
                .ForMember(dest => dest.MembershipName, opt => opt.Ignore());
            CreateMap<UserCreateDTO, User>()
                .ForMember(dest => dest.PasswordHash, opt => opt.MapFrom(src => src.Password));
            CreateMap<UserUpdateDTO, User>()
                .ForAllMembers(opt => opt.Condition((src, dest, srcMember) => srcMember != null));

            CreateMap<Booking, BookingResponseDTO>();
            CreateMap<BookingCreateDTO, Booking>();

            CreateMap<Voucher, VoucherDTO>();
            CreateMap<VoucherDTO, Voucher>();

            CreateMap<Payment, PaymentDTO>();
            CreateMap<PaymentDTO, Payment>();

            CreateMap<Review, ReviewDTO>();
            CreateMap<ReviewDTO, Review>();

            CreateMap<Article, ArticleDTO>();
            CreateMap<ArticleDTO, Article>();

            // ROOM
            CreateMap<Room, RoomDTO>()
                .ForMember(dest => dest.RoomTypeId, opt => opt.MapFrom(src => src.RoomTypeId != null ? src.RoomTypeId : null));
            CreateMap<Room, RoomDetailDTO>()
                .ForMember(d => d.RoomTypeName, opt => opt.MapFrom(s => s.RoomType != null ? s.RoomType.Name : ""))
                .ForMember(d => d.BasePrice, opt => opt.MapFrom(s => s.RoomType != null ? s.RoomType.BasePrice : 0))
                .ForMember(d => d.CapacityAdults, opt => opt.MapFrom(s => s.RoomType != null ? s.RoomType.CapacityAdults : 0))
                .ForMember(d => d.Amenities, opt => opt.MapFrom(s => s.RoomType != null
                    ? s.RoomType.RoomTypeAmenities.Select(a => a.Amenity.Name).ToList()
                    : new List<string>()))
                .ForMember(d => d.Inventory, opt => opt.MapFrom(s => s.RoomInventory ?? new List<RoomInventory>()))
                .ForMember(d => d.Status, opt => opt.MapFrom(s => s.Status))
                .ForMember(d => d.CleaningStatus, opt => opt.MapFrom(s => s.CleaningStatus))
                .ForMember(d => d.LastCleaningUpdatedAt, opt => opt.MapFrom(s => s.LastCleaningUpdatedAt));

            CreateMap<CreateRoomDTO, Room>()
                .ForMember(dest => dest.RoomTypeId, opt => opt.MapFrom(src => src.RoomTypeId))
                .ForMember(dest => dest.RoomNumber, opt => opt.MapFrom(src => src.RoomNumber))
                .ForMember(dest => dest.Floor, opt => opt.MapFrom(src => src.Floor))
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status ?? RoomStatuses.Available))
                .ForMember(dest => dest.RoomInventory, opt => opt.Ignore());  // Ignore để map thủ công sau

            // Mapping từ UpdateRoomDTO → Room (cho PUT update)
            CreateMap<UpdateRoomDTO, Room>()
                .ForAllMembers(opt => opt.Condition((src, dest, srcMember) => srcMember != null));

            CreateMap<RoomInventory, RoomInventoryDTO>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id))
                .ForMember(dest => dest.ItemName, opt => opt.MapFrom(src => src.ItemName))
                .ForMember(dest => dest.Quantity, opt => opt.MapFrom(src => src.Quantity))
                .ForMember(dest => dest.PriceIfLost, opt => opt.MapFrom(src => src.PriceIfLost));
            CreateMap<CreateRoomInventoryDTO, RoomInventory>();
            CreateMap<RoomInventoryDTO, RoomInventory>();
        }
    }
}
