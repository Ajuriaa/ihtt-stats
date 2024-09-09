import { Routes } from '@angular/router';
import { authGuard } from '../core/guards';
import {
  AdminRouterComponent, DashboardComponent
} from './containers';

export const adminRoutes: Routes = [{
  path: '',
  component: AdminRouterComponent,
  canActivate: [authGuard],
  children: [
    {
      path: 'dashboard',
      title: 'Inicio',
      component: DashboardComponent
    }
  ]
}];
