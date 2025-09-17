namespace Event_Management_System.Models.Domain
{
    // Represents a single item in an OrderBasket.
    public class OrderBasketItem
    {
        // Primary key
        public Guid Id { get; set; }

        // Foreign key to the basket
        public Guid OrderBasketId { get; set; }

        // Navigation property to the basket
        public OrderBasket OrderBasket { get; set; }

        // Foreign key to the product/item being purchased
        public Guid EventId { get; set; }

        // Quantity of the product
        public int Quantity { get; set; }

        // Price per unit at the time of adding to basket
        public decimal UnitPrice { get; set; }

        // Timestamp for when the item was added
        public DateTime AddedDate { get; set; }
    }
}
