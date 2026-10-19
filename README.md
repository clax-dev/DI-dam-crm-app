# DAM CRM - Gestión de Clientes con Roles

Laboratorio de Desarrollo de Interfaces (DAM2): CRUD de clientes con control de acceso por roles
usando **Ionic 9 + Angular 22 (standalone)** y **Supabase**.

## Funcionalidades

- **Login** con Supabase Auth. Sin sesión, el `authGuard` redirige a `/login`.
- **Roles** `admin` / `user` guardados en la tabla `profiles`.
  - `admin`: crea, edita (deslizando el cliente) y borra clientes.
  - `user`: solo lectura; el formulario y las opciones no se renderizan (`@if (isAdmin())`).
- **Seguridad en el backend** con políticas RLS de PostgreSQL: aunque se salte la interfaz, solo un admin puede escribir.
- **Formularios reactivos** con validación (`ReactiveFormsModule`).
- **Galería** (`/galeria`): imágenes del bucket de Storage mostradas como cards.
- **Responsive** con `ion-grid` (1 columna en móvil, 2-3 en pantallas mayores).

## Estructura

```
src/app/
  services/supabase.service.ts   Auth, roles, CRUD de clientes y Storage
  guards/auth.guard.ts           Protege las rutas privadas
  login/                         Pantalla de inicio de sesión
  home/                          Formulario + listado de clientes
  gallery/                       Galería de imágenes del bucket
  models/                        Interfaces Client y GalleryImage
```

El esquema de base de datos (tablas, RLS, trigger y política de Storage) está versionado como
migraciones en el repo [DI-supabase](https://github.com/clax-dev/DI-supabase).

## Ejecutar en local

```bash
npm install
ionic serve
```
