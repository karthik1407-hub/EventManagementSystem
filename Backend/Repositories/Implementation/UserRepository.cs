using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Event_Management_System.Data;
using Event_Management_System.Models.Domain;
using Event_Management_System.Models.DTO;
using Event_Management_System.Repositories.Interface;
using Microsoft.EntityFrameworkCore;

namespace Event_Management_System.Repositories.Implementation
{
    public class UserRepository : IUserRepository
    {
        private readonly ApplicationDbContext _dbContext;

        public UserRepository(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext ?? throw new ArgumentNullException(nameof(dbContext));
        }

        public async Task<List<UserDTO>> GetAllUsers()
        {
            var users = await _dbContext.Users.ToListAsync();
            return users.Select(u => new UserDTO
            {
                UserID = u.UserID,
                Name = u.Name ?? string.Empty,
                Email = u.Email ?? string.Empty,
                ContactNumber = u.ContactNumber ?? string.Empty,
                Roles = u.Roles ?? string.Empty
            }).ToList();
        }

        public async Task<UserDTO> GetUserById(Guid id)
        {
            var user = await _dbContext.Users.FindAsync(id);
            if (user == null) return null;

            return new UserDTO
            {
                UserID = user.UserID,
                Name = user.Name ?? string.Empty,
                Email = user.Email ?? string.Empty,
                ContactNumber = user.ContactNumber ?? string.Empty,
                Roles = user.Roles ?? string.Empty
            };
        }

        public async Task<UserDTO> CreateUser(UserDTO userDto)
        {
            if (userDto == null)
                throw new ArgumentNullException(nameof(userDto));

            var user = new User
            {
                UserID = Guid.NewGuid(),
                Name = userDto.Name ?? string.Empty,
                Email = userDto.Email ?? string.Empty,
                ContactNumber = userDto.ContactNumber ?? string.Empty,
                Roles = userDto.Roles ?? string.Empty
            };

            await _dbContext.Users.AddAsync(user);
            await _dbContext.SaveChangesAsync();

            userDto.UserID = user.UserID;
            return userDto;
        }

        public async Task UpdateUser(UserUpdateDTO userDto)
        {
            if (userDto == null)
                throw new ArgumentNullException(nameof(userDto));

            var user = await _dbContext.Users.FindAsync(userDto.UserID);
            if (user == null) return;

            // Only update properties that are not null
            if (!string.IsNullOrEmpty(userDto.Name))
                user.Name = userDto.Name;
            if (!string.IsNullOrEmpty(userDto.ContactNumber))
                user.ContactNumber = userDto.ContactNumber;

            await _dbContext.SaveChangesAsync();
        }

        public async Task DeleteUser(Guid id)
        {
            var user = await _dbContext.Users.FindAsync(id);
            if (user == null) return;

            _dbContext.Users.Remove(user);
            await _dbContext.SaveChangesAsync();
        }
    }
}
