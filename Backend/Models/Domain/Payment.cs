using System;

namespace Event_Management_System.Models.Domain
{
    // Represents payment information for an order.
    public class Payment
    {
        // Primary key
        public Guid Id { get; set; }

        // Foreign key to the user who made the payment
        public Guid UserId { get; set; }

        // Amount paid
        public decimal Amount { get; set; }

        // Payment method (e.g., CreditCard, PayPal, etc.)
        public string Method { get; set; }

        // Payment status (Pending, Completed, Failed, Refunded)
        public PaymentStatus Status { get; set; }

        // Transaction/reference ID from payment gateway
        public string TransactionId { get; set; }

        // Timestamp for payment creation
        public DateTime CreatedDate { get; set; }
    }

    // Enum for payment status
    public enum PaymentStatus
    {
        Pending,
        Completed,
        Failed,
        Refunded
    }
}