import { Routes } from '@angular/router';
import { authGuard } from '../core/guards';
import { FinesDashboardComponent, AdminRouterComponent, DashboardComponent, DetailsComponent, FinesDetailsComponent, FinesReportsComponent, ReportsComponent, EventualPermitsDashboardComponent, EventualPermitsDetailsComponent, ApplicationsDashboardComponent, ApplicationsDetailsComponent, ApplicationsReportsComponent } from './containers';

export const adminRoutes: Routes = [{
  path: '',
  component: AdminRouterComponent,
  canActivate: [authGuard],
  children: [
    { path: 'dashboard/certificates', component: DashboardComponent, title: 'Dashboard' },
    { path: 'dashboard/fines', component: FinesDashboardComponent, title: 'Dashboard' },
    { path: 'dashboard/eventual-permits', component: EventualPermitsDashboardComponent, title: 'Dashboard' },
    { path: 'dashboard/applications', component: ApplicationsDashboardComponent, title: 'Dashboard' },
    { path: 'reports/certificates', component: ReportsComponent, title: 'Reportes' },
    { path: 'reports/fines', component: FinesReportsComponent, title: 'Reportes' },
    { path: 'reports/applications', component: ApplicationsReportsComponent, title: 'Reportes' },
    { path: 'details/certificates', component: DetailsComponent, title: 'Listado' },
    { path: 'details/fines', component: FinesDetailsComponent, title: 'Listado' },
    { path: 'details/eventual-permits', component: EventualPermitsDetailsComponent, title: 'Listado' },
    { path: 'details/applications', component: ApplicationsDetailsComponent, title: 'Listado' },
    { path: '**', redirectTo: 'dashboard/certificates' },
  ]
}];
