using Event_Management_System.Data;
using Event_Management_System.Models.Domain;
using Event_Management_System.Models.DTO;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;

namespace Event_Management_System.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public UsersController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public ActionResult<IEnumerable<UserDTO>> GetAllUsers()
        {
            var users = _context.Users.Select(u => new UserDTO
            {
                UserID = u.UserID,
                Name = u.Name,
                Email = u.Email,
                ContactNumber = u.ContactNumber,
                Roles = u.Roles
            }).ToList();

            return Ok(users);
        }

        [HttpGet("{id}")]
        public ActionResult<UserDTO> GetUserById(Guid id)
        {
            var user = _context.Users.Find(id);

            if (user == null)
                return NotFound();

            var userDto = new UserDTO
            {
                UserID = user.UserID,
                Name = user.Name,
                Email = user.Email,
                ContactNumber = user.ContactNumber,
                Roles = user.Roles
            };

            return Ok(userDto);
        }

        [HttpPut("{id}")]
        public IActionResult UpdateUser(Guid id, [FromBody] UserUpdateDTO updatedUser)
        {
            var user = _context.Users.Find(id);
            if (user == null)
                return NotFound();

            // Only update fields that are not null
            if (!string.IsNullOrEmpty(updatedUser.Name))
                user.Name = updatedUser.Name;

            if (!string.IsNullOrEmpty(updatedUser.Email))
                user.Email = updatedUser.Email;

            if (!string.IsNullOrEmpty(updatedUser.ContactNumber))
                user.ContactNumber = updatedUser.ContactNumber;

            if (!string.IsNullOrEmpty(updatedUser.Roles))
                user.Roles = updatedUser.Roles;

            _context.SaveChanges();
            return NoContent();
        }



        [HttpPost]
        public ActionResult<UserDTO> CreateUser(UserDTO userDto)
        {
            var user = new UserDto
            {
                UserID = Guid.NewGuid(),
                Name = userDto.Name,
                Email = userDto.Email,
                ContactNumber = userDto.ContactNumber,
                Roles = userDto.Roles,
                Password = "default" // You should hash and handle this securely
            };

            _context.Users.Add(user);
            _context.SaveChanges();

            userDto.UserID = user.UserID;
            return CreatedAtAction(nameof(GetUserById), new { id = user.UserID }, userDto);
        }


        [HttpDelete("{id}")]
        public IActionResult DeleteUser(Guid id)
        {
            var user = _context.Users.Find(id);
            if (user == null)
                return NotFound();

            _context.Users.Remove(user);
            _context.SaveChanges();

            return NoContent();
        }

    }
}