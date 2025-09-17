using Microsoft.AspNetCore.Identity;
using System.Security.Claims;

namespace Event_Management_System.Repositories.Interface
{
    public interface ITokenRepository
    {
        string CreateJwtToken(List<Claim> claims); // Updated method signature
    }
}