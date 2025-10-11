using System;

namespace Event_Management_System.Models.DTO
{
    public class UserUpdateDTO
    {
        public Guid UserID { get; set; }
        public string? Name { get; set; }
        public string? ContactNumber { get; set; }
    }
}
