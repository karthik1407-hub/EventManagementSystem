import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { HttpClient } from '@angular/common/http';


@Component({
  selector: 'app-userdetails',
  templateUrl: './userdetails.component.html'
})
export class UserdetailsComponent implements OnInit {
  updateForm!: FormGroup;
  userId: string = '58ca0ebb-cc09-4696-b8c4-793212d81df1'; // Replace with actual user ID

  constructor(private fb: FormBuilder, private http: HttpClient) {}

  ngOnInit(): void {
    this.updateForm = this.fb.group({
      name: [''],
      email: [''],
      contactNumber: [''],
      roles: ['']
    });
  }

  onSubmit(): void {
    const updateData = this.updateForm.value;

    this.http.put(`https://localhost:7272/api/Users/${this.userId}`, updateData)
      .subscribe({
        next: () => alert('User updated successfully!'),
        error: err => console.error('Update failed:', err)
      });
  }
}

