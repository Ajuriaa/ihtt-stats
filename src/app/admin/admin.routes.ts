import { Routes } from '@angular/router';
import { authGuard } from '../core/guards';
import { FinesDashboardComponent, AdminRouterComponent, DashboardComponent, DetailsComponent, FinesDetailsComponent, FinesReportsComponent, ReportsComponent, EventualPermitsDashboardComponent, EventualPermitsDetailsComponent, EventualPermitsReportsComponent, ApplicationsDashboardComponent, ApplicationsDetailsComponent, ApplicationsReportsComponent, SchoolCertificatesDashboardComponent, SchoolCertificatesDetailsComponent, SchoolCertificatesReportsComponent } from './containers';

export const adminRoutes: Routes = [{
  path: '',
  component: AdminRouterComponent,
  canActivate: [authGuard],
  children: [
    { path: 'dashboard/certificates', component: DashboardComponent, title: 'Dashboard' },
    { path: 'dashboard/fines', component: FinesDashboardComponent, title: 'Dashboard' },
    { path: 'dashboard/eventual-permits', component: EventualPermitsDashboardComponent, title: 'Dashboard' },
    { path: 'dashboard/applications', component: ApplicationsDashboardComponent, title: 'Dashboard' },
    { path: 'dashboard/school-certificates', component: SchoolCertificatesDashboardComponent, title: 'Dashboard' },
    { path: 'reports/certificates', component: ReportsComponent, title: 'Reportes' },
    { path: 'reports/fines', component: FinesReportsComponent, title: 'Reportes' },
    { path: 'reports/eventual-permits', component: EventualPermitsReportsComponent, title: 'Reportes' },
    { path: 'reports/applications', component: ApplicationsReportsComponent, title: 'Reportes' },
    { path: 'reports/school-certificates', component: SchoolCertificatesReportsComponent, title: 'Reportes' },
    { path: 'details/certificates', component: DetailsComponent, title: 'Listado' },
    { path: 'details/fines', component: FinesDetailsComponent, title: 'Listado' },
    { path: 'details/eventual-permits', component: EventualPermitsDetailsComponent, title: 'Listado' },
    { path: 'details/applications', component: ApplicationsDetailsComponent, title: 'Listado' },
    { path: 'details/school-certificates', component: SchoolCertificatesDetailsComponent, title: 'Listado' },
    { path: '**', redirectTo: 'dashboard/certificates' },
  ]
}];
