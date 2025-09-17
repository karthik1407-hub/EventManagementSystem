using Event_Management_System.Data;
using Event_Management_System.Models.Domain;
using Event_Management_System.Repositories.Interface;
using EventManagementSystem.Data;
using Microsoft.EntityFrameworkCore;

namespace Event_Management_System.Repositories.Implementation
{
    public class PaymentRepository : IPaymentRepository
    {
        private readonly ApplicationDbContext dbContext;
        private readonly AuthDbContext authDbContext;

        public PaymentRepository(ApplicationDbContext dbContext, AuthDbContext authDbContext)
        {
            this.dbContext = dbContext;
            this.authDbContext = authDbContext;
        }

        // OrderBasket CRUD
        public async Task<OrderBasket?> GetOrderBasketByIdAsync(Guid id)
            => await dbContext.OrderBaskets.Include(b => b.Items).FirstOrDefaultAsync(b => b.Id == id);

        public async Task<IEnumerable<OrderBasket>> GetAllOrderBasketsAsync()
            => await dbContext.OrderBaskets.Include(b => b.Items).ToListAsync();

        public async Task<OrderBasket> AddOrderBasketAsync(OrderBasket basket)
        {
            basket.Id = Guid.NewGuid();
            dbContext.OrderBaskets.Add(basket);
            await dbContext.SaveChangesAsync();
            return basket;
        }

        public async Task<OrderBasket?> UpdateOrderBasketAsync(Guid id, OrderBasket basket)
        {
            var existing = await dbContext.OrderBaskets.FindAsync(id);
            if (existing == null) return null;

            existing.UserId = basket.UserId;
            existing.UpdatedDate = DateTime.UtcNow;
            // Optionally update other fields

            await dbContext.SaveChangesAsync();
            return existing;
        }

        public async Task<bool> DeleteOrderBasketAsync(Guid id)
        {
            var existing = await dbContext.OrderBaskets.FindAsync(id);
            if (existing == null) return false;

            dbContext.OrderBaskets.Remove(existing);
            await dbContext.SaveChangesAsync();
            return true;
        }

        // OrderBasketItem CRUD
        public async Task<OrderBasketItem?> GetOrderBasketItemByIdAsync(Guid id)
            => await dbContext.OrderBasketItems.FindAsync(id);

        public async Task<IEnumerable<OrderBasketItem>> GetOrderBasketItemsByBasketIdAsync(Guid basketId)
            => await dbContext.OrderBasketItems.Where(i => i.OrderBasketId == basketId).ToListAsync();

        public async Task<OrderBasketItem> AddOrderBasketItemAsync(OrderBasketItem item)
        {
            item.Id = Guid.NewGuid();
            dbContext.OrderBasketItems.Add(item);
            await dbContext.SaveChangesAsync();
            return item;
        }

        public async Task<OrderBasketItem?> UpdateOrderBasketItemAsync(Guid id, OrderBasketItem item)
        {
            var existing = await dbContext.OrderBasketItems.FindAsync(id);
            if (existing == null) return null;

            existing.EventId = item.EventId;
            existing.Quantity = item.Quantity;
            existing.UnitPrice = item.UnitPrice;
            // Optionally update other fields

            await dbContext.SaveChangesAsync();
            return existing;
        }

        public async Task<bool> DeleteOrderBasketItemAsync(Guid id)
        {
            var existing = await dbContext.OrderBasketItems.FindAsync(id);
            if (existing == null) return false;

            dbContext.OrderBasketItems.Remove(existing);
            await dbContext.SaveChangesAsync();
            return true;
        }

        // Payment CRUD
        public async Task<Payment?> GetPaymentByIdAsync(Guid id)
            => await dbContext.Payments.FindAsync(id);

        public async Task<IEnumerable<Payment>> GetAllPaymentsAsync()
            => await dbContext.Payments.ToListAsync();

        public async Task<Payment> AddPaymentAsync(Payment payment)
        {
            payment.Id = Guid.NewGuid();
            dbContext.Payments.Add(payment);
            await dbContext.SaveChangesAsync();
            return payment;
        }

        public async Task<Payment?> UpdatePaymentAsync(Guid id, Payment payment)
        {
            var existing = await dbContext.Payments.FindAsync(id);
            if (existing == null) return null;

            existing.Amount = payment.Amount;
            existing.Method = payment.Method;
            existing.Status = payment.Status;
            existing.TransactionId = payment.TransactionId;
            // Optionally update other fields

            await dbContext.SaveChangesAsync();
            return existing;
        }

        public async Task<bool> DeletePaymentAsync(Guid id)
        {
            var existing = await dbContext.Payments.FindAsync(id);
            if (existing == null) return false;

            dbContext.Payments.Remove(existing);
            await dbContext.SaveChangesAsync();
            return true;
        }

        // Order CRUD
        public async Task<Order?> GetOrderByIdAsync(Guid id)
            => await dbContext.Orders.Include(o => o.Items).Include(o => o.Payment).FirstOrDefaultAsync(o => o.Id == id);

        public async Task<IEnumerable<Order>> GetAllOrdersAsync()
            => await dbContext.Orders.Include(o => o.Items).Include(o => o.Payment).ToListAsync();

        public async Task<Order> AddOrderAsync(Order order)
        {
            order.Id = Guid.NewGuid();
            dbContext.Orders.Add(order);
            await dbContext.SaveChangesAsync();
            return order;
        }

        public async Task<Order?> UpdateOrderAsync(Guid id, Order order)
        {
            var existing = await dbContext.Orders.FindAsync(id);
            if (existing == null) return null;

            existing.UserId = order.UserId;
            existing.PaymentId = order.PaymentId;
            existing.Status = order.Status;
            existing.UpdatedDate = DateTime.UtcNow;
            // Optionally update other fields

            await dbContext.SaveChangesAsync();
            return existing;
        }

        public async Task<bool> DeleteOrderAsync(Guid id)
        {
            var existing = await dbContext.Orders.FindAsync(id);
            if (existing == null) return false;

            dbContext.Orders.Remove(existing);
            await dbContext.SaveChangesAsync();
            return true;
        }

        // OrderItem CRUD
        public async Task<OrderItem?> GetOrderItemByIdAsync(Guid id)
            => await dbContext.OrderItems.FindAsync(id);

        public async Task<IEnumerable<OrderItem>> GetOrderItemsByOrderIdAsync(Guid orderId)
            => await dbContext.OrderItems.Where(i => i.OrderId == orderId).ToListAsync();

        public async Task<OrderItem> AddOrderItemAsync(OrderItem item)
        {
            item.Id = Guid.NewGuid();
            dbContext.OrderItems.Add(item);
            await dbContext.SaveChangesAsync();
            return item;
        }

        public async Task<OrderItem?> UpdateOrderItemAsync(Guid id, OrderItem item)
        {
            var existing = await dbContext.OrderItems.FindAsync(id);
            if (existing == null) return null;

            existing.EventId = item.EventId;
            existing.Quantity = item.Quantity;
            existing.UnitPrice = item.UnitPrice;
            // Optionally update other fields

            await dbContext.SaveChangesAsync();
            return existing;
        }

        public async Task<bool> DeleteOrderItemAsync(Guid id)
        {
            var existing = await dbContext.OrderItems.FindAsync(id);
            if (existing == null) return false;

            dbContext.OrderItems.Remove(existing);
            await dbContext.SaveChangesAsync();
            return true;
        }

        public async Task<bool> UserHasBasketAsync(Guid userGuid)
        {
            return await dbContext.OrderBaskets.AnyAsync(b => b.UserId == userGuid);
        }

        public async Task CreateBasketForUserAsync(Guid userGuid)
        {
            // Check if a basket already exists for the user
            var exists = await dbContext.OrderBaskets.AnyAsync(b => b.UserId == userGuid);
            if (exists)
                return;

            var basket = new OrderBasket
            {
                Id = Guid.NewGuid(),
                UserId = userGuid,
                CreatedDate = DateTime.UtcNow,
                UpdatedDate = DateTime.UtcNow
            };

            dbContext.OrderBaskets.Add(basket);
            await dbContext.SaveChangesAsync();
        }

        public async Task<OrderBasket?> GetOrderBasketByuserGuidIdAsync(Guid userGuid)
        {
            return await dbContext.OrderBaskets
                .Include(b => b.Items)
                .FirstOrDefaultAsync(b => b.UserId == userGuid);
        }

        public async Task<string?> GetUserEmailByIdAsync(Guid userId)
        {
            // If your IdentityUser's Id is a string, convert Guid to string
            var user = await authDbContext.Users.FirstOrDefaultAsync(u => u.Id == userId.ToString());
            return user?.Email;
        }

        public async Task<IEnumerable<Order>> GetOrdersByEmailAsync(string email)
        {
            // Find the user by email in the AuthDbContext
            var user = await authDbContext.Users.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null)
                return Enumerable.Empty<Order>();

            // Convert user.Id (string) to Guid if needed
            if (!Guid.TryParse(user.Id, out Guid userGuid))
                return Enumerable.Empty<Order>();

            // Fetch orders for this user
            return await dbContext.Orders
                .Include(o => o.Items)
                .Include(o => o.Payment)
                .Where(o => o.UserId == userGuid)
                .ToListAsync();
        }
    }
}
