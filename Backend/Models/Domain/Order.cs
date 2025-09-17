namespace Event_Management_System.Models.Domain
{
    // Represents a finalized order after checkout.
    public class Order
    {
        // Primary key
        public Guid Id { get; set; }

        // Foreign key to the user who placed the order
        public Guid UserId { get; set; }

        // Navigation property for order items
        public ICollection<OrderItem> Items { get; set; } = new List<OrderItem>();

        // Foreign key to the payment record
        public Guid PaymentId { get; set; }

        // Navigation property to payment
        public Payment Payment { get; set; }

        // Order status (Pending, Processing, Shipped, Delivered, Cancelled)
        public OrderStatus Status { get; set; }

        // Timestamp for order creation
        public DateTime CreatedDate { get; set; }

        // Timestamp for last update
        public DateTime UpdatedDate { get; set; }
    }

    // Enum for order status
    public enum OrderStatus
    {
        Booked,
        Cancelled,
        Event_Ended
    }
}
