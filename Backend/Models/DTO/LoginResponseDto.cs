namespace Event_Management_System.Models.DTO
{
    public class LoginResponseDto
    {
        public string Token { get; set; }
        public string Email { get; set; }

        public List<string> Roles { get; set; }
    }
}
