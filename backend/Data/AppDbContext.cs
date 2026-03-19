using Microsoft.EntityFrameworkCore;
using backend.Models;

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
        public DbSet<RoomType> RoomTypes { get; set; }
        public DbSet<Room> Rooms { get; set; }
        public DbSet<RoomTypeAmenity> RoomTypeAmenities { get; set; }
        public DbSet<RoomImage> RoomImages { get; set; }
        public DbSet<RoomInventory> RoomInventories { get; set; }

        public DbSet<ArticleCategory> ArticleCategories { get; set; }
        public DbSet<Article> Articles { get; set; }
        public DbSet<Attraction> Attractions { get; set; }
        public DbSet<AuditLog> AuditLogs { get; set; }

        public DbSet<Booking> Bookings { get; set; }
        public DbSet<BookingDetail> BookingDetails { get; set; }
        public DbSet<Invoice> Invoices { get; set; }
        public DbSet<LossAndDamage> LossAndDamages { get; set; }

        public DbSet<OrderService> OrderServices { get; set; }
        public DbSet<OrderServiceDetail> OrderServiceDetails { get; set; }
        public DbSet<Payment> Payments { get; set; }
        public DbSet<Review> Reviews { get; set; }

        public DbSet<ServiceCategory> ServiceCategories { get; set; }
        public DbSet<Service> Services { get; set; }
        public DbSet<Voucher> Vouchers { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            foreach (var entity in modelBuilder.Model.GetEntityTypes())
            {
                // Replace table names
                var tableName = entity.GetTableName();
                if (tableName != null)
                {
                    entity.SetTableName(ToSnakeCase(tableName));
                }

                // Replace column names            
                foreach (var property in entity.GetProperties())
                {
                    property.SetColumnName(ToSnakeCase(property.Name));
                }

                // Replace primary key names
                foreach (var key in entity.GetKeys())
                {
                    key.SetName(ToSnakeCase(key.GetName()!));
                }

                // Replace foreign key names
                foreach (var key in entity.GetForeignKeys())
                {
                    key.SetConstraintName(ToSnakeCase(key.GetConstraintName()!));
                }

                // Replace index names
                foreach (var index in entity.GetIndexes())
                {
                    index.SetDatabaseName(ToSnakeCase(index.GetDatabaseName()!));
                }
            }

            // Special case for some tables that don't follow the exact snake_case pluralization
            modelBuilder.Entity<RoomInventory>().ToTable("Room_Inventory");

            // Composite keys for join tables
            modelBuilder.Entity<RolePermission>()
                .HasKey(rp => new { rp.RoleId, rp.PermissionId });

            modelBuilder.Entity<RoomTypeAmenity>()
                .HasKey(rta => new { rta.RoomTypeId, rta.AmenityId });

            base.OnModelCreating(modelBuilder);
        }

        private string ToSnakeCase(string input)
        {
            if (string.IsNullOrEmpty(input)) return input;

            var startUnderscore = input.StartsWith("_");
            if (startUnderscore) return input; // Don't process internal EF names

            return System.Text.RegularExpressions.Regex.Replace(
                input,
                "([a-z0-9])([A-Z])",
                "$1_$2").ToLower();
        }
    }
}