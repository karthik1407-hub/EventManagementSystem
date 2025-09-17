using System.ComponentModel.DataAnnotations;

namespace Event_Management_System.Models.DTO
{
    public class LoginRequestDto
    {
        [Required]
        public string Email { get; set; }

        [Required]
        public string Password { get; set; }
    }
}
