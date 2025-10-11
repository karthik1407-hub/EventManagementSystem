using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Event_Management_System.Models.DTO;

namespace Event_Management_System.Repositories.Interface
{
    public interface IUserRepository
    {
        Task<List<UserDTO>> GetAllUsers();
        Task<UserDTO> GetUserById(Guid id);
        Task<UserDTO> CreateUser(UserDTO user);
        Task UpdateUser(UserUpdateDTO user);
        Task DeleteUser(Guid id);
    }
}
