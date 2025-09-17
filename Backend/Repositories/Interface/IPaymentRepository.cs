using Event_Management_System.Models.Domain;

namespace Event_Management_System.Repositories.Interface
{
    public interface IPaymentRepository
    {
        // OrderBasket CRUD
        Task<OrderBasket?> GetOrderBasketByIdAsync(Guid id);
        Task<IEnumerable<OrderBasket>> GetAllOrderBasketsAsync();
        Task<OrderBasket> AddOrderBasketAsync(OrderBasket basket);
        Task<OrderBasket?> UpdateOrderBasketAsync(Guid id, OrderBasket basket);
        Task<bool> DeleteOrderBasketAsync(Guid id);

        // OrderBasketItem CRUD
        Task<OrderBasketItem?> GetOrderBasketItemByIdAsync(Guid id);
        Task<IEnumerable<OrderBasketItem>> GetOrderBasketItemsByBasketIdAsync(Guid basketId);
        Task<OrderBasketItem> AddOrderBasketItemAsync(OrderBasketItem item);
        Task<OrderBasketItem?> UpdateOrderBasketItemAsync(Guid id, OrderBasketItem item);
        Task<bool> DeleteOrderBasketItemAsync(Guid id);

        // Payment CRUD
        Task<Payment?> GetPaymentByIdAsync(Guid id);
        Task<IEnumerable<Payment>> GetAllPaymentsAsync();
        Task<Payment> AddPaymentAsync(Payment payment);
        Task<Payment?> UpdatePaymentAsync(Guid id, Payment payment);
        Task<bool> DeletePaymentAsync(Guid id);

        // Order CRUD
        Task<Order?> GetOrderByIdAsync(Guid id);
        Task<IEnumerable<Order>> GetAllOrdersAsync();
        Task<Order> AddOrderAsync(Order order);
        Task<Order?> UpdateOrderAsync(Guid id, Order order);
        Task<bool> DeleteOrderAsync(Guid id);

        // OrderItem CRUD
        Task<OrderItem?> GetOrderItemByIdAsync(Guid id);
        Task<IEnumerable<OrderItem>> GetOrderItemsByOrderIdAsync(Guid orderId);
        Task<OrderItem> AddOrderItemAsync(OrderItem item);
        Task<OrderItem?> UpdateOrderItemAsync(Guid id, OrderItem item);
        Task<bool> DeleteOrderItemAsync(Guid id);

        //User related operations
        Task<bool> UserHasBasketAsync(Guid userGuid);
        Task CreateBasketForUserAsync(Guid userGuid);
        Task<OrderBasket> GetOrderBasketByuserGuidIdAsync(Guid userGuid);

        // Get user's email address by userId
        Task<string?> GetUserEmailByIdAsync(Guid userId);

        // Get all orders for a user by their email address
        Task<IEnumerable<Order>> GetOrdersByEmailAsync(string email);


    }
}
