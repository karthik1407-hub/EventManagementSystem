namespace Event_Management_System.Models.DTO
{
    public class CreateFeedbackDto
    {

        public Guid EventID { get; set; }
        public Guid UserID { get; set; }
        public int Rating { get; set; }
        public string Comments { get; set; }
        public DateTime SubmittedTimestamp { get; set; }

    }
}
