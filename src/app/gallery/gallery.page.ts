import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { SupabaseService } from '../services/supabase.service';
import { GalleryImage } from '../models/gallery-image.model';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton, IonButton, IonIcon,
  IonGrid, IonRow, IonCol, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonImg,
  IonSpinner, IonText,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { refreshOutline, imageOutline, openOutline } from 'ionicons/icons';

@Component({
  selector: 'app-gallery',
  templateUrl: 'gallery.page.html',
  styleUrls: ['gallery.page.scss'],
  imports: [
    DatePipe, DecimalPipe, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton,
    IonButton, IonIcon, IonGrid, IonRow, IonCol, IonCard, IonCardHeader, IonCardTitle,
    IonCardSubtitle, IonImg, IonSpinner, IonText,
  ],
})
export class GalleryPage implements OnInit {
  private supabaseService = inject(SupabaseService);

  images = signal<GalleryImage[]>([]);
  loading = signal(true);
  errorMessage = signal('');

  constructor() {
    addIcons({ refreshOutline, imageOutline, openOutline });
  }

  async ngOnInit() {
    await this.loadImages();
  }

  async loadImages() {
    this.loading.set(true);
    this.errorMessage.set('');
    try {
      this.images.set(await this.supabaseService.getImages());
    } catch (e: any) {
      this.errorMessage.set('Error cargando imágenes: ' + e.message);
    } finally {
      this.loading.set(false);
    }
  }
}
