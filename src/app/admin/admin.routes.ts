import { Routes } from '@angular/router';
import { authGuard } from '../core/guards';
import { AdminRouterComponent, DashboardComponent, DetailsComponent, FinesDetailsComponent, FinesReportsComponent, ReportsComponent } from './containers';
import { FinesDasboardComponent } from './containers/fines-dasboard/fines-dasboard.component';

export const adminRoutes: Routes = [{
  path: '',
  component: AdminRouterComponent,
  canActivate: [authGuard],
  children: [
    { path: 'dashboard/certificates', component: DashboardComponent, title: 'Dashboard' },
    { path: 'dashboard/fines', component: FinesDasboardComponent, title: 'Dashboard' },
    { path: 'reports/certificates', component: ReportsComponent, title: 'Reportes' },
    { path: 'reports/fines', component: FinesReportsComponent, title: 'Reportes' },
    { path: 'details/certificates', component: DetailsComponent, title: 'Listado' },
    { path: 'details/fines', component: FinesDetailsComponent, title: 'Listado' },
    { path: '**', redirectTo: 'dashboard/certificates' },
  ]
}];
