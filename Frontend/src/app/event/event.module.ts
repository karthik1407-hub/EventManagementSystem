import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { EventComponent } from './event.component';
import { AuthGuard } from '../auth.guard';

const routes: Routes = [
  { path: '', component: EventComponent, canActivate: [AuthGuard] }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(routes)
  ]
})
export class EventModule { }
