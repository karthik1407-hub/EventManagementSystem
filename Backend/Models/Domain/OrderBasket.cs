namespace Event_Management_System.Models.Domain
{
    // Represents a user's shopping basket before checkout.
    public class OrderBasket
    {
        // Primary key
        public Guid Id { get; set; }

        // Foreign key to the user who owns the basket
        public Guid UserId { get; set; }

        // Navigation property for basket items
        public ICollection<OrderBasketItem> Items { get; set; } = new List<OrderBasketItem>();

        // Timestamp for basket creation
        public DateTime CreatedDate { get; set; }

        // Timestamp for last update
        public DateTime UpdatedDate { get; set; }
    }
}
