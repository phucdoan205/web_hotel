using AutoMapper;
using backend.DTOs.Amenity;
using backend.DTOs;
using backend.DTOs.Attraction;
using backend.DTOs.Audit;
using backend.DTOs.Room;
using backend.DTOs.RoomInventory;
using backend.DTOs.RoomType;
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

            CreateMap<Booking, BookingResponseDTO>()
                .ForMember(dest => dest.GuestName, opt => opt.MapFrom(src => src.Guest != null ? src.Guest.Name : null))
                .ForMember(dest => dest.GuestPhone, opt => opt.MapFrom(src => src.Guest != null ? src.Guest.Phone : null))
                .ForMember(dest => dest.GuestEmail, opt => opt.MapFrom(src => src.Guest != null ? src.Guest.Email : null))
                .ForMember(dest => dest.BookingDetails, opt => opt.MapFrom(src => src.BookingDetails));
            CreateMap<BookingCreateDTO, Booking>()
                .ForMember(dest => dest.BookingDetails, opt => opt.Ignore());

            CreateMap<BookingDetailCreateDTO, BookingDetail>();

            CreateMap<BookingDetail, BookingDetailResponseDTO>()
                .ForMember(dest => dest.RoomNumber, opt => opt.MapFrom(src => src.Room != null ? src.Room.RoomNumber : null))
                .ForMember(dest => dest.RoomTypeName, opt => opt.MapFrom(src => src.RoomType != null ? src.RoomType.Name : null))
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status));

            CreateMap<Voucher, VoucherDTO>();
            CreateMap<VoucherDTO, Voucher>();

            CreateMap<Payment, PaymentDTO>();
            CreateMap<PaymentDTO, Payment>();

            CreateMap<Review, ReviewDTO>();
            CreateMap<ReviewDTO, Review>();

            CreateMap<Article, ArticleDTO>();
            CreateMap<ArticleDTO, Article>();
            
            CreateMap<Amenity, AmenityDTO>();
            CreateMap<AmenityDetail, AmenityDetailDTO>();

            CreateMap<RoomInventory, RoomInventoryDTO>()
                .ForMember(dest => dest.RoomId, opt => opt.MapFrom(src => src.RoomId ?? 0))
                .ForMember(dest => dest.EquipmentId, opt => opt.MapFrom(src => src.EquipmentId))
                .ForMember(dest => dest.EquipmentCode, opt => opt.MapFrom(src => src.Equipment != null ? src.Equipment.ItemCode : null))
                .ForMember(dest => dest.EquipmentName, opt => opt.MapFrom(src => src.Equipment != null ? src.Equipment.Name : null))
                .ForMember(dest => dest.RoomNumber, opt => opt.MapFrom(src => src.Room != null ? src.Room.RoomNumber : null));
            CreateMap<CreateRoomInventoryDTO, RoomInventory>()
                .ForMember(dest => dest.Equipment, opt => opt.Ignore())
                .ForMember(dest => dest.Room, opt => opt.Ignore())
                .ForMember(dest => dest.LossAndDamages, opt => opt.Ignore());
            CreateMap<UpdateRoomInventoryDTO, RoomInventory>()
                .ForMember(dest => dest.Equipment, opt => opt.Ignore())
                .ForMember(dest => dest.Room, opt => opt.Ignore())
                .ForMember(dest => dest.LossAndDamages, opt => opt.Ignore())
                .ForAllMembers(opt => opt.Condition((src, dest, srcMember) => srcMember != null));

            CreateMap<Room, RoomDetailDTO>()
                .ForMember(dest => dest.RoomTypeName, opt => opt.MapFrom(src => src.RoomType != null ? src.RoomType.Name : string.Empty))
                .ForMember(dest => dest.BasePrice, opt => opt.MapFrom(src => src.RoomType != null ? src.RoomType.BasePrice : 0))
                .ForMember(dest => dest.CapacityAdults, opt => opt.MapFrom(src => src.RoomType != null ? src.RoomType.CapacityAdults : 0))
                .ForMember(dest => dest.CapacityChildren, opt => opt.MapFrom(src => src.RoomType != null ? src.RoomType.CapacityChildren : 0))
                .ForMember(dest => dest.BedType, opt => opt.MapFrom(src => src.RoomType != null ? src.RoomType.BedType : null))
                .ForMember(dest => dest.Size, opt => opt.MapFrom(src => src.RoomType != null ? src.RoomType.Size : null))
                .ForMember(dest => dest.Amenities, opt => opt.MapFrom(src =>
                    (src.RoomType != null
                        ? src.RoomType.RoomTypeAmenities
                            .Where(rta => rta.Amenity != null)
                            .Select(rta => rta.Amenity.Name)
                        : Enumerable.Empty<string>())
                    .Union(src.RoomAmenities != null
                        ? src.RoomAmenities.Where(ra => ra.Amenity != null).Select(ra => ra.Amenity.Name)
                        : Enumerable.Empty<string>())
                    .ToList()))
                .ForMember(dest => dest.RoomTypeAmenities, opt => opt.MapFrom(src =>
                    src.RoomType != null
                        ? src.RoomType.RoomTypeAmenities
                            .Where(rta => rta.Amenity != null)
                            .Select(rta => rta.Amenity)
                        : Enumerable.Empty<Amenity>()))
                .ForMember(dest => dest.RoomSpecificAmenities, opt => opt.MapFrom(src =>
                    src.RoomAmenities != null
                        ? src.RoomAmenities
                            .Where(ra => ra.Amenity != null)
                            .Select(ra => ra.Amenity)
                        : Enumerable.Empty<Amenity>()))
                .ForMember(dest => dest.ImageUrls, opt => opt.MapFrom(src =>
                    src.RoomType != null
                        ? src.RoomType.RoomImages
                            .Where(ri => !string.IsNullOrWhiteSpace(ri.ImageUrl))
                            .Select(ri => ri.ImageUrl)
                        : Enumerable.Empty<string>()))
                .ForMember(dest => dest.Inventory, opt => opt.MapFrom(src => src.RoomInventory))
                .ForMember(dest => dest.Rating, opt => opt.MapFrom(src =>
                    src.RoomType != null ? src.RoomType.Reviews.Average(r => r.Rating) ?? 0 : 0))

                .ForMember(dest => dest.ReviewCount, opt => opt.MapFrom(src =>
                    src.RoomType != null ? src.RoomType.Reviews.Count : 0));

            CreateMap<CreateRoomDTO, Room>()
                .ForMember(dest => dest.RoomInventory, opt => opt.Ignore())
                .ForMember(dest => dest.BookingDetails, opt => opt.Ignore())
                .ForMember(dest => dest.RoomType, opt => opt.Ignore());
            CreateMap<UpdateRoomDTO, Room>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.RoomInventory, opt => opt.Ignore())
                .ForMember(dest => dest.BookingDetails, opt => opt.Ignore())
                .ForMember(dest => dest.RoomType, opt => opt.Ignore())
                .ForAllMembers(opt => opt.Condition((src, dest, srcMember) => srcMember != null));

            CreateMap<RoomType, RoomTypeDTO>()
                .ForMember(dest => dest.RoomCount, opt => opt.MapFrom(src => src.Rooms.Count(r => !r.IsDeleted)));
            CreateMap<RoomType, RoomTypeDetailDTO>()
                .ForMember(dest => dest.Amenities, opt => opt.MapFrom(src =>
                    src.RoomTypeAmenities
                        .Where(rta => rta.Amenity != null)
                        .Select(rta => rta.Amenity.Name)))
                .ForMember(dest => dest.ImageUrls, opt => opt.MapFrom(src =>
                    src.RoomImages.Select(ri => ri.ImageUrl)))
                .ForMember(dest => dest.RoomCount, opt => opt.MapFrom(src => src.Rooms.Count(r => !r.IsDeleted)));
            CreateMap<CreateRoomTypeDTO, RoomType>()
                .ForMember(dest => dest.Rooms, opt => opt.Ignore())
                .ForMember(dest => dest.RoomTypeAmenities, opt => opt.Ignore())
                .ForMember(dest => dest.RoomImages, opt => opt.Ignore())
                .ForMember(dest => dest.BookingDetails, opt => opt.Ignore())
                .ForMember(dest => dest.Reviews, opt => opt.Ignore());
            CreateMap<UpdateRoomTypeDTO, RoomType>()
                .ForMember(dest => dest.Rooms, opt => opt.Ignore())
                .ForMember(dest => dest.RoomTypeAmenities, opt => opt.Ignore())
                .ForMember(dest => dest.RoomImages, opt => opt.Ignore())
                .ForMember(dest => dest.BookingDetails, opt => opt.Ignore())
                .ForMember(dest => dest.Reviews, opt => opt.Ignore())
                .ForAllMembers(opt => opt.Condition((src, dest, srcMember) => srcMember != null));

            CreateMap<Attraction, AttractionDTO>();
            CreateMap<CreateAttractionDTO, Attraction>();
            CreateMap<UpdateAttractionDTO, Attraction>()
                .ForAllMembers(opt => opt.Condition((src, dest, srcValue) => srcValue != null));

            CreateMap<AuditLog, AuditLogResponseDTO>()
                .ForMember(dest => dest.UserName, opt =>
                    opt.MapFrom(src => src.User != null ? src.User.FullName : null))
                .ForMember(dest => dest.RoleName, opt =>
                    opt.MapFrom(src => src.User != null && src.User.Role != null ? src.User.Role.Name : null));
        }
    }
}
