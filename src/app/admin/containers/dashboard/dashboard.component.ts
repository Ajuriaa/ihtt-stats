import { Component } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { LoadingComponent, SideBarComponent } from 'src/app/shared';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    SideBarComponent, BaseChartDirective, LoadingComponent,
    CommonModule, BaseChartDirective
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  public loading = false;
}
