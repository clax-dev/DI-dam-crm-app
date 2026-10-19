import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SupabaseService } from '../services/supabase.service';

// Sin sesión no se entra a /home: RLS no devolvería ningún cliente de todas formas
export const authGuard: CanActivateFn = async () => {
  // inject() solo funciona antes del primer await
  const supabaseService = inject(SupabaseService);
  const router = inject(Router);
  await supabaseService.ready;
  return supabaseService.currentUser() ? true : router.parseUrl('/login');
};
