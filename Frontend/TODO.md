# TODO: Fix 403 Forbidden Error on Ticket API and Organizer Access Issues

## Issue
- 403 Forbidden error when loading tickets from the API
- Edit and delete buttons not visible for organizers in event details

## Root Causes
- Role name mismatch in TicketController.cs: backend assigns "Admin", "Event Organizer", "Attendee" but controller checked for "admin", "organizer", "user"
- Role name mismatch in EventController.cs: [Authorize(Roles = "organizer")] but actual role is "Event Organizer"

## Tasks
- [x] Update role checks in TicketController.cs to match actual roles: "Admin", "Event Organizer", "Attendee"
- [x] Update [Authorize(Roles = "organizer")] to [Authorize(Roles = "Event Organizer")] in EventController.cs for UpdateEvent and DeleteEvent
- [x] Update DeleteTicket logic to allow users to delete cancelled tickets or tickets for ended events
- [ ] Test the ticket loading after changes
- [ ] Test organizer access to edit/delete buttons in event details
- [ ] Test ticket deletion for cancelled and ended events

## Files Edited
- Event Management System/Controllers/TicketController.cs
- Event Management System/Controllers/EventController.cs
