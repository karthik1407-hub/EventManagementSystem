import { Component, OnInit, inject, signal, WritableSignal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { environment } from '../environments/environment';
import { User } from '../user/models/user.model';

// --- Interfaces for better type safety ---
import { Feedback } from '../feedback/models/feedback.model';
import { Event } from '../event/models/event.model';

interface Notification {
  notificationID: string;
  message: string;
  sentTimestamp: string;
}
interface Ticket {
  ticketID: string;
  eventID: string;
  userID?: string;
  bookingDate?: string;
  isCancelled?: boolean;
}
interface Payment {
  id: string;
  amount: number;
  createdDate: string;
  status: string;
  userId?: string;
  method?: string;
  transactionId?: string;
}

// --- Entity Configuration Interface ---
interface EntityConfig {
  apiEndpoint: string;
  idField: string;
  formFields: { [key: string]: any[] };
  hasForm: boolean;
  postEndpoint?: string; // For payments, it's /payment
}

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  // --- Injected Services ---
  private http = inject(HttpClient);
  private router = inject(Router);
  private formBuilder = inject(FormBuilder);

  // --- API Configuration ---
  private readonly API_URL = environment.apiUrl;

  // --- Entity Configurations ---
  private entityConfigs: { [key: string]: EntityConfig } = {
    users: { apiEndpoint: 'Users', idField: 'userID', formFields: {}, hasForm: false },
    feedback: {
      apiEndpoint: 'Feedback',
      idField: 'feedbackID',
      formFields: {
        comments: ['', [Validators.required, Validators.minLength(10)]],
        rating: ['5', [Validators.required, Validators.min(1), Validators.max(5)]]
      },
      hasForm: true
    },
    notifications: {
      apiEndpoint: 'Notification',
      idField: 'notificationID',
      formFields: {
        message: ['', [Validators.required, Validators.minLength(5)]]
      },
      hasForm: true
    },
    tickets: {
      apiEndpoint: 'Ticket',
      idField: 'ticketID',
      formFields: {
        eventID: ['', Validators.required],
        userID: ['', Validators.required],
        bookingDate: [new Date().toISOString().split('T')[0], Validators.required],
        isCancelled: [false]
      },
      hasForm: true
    },
    events: { apiEndpoint: 'Event', idField: 'eventID', formFields: {}, hasForm: false },
    payments: {
      apiEndpoint: 'Payment',
      idField: 'id',
      formFields: {
        userId: ['', Validators.required],
        amount: ['', [Validators.required, Validators.min(0.01)]],
        method: ['', Validators.required],
        status: ['Pending', Validators.required],
        transactionId: ['']
      },
      hasForm: true,
      postEndpoint: 'Payment/payment'
    }
  };

  // --- State Management with Maps ---
  dataSignals = new Map<string, WritableSignal<any[]>>();
  countSignals = new Map<string, WritableSignal<number>>();
  showFormSignals = new Map<string, WritableSignal<boolean>>();
  editingSignals = new Map<string, WritableSignal<string | null>>();
  forms = new Map<string, FormGroup | null>();

  isLoading = signal(true);
  errorMessage = signal('');
  activeSection = signal('');
  expandedSections: WritableSignal<Set<string>> = signal(new Set());
  itemToDelete = signal<{ type: string, id: string } | null>(null);

  constructor() {
    // Initialize maps
    Object.keys(this.entityConfigs).forEach(key => {
      this.dataSignals.set(key, signal([]));
      this.countSignals.set(key, signal(0));
      this.showFormSignals.set(key, signal(false));
      this.editingSignals.set(key, signal(null));
      this.forms.set(key, null);
    });
  }

  ngOnInit(): void {
    this.loadCounts();
    this.expandedSections.update(set => set.add('feedback'));
    this.loadSectionData('feedback');
    this.loadSectionData('users');
    this.loadSectionData('events');
  }

  getUserName(userId: string): string {
    const users = this.dataSignals.get('users')!();
    const user = users.find((u: any) => u.userID === userId);
    return user ? user.email : userId;
  }

  getEventName(eventId: string): string {
    const events = this.dataSignals.get('events')!();
    const event = events.find((e: any) => e.eventID === eventId);
    return event ? event.eventName : eventId;
  }

  toggleSection(section: string): void {
    const expanded = this.expandedSections();
    if (expanded.has(section)) {
      expanded.delete(section);
      this.expandedSections.set(new Set(expanded));
    } else {
      expanded.add(section);
      this.expandedSections.set(new Set(expanded));
      this.loadSectionData(section);
    }
  }

  addEntity(entity: string): void {
    const config = this.entityConfigs[entity];
    if (config.hasForm) {
      this.showAddForm(entity);
    } else {
      const routes: { [key: string]: string } = {
        users: '/admin/users',
        events: '/add-event'
      };
      this.router.navigate([routes[entity]]);
    }
  }

  editEntity(entity: string, item: any): void {
    const config = this.entityConfigs[entity];
    if (config.hasForm) {
      this.showEditForm(entity, item);
    } else {
      const routes: { [key: string]: string } = {
        users: '/admin/users',
        events: '/event/edit'
      };
      const route = routes[entity];
      const id = item[config.idField];
      if (entity === 'events') {
        this.router.navigate([route, id]);
      } else {
        this.router.navigate([route], { queryParams: { edit: id } });
      }
    }
  }

  loadCounts(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    const requests: { [key: string]: any } = {};
    Object.keys(this.entityConfigs).forEach(key => {
      requests[key] = this.http.get<any[]>(`${this.API_URL}/api/${this.entityConfigs[key].apiEndpoint}`);
    });

    forkJoin(requests).subscribe({
      next: (data: any) => {
        Object.keys(data).forEach(key => {
          this.countSignals.get(key)!.set(data[key].length);
        });
      },
      error: (err) => {
        console.error('Failed to load counts', err);
        this.errorMessage.set('Failed to load dashboard data. Please try again later.');
      },
      complete: () => {
        this.isLoading.set(false);
      }
    });
  }

  loadSectionData(section: string): void {
    const config = this.entityConfigs[section];
    this.http.get<any[]>(`${this.API_URL}/api/${config.apiEndpoint}`).subscribe({
      next: (data) => {
        this.dataSignals.get(section)!.set(data);
        this.countSignals.get(section)!.set(data.length);
        if (section === 'feedback') {
          console.log('Feedback data received:', data);
        }
      },
      error: (err) => console.error(`Failed to load ${section}`, err)
    });
  }

  loadAllData(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    const requests: { [key: string]: any } = {};
    Object.keys(this.entityConfigs).forEach(key => {
      requests[key] = this.http.get<any[]>(`${this.API_URL}/api/${this.entityConfigs[key].apiEndpoint}`);
    });

    forkJoin(requests).subscribe({
      next: (data: any) => {
        Object.keys(data).forEach(key => {
          this.dataSignals.get(key)!.set(data[key]);
        });
      },
      error: (err) => {
        console.error('Failed to load data', err);
        this.errorMessage.set('Failed to load dashboard data. Please try again later.');
      },
      complete: () => {
        this.isLoading.set(false);
      }
    });
  }

  initiateDelete(type: string, id: string): void {
    this.itemToDelete.set({ type, id });
  }

  cancelDelete(): void {
    this.itemToDelete.set(null);
  }

  confirmDelete(): void {
    const item = this.itemToDelete();
    if (!item) return;

    const { type, id } = item;
    if (!id) {
      console.error(`Delete failed: No id provided for type ${type}`);
      this.errorMessage.set(`Failed to delete the selected ${type}: missing id.`);
      this.itemToDelete.set(null);
      return;
    }

    const guidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;
    if (!guidRegex.test(id)) {
      console.error(`Delete failed: Invalid GUID format for id ${id}`);
      this.errorMessage.set(`Failed to delete the selected ${type}: invalid id format.`);
      this.itemToDelete.set(null);
      return;
    }

    const config = this.entityConfigs[type];
    const apiUrl = `${this.API_URL}/api/${config.apiEndpoint}/${id}`;
    const signalToUpdate = this.dataSignals.get(type)!;

    this.http.delete(apiUrl).subscribe({
      next: () => {
        signalToUpdate.update(currentItems => currentItems.filter(i => i[config.idField] !== id));
        console.log(`${type} with id ${id} deleted successfully.`);
        this.itemToDelete.set(null);
      },
      error: (err) => {
        console.error(`Failed to delete ${type}`, err);
        this.errorMessage.set(`Failed to delete the selected ${type}.`);
        this.itemToDelete.set(null);
      }
    });
  }

  // --- Generic Form Methods ---
  showAddForm(entity: string): void {
    const config = this.entityConfigs[entity];
    if (!config.hasForm) return;
    this.initializeForm(entity);
    this.showFormSignals.get(entity)!.set(true);
    this.editingSignals.get(entity)!.set(null);
  }

  showEditForm(entity: string, item: any): void {
    const config = this.entityConfigs[entity];
    if (!config.hasForm) return;
    this.initializeForm(entity, item);
    this.showFormSignals.get(entity)!.set(true);
    this.editingSignals.get(entity)!.set(item[config.idField]);
  }

  hideForm(entity: string): void {
    const config = this.entityConfigs[entity];
    if (!config.hasForm) return;
    this.showFormSignals.get(entity)!.set(false);
    this.editingSignals.get(entity)!.set(null);
    this.forms.set(entity, null);
  }

  private initializeForm(entity: string, item?: any): void {
    const config = this.entityConfigs[entity];
    const formGroup: { [key: string]: any } = {};
    Object.keys(config.formFields).forEach(field => {
      const [defaultValue, validators] = config.formFields[field];
      formGroup[field] = [item ? item[field] || defaultValue : defaultValue, validators];
    });
    this.forms.set(entity, this.formBuilder.group(formGroup));
  }

  saveForm(entity: string): void {
    const config = this.entityConfigs[entity];
    const form = this.forms.get(entity);
    if (!form?.valid) {
      this.errorMessage.set('Please fill in all required fields correctly.');
      return;
    }

    const formData = { ...form.value };
    // Special handling for rating
    if (entity === 'feedback' && formData.rating) {
      formData.rating = parseInt(formData.rating, 10);
    }

    const isEditing = this.editingSignals.get(entity)!() !== null;
    const id = this.editingSignals.get(entity)!();

    const apiUrl = `${this.API_URL}/api/${config.apiEndpoint}`;
    const request = isEditing
      ? this.http.put(`${apiUrl}/${id}`, formData)
      : this.http.post(config.postEndpoint ? `${this.API_URL}/api/${config.postEndpoint}` : apiUrl, formData);

    request.subscribe({
      next: (response: any) => {
        const signal = this.dataSignals.get(entity)!;
        if (isEditing) {
          signal.update(items => items.map(i => i[config.idField] === id ? response : i));
        } else {
          signal.update(items => [...items, response]);
          this.countSignals.get(entity)!.update(count => count + 1);
        }
        this.hideForm(entity);
        this.errorMessage.set('');
      },
      error: (err) => {
        console.error(`Failed to ${isEditing ? 'update' : 'create'} ${entity}`, err);
        this.errorMessage.set(`Failed to ${isEditing ? 'update' : 'create'} ${entity}. Please try again.`);
      }
    });
  }
}
