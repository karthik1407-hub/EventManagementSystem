export interface Feedback {
  feedbackID: string; // ✅ Required for delete
  eventID: string;
  userID: string;
  rating: number;
  comments: string;
  submittedTimestamp: string;
  reply?: string; // Organizer's reply to the feedback
}
