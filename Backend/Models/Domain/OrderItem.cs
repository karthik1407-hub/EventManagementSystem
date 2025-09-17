namespace Event_Management_System.Models.Domain
{
    // Represents a single item in an Order.
    public class OrderItem
    {
        // Primary key
        public Guid Id { get; set; }

        // Foreign key to the order
        public Guid OrderId { get; set; }

        // Navigation property to the order
        public Order Order { get; set; }

        // Foreign key to the product/item purchased
        public Guid EventId { get; set; }

        // Quantity of the product
        public int Quantity { get; set; }

        // Price per unit at the time of purchase
        public decimal UnitPrice { get; set; }
    }
}
