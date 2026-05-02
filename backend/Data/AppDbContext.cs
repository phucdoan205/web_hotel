using backend.Common;
using backend.Models;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;

namespace backend.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Role> Roles { get; set; }
        public DbSet<Permission> Permissions { get; set; }
        public DbSet<RolePermission> RolePermissions { get; set; }
        public DbSet<Membership> Memberships { get; set; }

        public DbSet<Amenity> Amenities { get; set; }
        public DbSet<Equipment> Equipments { get; set; }
        public DbSet<RoomType> RoomTypes { get; set; }
        public DbSet<Room> Rooms { get; set; }
        public DbSet<RoomTypeAmenity> RoomTypeAmenities { get; set; }
        public DbSet<RoomAmenity> RoomAmenities { get; set; }
        public DbSet<RoomImage> RoomImages { get; set; }
        public DbSet<RoomInventory> RoomInventory { get; set; }

        public DbSet<ArticleCategory> ArticleCategories { get; set; }
        public DbSet<Article> Articles { get; set; }
        public DbSet<ArticleComment> ArticleComments { get; set; }
        public DbSet<Attraction> Attractions { get; set; }
        public DbSet<AuditLog> AuditLogs { get; set; }
        public DbSet<AuditLogSetting> AuditLogSettings { get; set; }
        public DbSet<Notification> Notifications { get; set; }

        public DbSet<Booking> Bookings { get; set; }
        public DbSet<Guest> Guests { get; set; }
        public DbSet<BookingDetail> BookingDetails { get; set; }
        public DbSet<Invoice> Invoices { get; set; }
        public DbSet<LossAndDamage> LossAndDamages { get; set; }

        public DbSet<OrderService> OrderServices { get; set; }
        public DbSet<OrderServiceDetail> OrderServiceDetails { get; set; }
        public DbSet<Payment> Payments { get; set; }
        public DbSet<PaymentMethod> PaymentMethods { get; set; }
        public DbSet<Review> Reviews { get; set; }

        public DbSet<ServiceCategory> ServiceCategories { get; set; }
        public DbSet<Service> Services { get; set; }
        public DbSet<Voucher> Vouchers { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<RolePermission>()
                .HasKey(rp => new { rp.RoleId, rp.PermissionId });

            modelBuilder.Entity<RoomTypeAmenity>()
                .HasKey(rta => new { rta.RoomTypeId, rta.AmenityId });

            modelBuilder.Entity<RoomAmenity>()
                .HasKey(ra => new { ra.RoomId, ra.AmenityId });

            modelBuilder.Entity<Equipment>(entity =>
            {
                entity.Property(e => e.ItemCode)
                    .HasColumnType("varchar(50)")
                    .HasMaxLength(50);

                entity.Property(e => e.Name)
                    .HasMaxLength(255);

                entity.Property(e => e.Category)
                    .HasMaxLength(100);

                entity.Property(e => e.Unit)
                    .HasMaxLength(50);

                entity.Property(e => e.Supplier)
                    .HasMaxLength(255);

                entity.Property(e => e.BasePrice)
                    .HasColumnType("decimal(18,2)");

                entity.Property(e => e.DefaultPriceIfLost)
                    .HasColumnType("decimal(18,2)");

                entity.Property(e => e.CreatedAt)
                    .HasColumnType("datetime");

                entity.Property(e => e.UpdatedAt)
                    .HasColumnType("datetime");

                entity.HasIndex(e => e.ItemCode)
                    .IsUnique();
            });

            modelBuilder.Entity<RoomInventory>(entity =>
            {
                entity.Property(ri => ri.PriceIfLost)
                    .HasColumnType("decimal(18,2)");

                entity.HasOne(ri => ri.Equipment)
                    .WithMany(e => e.RoomInventories)
                    .HasForeignKey(ri => ri.EquipmentId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<LossAndDamage>(entity =>
            {
                entity.Property(ld => ld.PenaltyAmount)
                    .HasColumnType("decimal(18,2)");

                entity.Property(ld => ld.CreatedAt)
                    .HasColumnType("datetime");
            });

            modelBuilder.Entity<Notification>(entity =>
            {
                entity.Property(n => n.Title)
                    .HasMaxLength(255);

                entity.Property(n => n.Content)
                    .HasColumnType("nvarchar(max)");

                entity.Property(n => n.Type)
                    .HasColumnType("varchar(50)");

                entity.Property(n => n.ReferenceLink)
                    .HasColumnType("varchar(255)");

                entity.Property(n => n.CreatedAt)
                    .HasColumnType("datetime")
                    .HasDefaultValueSql("GETDATE()");

                entity.HasOne(n => n.User)
                    .WithMany(u => u.Notifications)
                    .HasForeignKey(n => n.UserId)
                    .OnDelete(DeleteBehavior.SetNull);
            });

            modelBuilder.Entity<Invoice>(entity =>
            {
                entity.Property(invoice => invoice.Code)
                    .HasColumnType("nvarchar(50)");

                entity.Property(invoice => invoice.BookingCode)
                    .HasColumnType("nvarchar(50)");

                entity.Property(invoice => invoice.GuestName)
                    .HasColumnType("nvarchar(255)");

                entity.Property(invoice => invoice.RoomNumber)
                    .HasColumnType("nvarchar(50)");

                entity.Property(invoice => invoice.RoomName)
                    .HasColumnType("nvarchar(255)");

                entity.Property(invoice => invoice.RoomRate)
                    .HasColumnType("decimal(18,2)");

                entity.Property(invoice => invoice.TotalRoomAmount)
                    .HasColumnType("decimal(18,2)");

                entity.Property(invoice => invoice.TotalServiceAmount)
                    .HasColumnType("decimal(18,2)");

                entity.Property(invoice => invoice.DiscountAmount)
                    .HasColumnType("decimal(18,2)");

                entity.Property(invoice => invoice.TaxAmount)
                    .HasColumnType("decimal(18,2)");

                entity.Property(invoice => invoice.FinalTotal)
                    .HasColumnType("decimal(18,2)");

                entity.Property(invoice => invoice.Notes)
                    .HasColumnType("nvarchar(max)");

                entity.Property(invoice => invoice.VoucherCode)
                    .HasColumnType("nvarchar(50)");

                entity.Property(invoice => invoice.VoucherDiscountType)
                    .HasColumnType("nvarchar(50)");

                entity.Property(invoice => invoice.VoucherDiscountValue)
                    .HasColumnType("decimal(18,2)");

                entity.Property(invoice => invoice.CreatedAt)
                    .HasColumnType("datetime");

                entity.Property(invoice => invoice.UpdatedAt)
                    .HasColumnType("datetime");

                entity.Property(invoice => invoice.PaidAt)
                    .HasColumnType("datetime");
            });

            modelBuilder.Entity<Equipment>(entity =>
            {
                entity.Property(e => e.ItemCode)
                    .HasColumnType("varchar(50)");

                entity.Property(e => e.Name)
                    .HasColumnType("nvarchar(255)");

                entity.Property(e => e.Category)
                    .HasColumnType("nvarchar(100)");

                entity.Property(e => e.Unit)
                    .HasColumnType("nvarchar(50)");

                entity.Property(e => e.BasePrice)
                    .HasColumnType("decimal(18,2)");

                entity.Property(e => e.DefaultPriceIfLost)
                    .HasColumnType("decimal(18,2)");

                entity.Property(e => e.Supplier)
                    .HasColumnType("nvarchar(255)");

                entity.Property(e => e.CreatedAt)
                    .HasColumnType("datetime");

                entity.Property(e => e.UpdatedAt)
                    .HasColumnType("datetime");

                entity.Property(e => e.ImageUrl)
                    .HasColumnType("nvarchar(max)");
            });

            modelBuilder.Entity<RoomInventory>(entity =>
            {
                entity.Property(ri => ri.PriceIfLost)
                    .HasColumnType("decimal(18,2)");

                entity.Property(ri => ri.Note)
                    .HasColumnType("nvarchar(max)");

                entity.Property(ri => ri.ItemType)
                    .HasColumnType("nvarchar(100)");

                entity.HasOne(ri => ri.Room)
                    .WithMany(r => r.RoomInventory)
                    .HasForeignKey(ri => ri.RoomId)
                    .OnDelete(DeleteBehavior.SetNull);

                entity.HasOne(ri => ri.Equipment)
                    .WithMany(e => e.RoomInventories)
                    .HasForeignKey(ri => ri.EquipmentId)
                    .OnDelete(DeleteBehavior.SetNull);
            });

            modelBuilder.Entity<LossAndDamage>(entity =>
            {
                entity.Property(ld => ld.PenaltyAmount)
                    .HasColumnType("decimal(18,2)");

                entity.Property(ld => ld.Description)
                    .HasColumnType("nvarchar(max)");

                entity.Property(ld => ld.CreatedAt)
                    .HasColumnType("datetime");

                entity.Property(ld => ld.ImageUrl)
                    .HasColumnType("nvarchar(max)");
            });

            modelBuilder.Entity<Article>(entity =>
            {
                entity.Property(a => a.Title).HasMaxLength(255);
                entity.Property(a => a.Slug).HasMaxLength(255);
                entity.Property(a => a.GalleryUrls).HasColumnType("nvarchar(max)");
                entity.Property(a => a.CreatedAt).HasColumnType("datetime");
                entity.Property(a => a.UpdatedAt).HasColumnType("datetime");
                entity.Property(a => a.ApprovedAt).HasColumnType("datetime");
                entity.Property(a => a.DeletedAt).HasColumnType("datetime");
                entity.HasIndex(a => a.Slug).IsUnique(false);

                entity.HasOne(a => a.Author)
                    .WithMany(u => u.Articles)
                    .HasForeignKey(a => a.AuthorId)
                    .OnDelete(DeleteBehavior.NoAction);

                entity.HasOne(a => a.ApprovedBy)
                    .WithMany()
                    .HasForeignKey(a => a.ApprovedById)
                    .OnDelete(DeleteBehavior.NoAction);
            });

            modelBuilder.Entity<ArticleComment>(entity =>
            {
                entity.Property(c => c.Content).HasColumnType("nvarchar(max)");
                entity.Property(c => c.CreatedAt).HasColumnType("datetime");
                entity.Property(c => c.UpdatedAt).HasColumnType("datetime");

                entity.HasOne(c => c.Article)
                    .WithMany(a => a.Comments)
                    .HasForeignKey(c => c.ArticleId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(c => c.User)
                    .WithMany(u => u.ArticleComments)
                    .HasForeignKey(c => c.UserId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(c => c.TaggedUser)
                    .WithMany()
                    .HasForeignKey(c => c.TaggedUserId)
                    .OnDelete(DeleteBehavior.SetNull);

                entity.HasOne(c => c.ParentComment)
                    .WithMany(c => c.Replies)
                    .HasForeignKey(c => c.ParentCommentId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<AuditLogSetting>(entity =>
            {
                entity.HasKey(s => s.Id);

                // Đảm bảo ConfigName không bị trùng
                entity.HasIndex(s => s.ConfigName).IsUnique();

                entity.Property(s => s.ConfigName)
                      .IsRequired()
                      .HasMaxLength(100);

                entity.Property(s => s.Value).IsRequired();
            });

            modelBuilder.Entity<AuditLog>(entity =>
            {
                entity.HasOne(l => l.User)
                  .WithMany(u => u.AuditLogs)
                  .HasForeignKey(l => l.UserId)
                  .OnDelete(DeleteBehavior.SetNull);
                entity.Property(l => l.LogData)
                      .HasColumnType("nvarchar(max)");
                entity.HasIndex(l => l.LogDate);
            });

            // Soft-delete
            foreach (var entityType in modelBuilder.Model.GetEntityTypes())
            {
                if (typeof(ISoftDelete).IsAssignableFrom(entityType.ClrType))
                {
                    var parameter = Expression.Parameter(entityType.ClrType);
                    var property = Expression.Property(parameter, nameof(ISoftDelete.IsDeleted));
                    var constant = Expression.Constant(false);
                    var body = Expression.Equal(property, constant);
                    var lambda = Expression.Lambda(body, parameter);

                    modelBuilder.Entity(entityType.ClrType)
                        .HasQueryFilter(lambda);
                }
            }

            base.OnModelCreating(modelBuilder);
        }
    }
}
