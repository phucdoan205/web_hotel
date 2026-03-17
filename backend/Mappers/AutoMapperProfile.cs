using AutoMapper;
using backend.DTOs;
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
        }
    }
}
