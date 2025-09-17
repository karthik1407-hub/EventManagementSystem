import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyTicketComponent } from './my-ticket.component';

describe('MyTicketComponent', () => {
  let component: MyTicketComponent;
  let fixture: ComponentFixture<MyTicketComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MyTicketComponent]
    });
    fixture = TestBed.createComponent(MyTicketComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
