# TODO: Restrict Organizer Access to Own Events and Order History

## EventController.cs Modifications
- [x] Modify GetAllEvents() to filter events where OrganizerID matches the current user's ID
- [x] Modify GetEventById() to check if the event's OrganizerID matches the current user before returning
- [x] Modify UpdateEvent() to check ownership before allowing updates
- [x] Modify DeleteEvent() to check ownership before allowing deletion

## TicketController.cs Modifications
- [x] Modify GetTickets() to filter tickets where the associated event's OrganizerID matches the current user
- [x] Modify GetTicket() to check if the ticket's event belongs to the current organizer
- [x] Ensure UpdateTicket() respects organizer permissions for their events' tickets
- [x] Modify DeleteTicket() to check ownership before allowing deletion

## Testing
- [x] Test API endpoints to verify organizers can only access their own data
- [x] Check frontend components if updates are needed for restricted data handling
