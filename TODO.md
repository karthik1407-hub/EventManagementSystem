# Task: Fix Booking Status Reflection in User Ticket View

## Steps to Complete:

1. [x] Edit Backend/Controllers/PaymentController.cs:
   - Add Items property to OrderDto2 class (List<OrderItemDto> Items).
   - In GetAllOrders method, map order.Items to DTO Items in the loop.
   - In GetOrdersByEmail method, map order.Items to DTO Items in the select.
   - In UpdateOrder method, after updating Order.Status, if new status is OrderStatus.Cancelled, query OrderItems for the order ID, get unique EventIDs, then for each EventID, update all Tickets where Ticket.UserID == order.UserId and Ticket.EventID == EventID to set IsCancelled = true, and save changes.

2. [ ] Verify backend changes: Run dotnet build to ensure no compilation errors.

3. [ ] Edit Frontend/src/app/ticket/my-ticket/my-ticket.component.ts:
   - Add a property relevantOrder: Order | null = null;
   - In loadTicket(), after setting this.ticket, call a new method findRelevantOrder() to filter orders for the one with item.productId === this.ticket.eventID, set relevantOrder.
   - Add findRelevantOrder() method: Loop through orders, check if any item.productId (EventId) matches ticket.eventID, return first matching order.
   - Update HTML to display status from relevantOrder?.status if exists, else fallback to ticket.isCancelled mapped to OrderStatus.

4. [ ] Edit Frontend/src/app/ticket/my-ticket/my-ticket.component.html:
   - Change status display to use relevantOrder.status if available, else ticket.isCancelled.

5. [ ] Test:
   - Start backend and frontend.
   - As organizer, update an order status to Cancelled.
   - Verify in DB that related ticket IsCancelled = true.
   - As attendee, refresh my-ticket page, confirm status shows 'Cancelled'.

6. [ ] [x] Mark complete and attempt_completion.
