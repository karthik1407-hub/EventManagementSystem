# TODO: Allow Organizer to Create and Edit Feedback

## Tasks
- [x] Update feedback.component.html to show form for organizer (create)
- [x] Update feedback.component.html to show edit button for organizer
- [ ] Test the changes in the application

## Information Gathered
- Backend FeedbackController has POST and PUT endpoints without role restrictions.
- Frontend feedback component restricts UI based on roles: isUser, isOrganizer, isAdmin.
- User model has Roles field (string).
- Currently, form is shown only for isUser or (isAdmin and editing), edit button only for isAdmin.

## Plan
- Modify the *ngIf conditions in feedback.component.html to include isOrganizer for form visibility and edit button.
- Ensure userID selection is available for organizer (already is, since isAdmin || isOrganizer).

## Dependent Files
- EventmanagemetAngular/src/app/feedback/feedback.component.html
