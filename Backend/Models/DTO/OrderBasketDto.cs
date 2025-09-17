namespace Event_Management_System.Models.DTO
{
    public class OrderBasketDto
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime UpdatedDate { get; set; }
        public List<OrderBasketItemDto> Items { get; set; } = new();
    }
}
