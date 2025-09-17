namespace Event_Management_System.Models.DTO
{
    public class CreateTicketDto
    {
        public Guid EventID { get; set; }
        public Guid UserID { get; set; }
        public DateTime BookingDate { get; set; }
        public bool IsCancelled { get; set; }
    }
}
