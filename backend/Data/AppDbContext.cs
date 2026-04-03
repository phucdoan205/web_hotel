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
        public DbSet<RoomImage> RoomImages { get; set; }
        public DbSet<RoomInventory> RoomInventory { get; set; }

        public DbSet<ArticleCategory> ArticleCategories { get; set; }
        public DbSet<Article> Articles { get; set; }
        public DbSet<Attraction> Attractions { get; set; }
        public DbSet<AuditLog> AuditLogs { get; set; }
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
