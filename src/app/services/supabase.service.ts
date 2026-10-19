import { Injectable, signal } from '@angular/core';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';
import { Client } from '../models/client.model';
import { GalleryImage } from '../models/gallery-image.model';

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  private supabase: SupabaseClient;

  // Señales reactivas para el estado global
  public currentUser = signal<User | null>(null);
  public userRole = signal<'admin' | 'user' | null>(null);

  // Se resuelve cuando ya sabemos si había sesión guardada (lo usa el guard)
  public readonly ready: Promise<void>;

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
    this.ready = this.initSession();
  }

  // --- AUTENTICACIÓN Y ROLES ---
  private async initSession() {
    const { data: { session } } = await this.supabase.auth.getSession();
    if (session?.user) {
      this.currentUser.set(session.user);
      await this.loadRole(session.user.id);
    }
  }

  async login(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    if (data.user) {
      this.currentUser.set(data.user);
      await this.loadRole(data.user.id);
    }
  }

  async logout() {
    await this.supabase.auth.signOut();
    this.currentUser.set(null);
    this.userRole.set(null);
  }

  private async loadRole(userId: string) {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();
    this.userRole.set(!error && data ? data.role : null);
  }

  // --- CRUD CLIENTES ---
  async getClients(): Promise<Client[]> {
    const { data, error } = await this.supabase.from('clients').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async createClient(client: Client): Promise<void> {
    const { error } = await this.supabase.from('clients').insert([{
      nombre: client.nombre,
      empresa: client.empresa,
      email: client.email,
    }]);
    if (error) throw error;
  }

  async updateClient(id: string, client: Partial<Client>): Promise<void> {
    const { error } = await this.supabase.from('clients').update(client).eq('id', id);
    if (error) throw error;
  }

  async deleteClient(id: string): Promise<void> {
    const { error } = await this.supabase.from('clients').delete().eq('id', id);
    if (error) throw error;
  }

  // --- STORAGE (GALERÍA) ---
  async getImages(): Promise<GalleryImage[]> {
    const bucket = this.supabase.storage.from(environment.storageBucket);
    const { data, error } = await bucket.list('', { sortBy: { column: 'created_at', order: 'desc' } });
    if (error) throw error;
    return (data || [])
      // Las carpetas vienen sin metadata y Supabase crea un .emptyFolderPlaceholder al crear carpetas
      .filter((file) => file.metadata?.['mimetype']?.startsWith('image/'))
      .map((file) => ({
        name: file.name,
        url: bucket.getPublicUrl(file.name).data.publicUrl,
        size: file.metadata!['size'],
        created_at: file.created_at ?? '',
      }));
  }
}
