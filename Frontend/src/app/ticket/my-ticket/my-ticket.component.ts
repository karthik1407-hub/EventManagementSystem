import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TicketService } from '../services/ticket.service';
import { Ticket } from '../models/ticket.model';
import { AuthService } from 'src/app/auth.service';

@Component({
  selector: 'app-my-ticket',
  templateUrl: './my-ticket.component.html',
  styleUrls: ['./my-ticket.component.css']
})
export class MyTicketComponent implements OnInit {
  ticketId: string | null = null;
  ticket: Ticket | undefined;
  errorMessage: string = '';

  constructor(
    private route: ActivatedRoute,
    private ticketService: TicketService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.ticketId = params.get('ticketId');
      if (this.ticketId) {
        this.loadTicket();
      }
    });
  }

  loadTicket(): void {
    if (!this.ticketId) {
      this.errorMessage = 'Ticket ID is missing.';
      return;
    }

    this.ticketService.getTicket(this.ticketId).subscribe({
      next: (ticket) => {
        this.ticket = ticket;
      },
      error: (err) => {
        console.error('Failed to load ticket', err);
        this.errorMessage = 'Failed to load ticket. Please try again.';
      }
    });
  }
}
