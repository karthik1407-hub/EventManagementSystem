namespace Event_Management_System.Models.DTO
{
    public class CreateOrderBasketItemDto
    {
        public Guid OrderBasketId { get; set; }
        public Guid ProductId { get; set; }
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
    }
}
