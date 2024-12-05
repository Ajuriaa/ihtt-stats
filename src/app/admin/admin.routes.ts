import { Routes } from '@angular/router';
import { authGuard } from '../core/guards';
import { AdminRouterComponent, DashboardComponent, DetailsComponent, ReportsComponent } from './containers';

export const adminRoutes: Routes = [{
  path: '',
  component: AdminRouterComponent,
  canActivate: [authGuard],
  children: [
    { path: 'dashboard/:mode', component: DashboardComponent, title: 'Dashboard' },
    { path: 'reports/:mode', component: ReportsComponent, title: 'Reportes' },
    { path: 'details/:mode', component: DetailsComponent, title: 'Listado' },
    { path: '**', redirectTo: 'dashboard/certificates' },
  ]
}];
