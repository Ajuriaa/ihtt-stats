import { CUSTOM_ELEMENTS_SCHEMA, Component } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { RouterModule } from '@angular/router';
import { HeaderComponent, SideBarComponent } from 'src/app/shared';

@Component({
  selector: 'app-admin-router',
  standalone: true,
  imports: [RouterModule, MatSidenavModule, SideBarComponent, HeaderComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div class="container">
      <app-header class="header"></app-header>
      <div class="component-container">
        <router-outlet></router-outlet>
      </div>
      <app-side-bar class="bar"></app-side-bar>
    </div>
  `,
  styles: [`
    .container {
      display: flex;
      flex-direction: column;
      height: 100%;
      width: 100%;
      position: relative;
      overflow-y: hidden;
    }
    .component-container {
      overflow-y: auto;
      height: 100%;
      width: 100%;
    }
    .header {
      width: 100%;
    }
    .bar {
      display: flex;
      justify-content: center;
      position: absolute;
      width: 100%;
      bottom: 3rem;
      z-index: 2;
    }
  `]
})
export class AdminRouterComponent {
}
