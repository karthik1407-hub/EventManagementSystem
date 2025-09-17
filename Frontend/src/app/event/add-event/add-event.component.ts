import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EventService } from 'src/app/event/services/event.service';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-add-event',
  templateUrl: './add-event.component.html',
  styleUrls: ['./add-event.component.css']
})
export class AddEventComponent implements OnInit {
  addEventForm!: FormGroup;
  loading = false;
  successMessage = '';
  errorMessage = '';
  selectedFile: File | null = null;
  imagePreview: string | ArrayBuffer | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private eventService: EventService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.addEventForm = this.formBuilder.group({
      eventName: ['', [Validators.required, Validators.minLength(3)]],
      eventType: ['', Validators.required],
      eventLocation: ['', Validators.required],
      eventDate: ['', Validators.required],
      eventDescription: ['', [Validators.required, Validators.maxLength(1000)]],
      eventPrice: ['', [Validators.required, Validators.min(0)]],
      tags: ['']
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files?.[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit(): void {
    if (this.addEventForm.invalid || !this.selectedFile) {
      this.errorMessage = 'Please fill out all required fields and select an image.';
      return;
    }

    this.loading = true;
    this.successMessage = '';
    this.errorMessage = '';

    const formData = new FormData();
    Object.keys(this.addEventForm.controls).forEach(key => {
      formData.append(key, this.addEventForm.get(key)!.value);
    });

    // ✅ Match backend field name
    formData.append('EventImage', this.selectedFile);

    this.eventService.addEvent(formData).pipe(
      finalize(() => this.loading = false)
    ).subscribe({
      next: (response) => {
        this.successMessage = 'Event added successfully! Redirecting...';
        setTimeout(() => {
          this.router.navigate(['/events/details', response.eventID]);
        }, 2000);
      },
      error: (error) => {
        this.errorMessage = error?.error?.message || 'Failed to add event. Please try again.';
        console.error('Error adding event:', error);
      }
    });
  }
}
