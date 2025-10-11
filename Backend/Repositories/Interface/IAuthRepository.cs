using System;
using System.Threading.Tasks;
using Event_Management_System.Models.DTO;

namespace Event_Management_System.Repositories.Interface
{
    public interface IAuthRepository
    {
        Task<UserDTO> GetUserById(Guid id);
        Task CreateUser(UserDTO user);
    }
}
