export interface Event {
    eventID: string;
    eventName: string;
    eventType: string;
    eventLocation: string;
    eventDate: string;
    eventDescription: string;
    eventPrice: number;
    eventImageUrl: string;
    tags: string[];
    organizerID: string;
}
