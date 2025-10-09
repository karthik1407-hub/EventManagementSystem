import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EventService } from 'src/app/event/services/event.service';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-edit-event',
  templateUrl: './edit-event.component.html',
  styleUrls: ['./edit-event.component.css']
})
export class EditEventComponent implements OnInit {
  editEventForm!: FormGroup;
  loading = false;
  successMessage = '';
  errorMessage = '';
  selectedFile: File | null = null;
  imagePreview: string | ArrayBuffer | null = null;
  eventId: string | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private eventService: EventService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.editEventForm = this.formBuilder.group({
      eventName: ['', [Validators.required, Validators.minLength(3)]],
      eventType: ['', Validators.required],
      eventLocation: ['', Validators.required],
      eventDate: ['', Validators.required],
      eventDescription: ['', [Validators.required, Validators.maxLength(1000)]],
      eventPrice: ['', [Validators.required, Validators.min(0)]],
      eventImage:['', [Validators.required], Validators.pattern(/.*\.(jpg|jpeg|png|gif)$/i)],
      tags: ['']
    });

    this.eventId = this.route.snapshot.paramMap.get('id');
    if (this.eventId) {
      this.loadEvent(this.eventId);
    }
  }

  loadEvent(id: string): void {
    this.eventService.getEventById(id).subscribe({
      next: (event) => {
        this.editEventForm.patchValue({
          eventName: event.eventName,
          eventType: event.eventType,
          eventLocation: event.eventLocation,
          eventDate: event.eventDate,
          eventDescription: event.eventDescription,
          eventPrice: event.eventPrice,
          eventImage: event.eventImageUrl,
          tags: event.tags ? event.tags.join(', ') : ''
        });
        this.imagePreview = event.eventImageUrl ? '/EventImages/' + event.eventImageUrl : null;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load event details.';
        console.error('Error loading event:', error);
      }
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
    if (this.editEventForm.invalid) {
      this.errorMessage = 'Please fill out all required fields.';
      return;
    }

    if (!this.eventId) {
      this.errorMessage = 'Invalid event ID.';
      return;
    }

    this.loading = true;
    this.successMessage = '';
    this.errorMessage = '';

    const formData = new FormData();
    Object.keys(this.editEventForm.controls).forEach(key => {
      const value = this.editEventForm.get(key)!.value;
      if (key === 'tags' && value) {
        // Convert comma-separated string back to array
        const tagsArray = value.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag);
        formData.append(key, JSON.stringify(tagsArray));
      } else {
        formData.append(key, value);
      }
    });

    if (this.selectedFile) {
      formData.append('EventImage', this.selectedFile);
    }

    this.eventService.updateEvent(this.eventId, formData).pipe(
      finalize(() => this.loading = false)
    ).subscribe({
      next: (response) => {
        this.successMessage = 'Event updated successfully! Redirecting...';
        setTimeout(() => {
          this.router.navigate(['/admin']);
        }, 2000);
      },
      error: (error) => {
        this.errorMessage = error?.error?.message || 'Failed to update event. Please try again.';
        console.error('Error updating event:', error);
      }
    });
  }
}
