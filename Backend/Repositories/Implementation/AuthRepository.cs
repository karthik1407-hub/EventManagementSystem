using System;
using System.Threading.Tasks;
using Event_Management_System.Data;
using Event_Management_System.Models.Domain;
using Event_Management_System.Models.DTO;
using Event_Management_System.Repositories.Interface;
using Microsoft.EntityFrameworkCore;

namespace Event_Management_System.Repositories.Implementation
{
    public class AuthRepository : IAuthRepository
    {
        private readonly ApplicationDbContext _dbContext;

        public AuthRepository(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<UserDTO> GetUserById(Guid id)
        {
            var user = await _dbContext.Users.FindAsync(id);
            if (user == null) return null;

            return new UserDTO
            {
                UserID = user.UserID,
                Name = user.Name,
                Email = user.Email,
                ContactNumber = user.ContactNumber,
                Roles = user.Roles
            };
        }

        public async Task CreateUser(UserDTO userDto)
        {
            var user = new User
            {
                UserID = Guid.NewGuid(),
                Name = userDto.Name,
                Email = userDto.Email,
                ContactNumber = userDto.ContactNumber,
                Roles = userDto.Roles,
                //Password = userDto.Password // Note: In a real implementation, this should be hashed
            };

            await _dbContext.Users.AddAsync(user);
            await _dbContext.SaveChangesAsync();

            userDto.UserID = user.UserID;
        }
    }
}
