using Event_Management_System.Models.Domain;
using Event_Management_System.Models.DTO;
using Event_Management_System.Repositories.Interface;
using Event_Management_System.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Security.Claims;

//Tables used in this controller. 

//public DbSet<OrderBasket> OrderBaskets { get; set; }
//public DbSet<OrderBasketItem> OrderBasketItems { get; set; }
//public DbSet<Order> Orders { get; set; }
//public DbSet<OrderItem> OrderItems { get; set; }
//public DbSet<Payment> Payments { get; set; }

namespace Event_Management_System.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PaymentController : ControllerBase
    {
        private readonly IPaymentRepository paymentRepository;
        private readonly ApplicationDbContext _context;

        public PaymentController(IPaymentRepository paymentRepository, ApplicationDbContext context)
        {
            this.paymentRepository = paymentRepository;
            _context = context;
        }

        // GET: api/payment/orderbasket/{id}
        [HttpGet("orderbasket/{id:guid}")]
        public async Task<IActionResult> GetOrderBasketById(Guid id)
        {
            var basket = await paymentRepository.GetOrderBasketByIdAsync(id);
            if (basket == null) return NotFound();

            var items = basket.Items?.Select(i => new OrderBasketItemDto
            {
                Id = i.Id,
                OrderBasketId = i.OrderBasketId,
                EventId = i.EventId,
                Quantity = i.Quantity,
                UnitPrice = i.UnitPrice,
                AddedDate = i.AddedDate
            }).ToList() ?? new List<OrderBasketItemDto>();

            // Add a dummy item if the list is empty
            if (!items.Any())
            {
                items.Add(new OrderBasketItemDto
                {
                    Id = Guid.Empty,
                    OrderBasketId = basket.Id,
                    EventId = Guid.Empty,
                    Quantity = 0,
                    UnitPrice = 0,
                    AddedDate = DateTime.MinValue
                });
            }

            var dto = new OrderBasketDto
            {
                Id = basket.Id,
                UserId = basket.UserId,
                CreatedDate = basket.CreatedDate,
                UpdatedDate = basket.UpdatedDate,
                Items = items
            };

            return Ok(dto);
        }

        // GET: api/payment/orderbasket/by-user/{userId}
        [HttpGet("orderbasket/by-user/{userId:guid}")]
        public async Task<IActionResult> GetOrderBasketByUserId(Guid userId)
        {
            var basket = await paymentRepository.GetOrderBasketByuserGuidIdAsync(userId);
            if (basket == null)
            {
                // Create a new basket if it doesn't exist
                var newBasket = new OrderBasket
                {
                    UserId = userId,
                    CreatedDate = DateTime.UtcNow,
                    UpdatedDate = DateTime.UtcNow
                };
                basket = await paymentRepository.AddOrderBasketAsync(newBasket);
            }

            var items = basket.Items?.Select(i => new OrderBasketItemDto
            {
                Id = i.Id,
                OrderBasketId = i.OrderBasketId,
                EventId = i.EventId,
                Quantity = i.Quantity,
                UnitPrice = i.UnitPrice,
                AddedDate = i.AddedDate
            }).ToList() ?? new List<OrderBasketItemDto>();

            var dto = new OrderBasketDto
            {
                Id = basket.Id,
                UserId = basket.UserId,
                CreatedDate = basket.CreatedDate,
                UpdatedDate = basket.UpdatedDate,
                Items = items
            };

            return Ok(dto);
        }

        // GET: api/payment/orderbaskets
        [HttpGet("orderbaskets")]
        public async Task<IActionResult> GetAllOrderBaskets()
        {
            var baskets = await paymentRepository.GetAllOrderBasketsAsync();
            var dtos = baskets.Select(basket => new OrderBasketDto
            {
                Id = basket.Id,
                UserId = basket.UserId,
                CreatedDate = basket.CreatedDate,
                UpdatedDate = basket.UpdatedDate,
                Items = basket.Items?.Select(i => new OrderBasketItemDto
                {
                    Id = i.Id,
                    OrderBasketId = i.OrderBasketId,
                    EventId = i.EventId,
                    Quantity = i.Quantity,
                    UnitPrice = i.UnitPrice,
                    AddedDate = i.AddedDate
                }).ToList() ?? new()
            }).ToList();

            return Ok(dtos);
        }

        // POST: api/payment/orderbasket
        [HttpPost("orderbasket")]
        public async Task<IActionResult> AddOrderBasket([FromBody] CreateOrderBasketDto dto)
        {
            var basket = new OrderBasket
            {
                UserId = dto.UserId,
                CreatedDate = DateTime.UtcNow,
                UpdatedDate = DateTime.UtcNow
            };

            var created = await paymentRepository.AddOrderBasketAsync(basket);

            var resultDto = new OrderBasketDto
            {
                Id = created.Id,
                UserId = created.UserId,
                CreatedDate = created.CreatedDate,
                UpdatedDate = created.UpdatedDate,
                Items = new()
            };

            return CreatedAtAction(nameof(GetOrderBasketById), new { id = resultDto.Id }, resultDto);
        }

        // PUT: api/payment/orderbasket/{id}
        [HttpPut("orderbasket/{id:guid}")]
        public async Task<IActionResult> UpdateOrderBasket(Guid id, [FromBody] UpdateOrderBasketDto dto)
        {
            var basket = new OrderBasket
            {
                UserId = dto.UserId,
                UpdatedDate = DateTime.UtcNow
            };

            var updated = await paymentRepository.UpdateOrderBasketAsync(id, basket);
            if (updated == null) return NotFound();

            var resultDto = new OrderBasketDto
            {
                Id = updated.Id,
                UserId = updated.UserId,
                CreatedDate = updated.CreatedDate,
                UpdatedDate = updated.UpdatedDate,
                Items = updated.Items?.Select(i => new OrderBasketItemDto
                {
                    Id = i.Id,
                    OrderBasketId = i.OrderBasketId,
                    EventId = i.EventId,
                    Quantity = i.Quantity,
                    UnitPrice = i.UnitPrice,
                    AddedDate = i.AddedDate
                }).ToList() ?? new()
            };

            return Ok(resultDto);
        }

        // DELETE: api/payment/orderbasket/{id}
        [HttpDelete("orderbasket/{id:guid}")]
        public async Task<IActionResult> DeleteOrderBasket(Guid id)
        {
            var deleted = await paymentRepository.DeleteOrderBasketAsync(id);
            if (!deleted) return NotFound();
            return NoContent();
        }

        // GET: api/payment/orderbasketitem/{id}
        [HttpGet("orderbasketitem/{id:guid}")]
        public async Task<IActionResult> GetOrderBasketItemById(Guid id)
        {
            var item = await paymentRepository.GetOrderBasketItemByIdAsync(id);
            if (item == null) return NotFound();

            var dto = new OrderBasketItemDto
            {
                Id = item.Id,
                OrderBasketId = item.OrderBasketId,
                EventId = item.EventId,
                Quantity = item.Quantity,
                UnitPrice = item.UnitPrice,
                AddedDate = item.AddedDate
            };

            return Ok(dto);
        }

        // GET: api/payment/orderbasketitems/{basketId}
        [HttpGet("orderbasketitems/{basketId:guid}")]
        public async Task<IActionResult> GetOrderBasketItemsByBasketId(Guid basketId)
        {
            var items = await paymentRepository.GetOrderBasketItemsByBasketIdAsync(basketId);
            var dtos = items.Select(item => new OrderBasketItemDto
            {
                Id = item.Id,
                OrderBasketId = item.OrderBasketId,
                EventId = item.EventId,
                Quantity = item.Quantity,
                UnitPrice = item.UnitPrice,
                AddedDate = item.AddedDate
            }).ToList();

            return Ok(dtos);
        }

        // POST: api/payment/orderbasketitem
        [HttpPost("orderbasketitem")]
        public async Task<IActionResult> AddOrderBasketItem([FromBody] CreateOrderBasketItemDto dto)
        {
            var item = new OrderBasketItem
            {
                OrderBasketId = dto.OrderBasketId,
                EventId = dto.ProductId,
                Quantity = dto.Quantity,
                UnitPrice = dto.UnitPrice,
                AddedDate = DateTime.UtcNow
            };

            var created = await paymentRepository.AddOrderBasketItemAsync(item);

            var resultDto = new OrderBasketItemDto
            {
                Id = created.Id,
                OrderBasketId = created.OrderBasketId,
                EventId = created.EventId,
                Quantity = created.Quantity,
                UnitPrice = created.UnitPrice,
                AddedDate = created.AddedDate
            };

            return CreatedAtAction(nameof(GetOrderBasketItemById), new { id = resultDto.Id }, resultDto);
        }

        // PUT: api/payment/orderbasketitem/{id}
        [HttpPut("orderbasketitem/{id:guid}")]
        public async Task<IActionResult> UpdateOrderBasketItem(Guid id, [FromBody] UpdateOrderBasketItemDto dto)
        {
            var item = new OrderBasketItem
            {
                EventId = dto.ProductId,
                Quantity = dto.Quantity,
                UnitPrice = dto.UnitPrice
            };

            var updated = await paymentRepository.UpdateOrderBasketItemAsync(id, item);
            if (updated == null) return NotFound();

            var resultDto = new OrderBasketItemDto
            {
                Id = updated.Id,
                OrderBasketId = updated.OrderBasketId,
                EventId = updated.EventId,
                Quantity = updated.Quantity,
                UnitPrice = updated.UnitPrice,
                AddedDate = updated.AddedDate
            };

            return Ok(resultDto);
        }

        // DELETE: api/payment/orderbasketitem/{id}
        [HttpDelete("orderbasketitem/{id:guid}")]
        public async Task<IActionResult> DeleteOrderBasketItem(Guid id)
        {
            var deleted = await paymentRepository.DeleteOrderBasketItemAsync(id);
            if (!deleted) return NotFound();
            return NoContent();
        }

        [HttpPost("complete-order")]
        [Authorize]
        public async Task<IActionResult> CompleteOrder(Guid UserId, Guid PaymentId)
        {

            //get all the items from the order basket
            var basketIdNullable = await paymentRepository.GetOrderBasketByuserGuidIdAsync(UserId);
            if (basketIdNullable == null)
            {
                return BadRequest("Order basket not found for user.");
            }
            var basketId = basketIdNullable.Id;

            IEnumerable<OrderBasketItem> listofitems = await paymentRepository.GetOrderBasketItemsByBasketIdAsync(basketId);

            //check if basket is empty

            if (!listofitems.Any())
            {
                return BadRequest("Order basket is empty.");
            }

            // Create the order
            var order = new Order
            {
                UserId = UserId,
                PaymentId = PaymentId,
                Status = OrderStatus.Booked,
                CreatedDate = DateTime.UtcNow,
                UpdatedDate = DateTime.UtcNow
            };

            var createdOrder = await paymentRepository.AddOrderAsync(order);



            // Copy all basket items to orderItems as DTOs
            var orderItems = new List<OrderItemDto>(); ;
            foreach (var basketItem in listofitems)
            {
                var orderItem = new OrderItem
                {
                    OrderId = createdOrder.Id,
                    EventId = basketItem.EventId,
                    Quantity = basketItem.Quantity,
                    UnitPrice = basketItem.UnitPrice
                };

                var createdOrderItem = await paymentRepository.AddOrderItemAsync(orderItem);

                orderItems.Add(new OrderItemDto
                {
                    Id = createdOrderItem.Id,
                    OrderId = createdOrderItem.OrderId,
                    ProductId = createdOrderItem.EventId,
                    Quantity = createdOrderItem.Quantity,
                    UnitPrice = createdOrderItem.UnitPrice
                });
            }

            //go through each item in the listofitems and delete them from the order basket

            foreach (var basketItem in listofitems)
            {
                await paymentRepository.DeleteOrderBasketItemAsync(basketItem.Id);
            }

            // Prepare response DTO
            var responseDto = new OrderDto
            {
                Id = createdOrder.Id,
                UserId = createdOrder.UserId,
                PaymentId = createdOrder.PaymentId,
                Status = createdOrder.Status,
                CreatedDate = createdOrder.CreatedDate,
                UpdatedDate = createdOrder.UpdatedDate,
                Items = orderItems
            };

            return Ok(responseDto);
        }

        [HttpPost("payment")]
        public async Task<IActionResult> AddPayment([FromBody] CreatePaymentDto dto)
        {

            var tempTransactionId = Guid.NewGuid().ToString(); // Simulate a transaction ID from a payment gateway  
            tempTransactionId = tempTransactionId + "-" + DateTime.UtcNow.Ticks.ToString(); // Make it more unique by appending ticks
            var payment = new Payment
            {
                UserId = dto.UserId,
                Amount = dto.Amount,
                Method = dto.Method,
                Status = dto.Status,
                TransactionId = tempTransactionId,
                CreatedDate = DateTime.UtcNow
            };

            var created = await paymentRepository.AddPaymentAsync(payment);

            var resultDto = new PaymentDto
            {
                Id = created.Id,
                UserId = created.UserId,
                Amount = created.Amount,
                Method = created.Method,
                Status = created.Status,
                TransactionId = created.TransactionId,
                CreatedDate = created.CreatedDate
            };

            return CreatedAtAction(nameof(AddPayment), new { id = resultDto.Id }, resultDto);
        }

        // GET: api/payment/order/{id}
        [HttpGet("order/{id:guid}")]
        public async Task<IActionResult> GetOrderById(Guid id)
        {
            var order = await paymentRepository.GetOrderByIdAsync(id);
            if (order == null) return NotFound();

            //var items = order.Items?.Select(i => new OrderItemDto
            //{
            //    Id = i.Id,
            //    OrderId = i.OrderId,
            //    ProductId = i.ProductId,
            //    Quantity = i.Quantity,
            //    UnitPrice = i.UnitPrice
            //}).ToList() ?? new List<OrderItemDto>();

            var email = await paymentRepository.GetUserEmailByIdAsync(order.UserId);

            var dto = new OrderDto2
            {
                Id = order.Id,
                UserId = order.UserId,
                Email = email,
                PaymentId = order.PaymentId,
                Status = order.Status,
                CreatedDate = order.CreatedDate,
                UpdatedDate = order.UpdatedDate,
                StatusString = order.Status.ToString()
                //Items = items
            };

            return Ok(dto);
        }

        // GET: api/payment/orders
        [HttpGet("orders")]
        [Authorize(Roles = "Event Organizer")]
        public async Task<IActionResult> GetAllOrders()
        {
            var userIdString = HttpContext.User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdString) || !Guid.TryParse(userIdString, out Guid userId))
            {
                return Unauthorized("User is not authenticated or the ID is invalid.");
            }

            var orders = await paymentRepository.GetAllOrdersAsync();
            var dtos = new List<OrderDto2>();

            foreach (var order in orders)
            {
                // Check if the order contains any items for events owned by the current organizer
                var hasEventForOrganizer = order.Items.Any(item =>
                    _context.Events.Any(e => e.EventID == item.EventId && e.OrganizerID == userId));

                if (!hasEventForOrganizer)
                {
                    continue; // Skip orders that do not belong to this organizer's events
                }

                var email = await paymentRepository.GetUserEmailByIdAsync(order.UserId);
                var payment = await paymentRepository.GetPaymentByIdAsync(order.PaymentId);

                var dto = new OrderDto2
                {
                    Id = order.Id,
                    UserId = order.UserId,
                    Email = email,
                    PaymentId = order.PaymentId,
                    Status = order.Status,
                    CreatedDate = order.CreatedDate,
                    UpdatedDate = order.UpdatedDate,
                    StatusString = order.Status.ToString(),
                    PaymentAmount = payment?.Amount ?? 0
                };

                dtos.Add(dto);
            }

            return Ok(dtos);
        }

        // PUT: api/payment/order/{id}
        [HttpPut("order/{id:guid}")]
        [Authorize(Roles = "Event Organizer")]
        public async Task<IActionResult> UpdateOrder(Guid id, [FromBody] UpdateOrderDto dto)
        {
            var existingOrder = await paymentRepository.GetOrderByIdAsync(id);
            if (existingOrder == null) return NotFound();

            existingOrder.Status = (OrderStatus)dto.Status;
            existingOrder.UpdatedDate = DateTime.UtcNow;

            var updated = await paymentRepository.UpdateOrderAsync(id, existingOrder);
            if (updated == null) return NotFound();

            return Ok(new { updated.Id, updated.Status });
        }

        // GET: api/payment/orders/by-email?email=someone@example.com
        [HttpGet("orders/by-email")]
        public async Task<IActionResult> GetOrdersByEmail([FromQuery] string email)
        {
            if (string.IsNullOrWhiteSpace(email))
                return BadRequest("Email is required.");

            var orders = await paymentRepository.GetOrdersByEmailAsync(email);
            var dtos = orders.Select(order => new OrderDto2
            {
                Id = order.Id,
                UserId = order.UserId,
                Email = email,
                PaymentId = order.PaymentId,
                Status = order.Status,
                CreatedDate = order.CreatedDate,
                UpdatedDate = order.UpdatedDate,
                StatusString = order.Status.ToString()
                // Items can be added if needed
            }).ToList();

            return Ok(dtos);
        }

        // GET: api/Payment
        [HttpGet]
        public async Task<IActionResult> GetAllPayments()
        {
            var payments = await paymentRepository.GetAllPaymentsAsync();
            var dtos = payments.Select(payment => new PaymentDto
            {
                Id = payment.Id,
                UserId = payment.UserId,
                Amount = payment.Amount,
                Method = payment.Method,
                Status = payment.Status,
                TransactionId = payment.TransactionId,
                CreatedDate = payment.CreatedDate
            }).ToList();

            return Ok(dtos);
        }

        // GET: api/Payment/{id}
        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetPaymentById(Guid id)
        {
            var payment = await paymentRepository.GetPaymentByIdAsync(id);
            if (payment == null) return NotFound();

            var dto = new PaymentDto
            {
                Id = payment.Id,
                UserId = payment.UserId,
                Amount = payment.Amount,
                Method = payment.Method,
                Status = payment.Status,
                TransactionId = payment.TransactionId,
                CreatedDate = payment.CreatedDate
            };

            return Ok(dto);
        }

        // DELETE: api/Payment/{id}
        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> DeletePayment(Guid id)
        {
            var deleted = await paymentRepository.DeletePaymentAsync(id);
            if (!deleted) return NotFound();
            return NoContent();
        }

        public class OrderItemDto
        {
            public Guid Id { get; set; }
            public Guid OrderId { get; set; }
            public Guid ProductId { get; set; }
            public int Quantity { get; set; }
            public decimal UnitPrice { get; set; }
        }

        public class OrderDto
        {
            public Guid Id { get; set; }
            public Guid UserId { get; set; }
            public Guid PaymentId { get; set; }
            public OrderStatus Status { get; set; }
            public DateTime CreatedDate { get; set; }
            public DateTime UpdatedDate { get; set; }
            public List<OrderItemDto> Items { get; set; }
        }

        public class CreatePaymentDto
        {
            public Guid UserId { get; set; }
            public decimal Amount { get; set; }
            public string Method { get; set; }
            public PaymentStatus Status { get; set; }
            public string TransactionId { get; set; }
        }

        public class PaymentDto
        {
            public Guid Id { get; set; }
            public Guid UserId { get; set; }
            public decimal Amount { get; set; }
            public string Method { get; set; }
            public PaymentStatus Status { get; set; }
            public string TransactionId { get; set; }
            public DateTime CreatedDate { get; set; }
        }

        public class UpdateOrderDto
        {
            //I realised I don't need to update UserId or PaymentId for an order. Only status can be updated.
            //public Guid UserId { get; set; }
            //public Guid PaymentId { get; set; }
            public int Status { get; set; }
        }

                public class OrderDto2
        {
            public Guid Id { get; set; }
            public Guid UserId { get; set; }
            public string? Email { get; set; }
            public Guid PaymentId { get; set; }
            public OrderStatus Status { get; set; }
            public DateTime CreatedDate { get; set; }
            public DateTime UpdatedDate { get; set; }
            public string StatusString { get; set; }
            public decimal PaymentAmount { get; set; }
        }
    }
}
