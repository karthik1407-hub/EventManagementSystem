export interface Ticket {
  ticketID: string;
  eventID: string;
  userID: string;
  bookingDate: string;
  isCancelled: boolean;
  event?: Event; // Optional, if you're including event details
  user?: User;   // Optional, if you're including user details
}

export interface CreateTicketDto {
  eventID: string;
  userID: string;
  bookingDate: string;
  isCancelled: boolean;
}

// Optional: Event and User models
export interface Event {
  eventID: string;
  name: string;
  date: string;
  location: string;
  eventPrice: number; // Added eventPrice
  // Add other event fields
}

export interface User {
  userID: string;
  name: string;
  email: string;
  // Add other user fields
}