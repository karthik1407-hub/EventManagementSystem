import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
import { NavbarComponent } from './navbar/navbar.component';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { EventComponent } from './event/event.component';
import { UserComponent } from './user/user.component';
import { AdminComponent } from './admin/admin.component';
import { NotificationComponent } from './notification/notification.component';
import { TicketComponent } from './ticket/ticket.component';

import { AddEventComponent } from './event/add-event/add-event.component';
import { EditEventComponent } from './event/edit-event/edit-event.component';
import { EventDetailsComponent } from './event-details/event-details.component';
import { PaymentComponent } from './payment/payment.component';
import { UserdetailsComponent } from './userdetails/userdetails.component';
import { FeedbackComponent } from './feedback/feedback.component';

// New components for order management
import { UserOrdersComponent } from './user/user-orders/user-orders.component';
import { AdminOrdersComponent } from './admin/admin-orders/admin-orders.component';
import { AdminUserComponent } from './admin-user/admin-user.component';
import { ProfileComponent } from './user/profile/profile.component';
import { CookieService } from 'ngx-cookie-service';
import { AuthInterceptor } from './auth.interceptor';
import { CartComponent } from './cart/cart.component';
import { MyTicketComponent } from './ticket/my-ticket/my-ticket.component';

import { AboutUsComponent } from './about-us/about-us.component';
import { FooterComponent } from './footer/footer.component';

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    HomeComponent,
    LoginComponent,
    RegisterComponent,
    EventComponent,
    
    AdminComponent,
    NotificationComponent,
    TicketComponent,
    AddEventComponent,
    EditEventComponent,
    EventDetailsComponent,
    PaymentComponent,
    UserdetailsComponent,
    FeedbackComponent,
    // New components
    UserOrdersComponent,
    AdminOrdersComponent,
    AdminUserComponent,
    ProfileComponent,
    CartComponent,
    MyTicketComponent,

    AboutUsComponent,
    FooterComponent
  ],
  imports: [
    BrowserModule,
    CommonModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [
    CookieService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
