﻿namespace Event_Management_System.Models.DTO
{
    public class UpdateOrderBasketItemDto
    {
        public Guid ProductId { get; set; }
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
    }
}
