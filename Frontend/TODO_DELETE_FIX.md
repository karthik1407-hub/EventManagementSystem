# TODO: Fix Delete Option in Admin Panel

## Information Gathered
- Frontend: admin.component.ts has confirmDelete() that makes HTTP DELETE requests to backend.
- Backend: Controllers have HttpDelete methods, but some have [Authorize] or [Authorize(Roles)].
- Potential Issues: Authorization failure, invalid id (not Guid string), error not displayed in UI.

## Plan
1. Add error message display in admin.component.html to show delete errors.
2. Add id validation in confirmDelete() to ensure id is valid Guid string.
3. Add console logging in confirmDelete() for debugging request/response.
4. If needed, remove [Authorize] from delete methods in backend controllers for admin access.
5. Test delete functionality after changes.

## Dependent Files
- EventmanagemetAngular/src/app/admin/admin.component.html
- EventmanagemetAngular/src/app/admin/admin.component.ts
- Event Management System/Controllers/EventController.cs
- Event Management System/Controllers/FeedbackController.cs
- Event Management System/Controllers/NotificationController.cs
- Event Management System/Controllers/TicketController.cs
- Event Management System/Controllers/PaymentController.cs

## Followup Steps
- Test delete in browser after changes.
- Check console logs for errors.
- Verify authorization if delete still fails.
