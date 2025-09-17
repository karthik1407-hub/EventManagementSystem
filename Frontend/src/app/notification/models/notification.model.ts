export interface Notification {
  notificationID: string;
  userID: string;
  eventID: string;
  ticketID: string | null; // Added ticketID
  message: string;
  sentTimestamp: string;
  user?: {
    userID: string;
    name: string;
  };
  event?: {
    eventID: string;
    title: string;
  };
}

export interface CreateNotificationDto {
  userID: string;
  eventID: string;
  ticketID: string | null;
  message: string;
  sentTimestamp: string;
}
