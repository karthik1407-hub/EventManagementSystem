namespace Event_Management_System.Models.DTO
{
    public class OrderBasketItemDto
    {
        public Guid Id { get; set; }
        public Guid OrderBasketId { get; set; }
        public Guid EventId { get; set; }
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public DateTime AddedDate { get; set; }
    }
}
