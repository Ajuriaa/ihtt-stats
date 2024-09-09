import { Routes } from '@angular/router';
import { authGuard } from '../core/guards';
import { AdminRouterComponent, EmissionsComponent, InspectionComponent, OperationsComponent } from './containers';

export const adminRoutes: Routes = [{
  path: '',
  component: AdminRouterComponent,
  canActivate: [authGuard],
  children: [
    {
      title: 'Inspectoría',
      path: 'inspection',
      component: InspectionComponent
    },
    {
      title: 'Emisiones',
      path: 'emissions',
      component: EmissionsComponent
    },
    {
      title: 'Operaciones',
      path: 'operations',
      component: OperationsComponent
    }
  ]
}];
