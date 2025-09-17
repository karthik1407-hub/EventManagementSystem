using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace EventManagementSystem.Data
{
    public class AuthDbContext : IdentityDbContext
    {
        public AuthDbContext(DbContextOptions<AuthDbContext> options) : base(options)
        {
        }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            var adminRoleId = "1a111111-1111-1111-1111-111111111111";
            var organizerRoleId = "2b222222-2222-2222-2222-222222222222";
            var attendeeRoleId = "3c333333-3333-3333-3333-333333333333";

            // Create roles
            var roles = new List<IdentityRole>
            {
                new IdentityRole()
                {
                    Id = adminRoleId,
                    Name = "Admin",
                    NormalizedName = "ADMIN",
                    ConcurrencyStamp = adminRoleId
                },
                new IdentityRole()
                {
                    Id = organizerRoleId,
                    Name = "Event Organizer",
                    NormalizedName = "EVENT ORGANIZER",
                    ConcurrencyStamp = organizerRoleId
                },
                new IdentityRole()
                {
                    Id = attendeeRoleId,
                    Name = "Attendee",
                    NormalizedName = "ATTENDEE",
                    ConcurrencyStamp = attendeeRoleId
                }
            };

            builder.Entity<IdentityRole>().HasData(roles);

            // Create an Admin User
            var adminUserId = "f3d378fd-e54d-5f4c-9219-b2b2f92a017e";
            var admin = new IdentityUser()
            {
                Id = adminUserId,
                UserName = "admin",
                Email = "eventsystem@admin.com",
                NormalizedEmail = "EVENTSYSTEM@ADMIN.COM",
                NormalizedUserName = "EVENTSYSTEM@ADMIN.COM"
            };

            admin.PasswordHash = new PasswordHasher<IdentityUser>().HashPassword(admin, "Admin@123");

            builder.Entity<IdentityUser>().HasData(admin);

            // Assign Admin role to Admin user
            var adminRoles = new List<IdentityUserRole<string>>()
            {
                new()
                {
                    UserId = adminUserId,
                    RoleId = adminRoleId
                }
            };

            builder.Entity<IdentityUserRole<string>>().HasData(adminRoles);
        }
    }
}
