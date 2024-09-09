import { Routes } from '@angular/router';
import { LoginComponent } from './auth';

export const routes: Routes = [
  { path: '', title: 'Login', component: LoginComponent },
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.routes').then(m => m.adminRoutes)
  },
];
