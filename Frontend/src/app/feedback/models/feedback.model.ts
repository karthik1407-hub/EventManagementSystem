export interface Feedback {
  feedbackID: string; // ✅ Required for delete
  eventID: string;
  userID: string;
  rating: number;
  comments: string;
  submittedTimestamp: string;
}
