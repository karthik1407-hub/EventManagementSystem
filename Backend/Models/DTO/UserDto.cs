namespace Event_Management_System.Models.DTO
{
    public class UserDTO
    {
        public Guid UserID { get; set; }
        public string Name { get; set; }
        public string Email { get; set; }
        public string ContactNumber { get; set; }
        public string Roles { get; set; }
    }
}