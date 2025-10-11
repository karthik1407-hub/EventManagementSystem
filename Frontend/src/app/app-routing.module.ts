import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Core Components
import { HomeComponent } from './home/home.component';
import { AboutUsComponent } from './about-us/about-us.component';

import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';

// Auth & Admin
import { AuthGuard } from './auth.guard';
import { AdminComponent } from './admin/admin.component';
import { AdminUserComponent } from './admin-user/admin-user.component';
import { AdminOrdersComponent } from './admin/admin-orders/admin-orders.component';
// Event Management
import { EventComponent } from './event/event.component';
import { EventDetailsComponent } from './event-details/event-details.component';
import { AddEventComponent } from './event/add-event/add-event.component';
import { EditEventComponent } from './event/edit-event/edit-event.component';

// User Management
import { UserdetailsComponent } from './userdetails/userdetails.component';
import {ProfileComponent} from "./user/profile/profile.component";

// Features
import { PaymentComponent } from './payment/payment.component';
import { FeedbackComponent } from './feedback/feedback.component';
import { NotificationComponent } from './notification/notification.component';
import { CartComponent } from './cart/cart.component';

// Ticket Feature
import { TicketComponent } from './ticket/ticket.component'; // ✅ NEW
import { OrganizerComponent } from './organizer/organizer.component';


const routes: Routes = [
  { path: '', component: HomeComponent },
  
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {path: 'about-us', component: AboutUsComponent},

  // Protected Routes
  
  { path: 'admin', component: AdminComponent, canActivate: [AuthGuard], data: { roles: ['Admin'] } },
  { path: 'admin/users', component: AdminUserComponent, canActivate: [AuthGuard], data: { roles: ['Admin'] } },
  { path: 'admin/orders', component: AdminOrdersComponent, canActivate: [AuthGuard], data: { roles: ['Event Organizer', 'Admin'] } },
  { path: 'add-event', component: AddEventComponent, canActivate: [AuthGuard] },
  { path: 'event/add', component: AddEventComponent, canActivate: [AuthGuard] },
  { path: 'event/edit/:id', component: EditEventComponent, canActivate: [AuthGuard] },
  { path: 'cart', component: CartComponent, canActivate: [AuthGuard] },
  { path: 'payment', component: PaymentComponent, canActivate: [AuthGuard] },
  { path: 'feedback', component: FeedbackComponent, canActivate: [AuthGuard] },
  { path: 'notifications', component: NotificationComponent, canActivate: [AuthGuard] },
  { path: 'userdetails', component: UserdetailsComponent, canActivate: [AuthGuard] },
  {path: 'user/profile', component: ProfileComponent, canActivate: [AuthGuard]},


  // Ticket Routes
  { path: 'tickets', component: TicketComponent, canActivate: [AuthGuard] }, // ✅ Ticket list

  // Organizer Route
  { path: 'organizer', component: OrganizerComponent, canActivate: [AuthGuard], data: { roles: ['Event Organizer'] } },

  // Public Event Routes
  { path: 'event', component: EventComponent },
  { path: 'events/details/:id', component: EventDetailsComponent },

  // Fallback
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}