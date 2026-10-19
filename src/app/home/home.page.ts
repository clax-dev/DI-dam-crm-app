import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SupabaseService } from '../services/supabase.service';
import { Client } from '../models/client.model';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel,
  IonItemSliding, IonItemOptions, IonItemOption, IonIcon, IonButton, IonButtons,
  IonInput, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonToast,
  IonGrid, IonRow, IonCol, IonChip, IonListHeader, IonNote,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { createOutline, trashOutline, logOutOutline, imagesOutline } from 'ionicons/icons';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [
    ReactiveFormsModule, IonHeader, IonToolbar, IonTitle, IonContent,
    IonList, IonItem, IonLabel, IonItemSliding, IonItemOptions, IonItemOption,
    IonIcon, IonButton, IonButtons, IonInput, IonCard, IonCardContent, IonCardHeader,
    IonCardTitle, IonToast, IonGrid, IonRow, IonCol, IonChip, IonListHeader, IonNote,
  ],
})
export class HomePage implements OnInit {
  private supabaseService = inject(SupabaseService);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  // La app es zoneless: el estado que cambia tras un await va en señales
  // para que la vista se entere sin zone.js
  clients = signal<Client[]>([]);
  editingClientId = signal<string | null>(null);
  toastMessage = signal('');
  isToastOpen = signal(false);

  // Señales expuestas a la vista
  user = this.supabaseService.currentUser;
  role = this.supabaseService.userRole;
  isAdmin = computed(() => this.role() === 'admin');

  clientForm: FormGroup = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(3)]],
    empresa: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
  });

  constructor() {
    addIcons({ createOutline, trashOutline, logOutOutline, imagesOutline });
  }

  async ngOnInit() {
    // El authGuard garantiza que aquí ya hay sesión iniciada
    await this.loadClients();
  }

  async loadClients() {
    try {
      this.clients.set(await this.supabaseService.getClients());
    } catch (e: any) {
      this.showToast('Error cargando clientes: ' + e.message);
    }
  }

  async saveClient() {
    if (this.clientForm.invalid) return;

    try {
      const formValue = this.clientForm.value;
      const id = this.editingClientId();
      if (id) {
        await this.supabaseService.updateClient(id, formValue);
        this.showToast('Cliente actualizado');
      } else {
        await this.supabaseService.createClient(formValue);
        this.showToast('Cliente insertado');
      }
      this.resetForm();
      await this.loadClients();
    } catch (e: any) {
      this.showToast('Error de guardado (¿Eres admin?): ' + e.message);
    }
  }

  editClient(client: Client, sliding: IonItemSliding) {
    sliding.close();
    this.editingClientId.set(client.id!);
    this.clientForm.patchValue({
      nombre: client.nombre,
      empresa: client.empresa,
      email: client.email,
    });
  }

  async deleteClient(id: string) {
    try {
      await this.supabaseService.deleteClient(id);
      this.showToast('Cliente eliminado');
      await this.loadClients();
    } catch (e: any) {
      this.showToast('Error eliminando: ' + e.message);
    }
  }

  resetForm() {
    this.clientForm.reset();
    this.editingClientId.set(null);
  }

  goToGallery() {
    this.router.navigateByUrl('/galeria');
  }

  async logout() {
    await this.supabaseService.logout();
    this.router.navigateByUrl('/login', { replaceUrl: true });
  }

  showToast(msg: string) {
    this.toastMessage.set(msg);
    this.isToastOpen.set(true);
  }
}
