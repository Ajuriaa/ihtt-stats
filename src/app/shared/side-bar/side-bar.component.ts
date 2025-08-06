import { Component, OnInit } from '@angular/core';
import {MatSidenavModule} from '@angular/material/sidenav';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { SideNavButtonComponent } from '../buttons';

@Component({
  selector: 'app-side-bar',
  standalone: true,
  imports: [MatSidenavModule, SideNavButtonComponent, CommonModule],
  templateUrl: './side-bar.component.html',
  styleUrl: './side-bar.component.scss'
})
export class SideBarComponent implements OnInit {
  public selectedOption = 'dashboard';
  public iconTopPosition = 4.5;
  public currentMode = 'certificates';

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ){
    this.router.events.subscribe((ev) => {
      if (ev instanceof NavigationEnd) {
        const segments = this.router.url.split('/');
        this.selectedOption = segments[2] || 'dashboard'; // Segundo segmento
        this.currentMode = segments[3] || 'certificates'; // Tercer segmento
        
        // Remove the redirect for eventual permits reports - now supported
        
        this.animateIcon();
      }
    });
  }

  ngOnInit(): void {
    const segments = this.router.url.split('/');
    this.selectedOption = segments[2] || 'dashboard';
    this.currentMode = segments[3] || 'certificates';
    this.animateIcon();
    this.routeOption();
  }

  public selectOption(option: string): void {
    this.selectedOption = option;
    this.animateIcon();
    console.log(this.currentMode);
    setTimeout(() => {
      this.router.navigate([`admin/${option}/${this.currentMode}`]);
    }, 500);
  }

  public logout(): void {
    this.router.navigate([``]);
  }

  private routeOption(): void {
    const url = this.router.url;
    switch (true) {
      case url.includes('dashboard'):
        this.selectedOption = 'dashboard';
        break;
      case url.includes('reports'):
        this.selectedOption = 'reports';
        break;
      case url.includes('details'):
        this.selectedOption = 'details';
        break;
      default:
        this.selectedOption = 'dashboard';
    }
    this.animateIcon();
  }


  private animateIcon(): void {
    switch (this.selectedOption) {
      case 'dashboard':
        this.iconTopPosition = 3.5;
        break;
      case 'details':
        this.iconTopPosition = 18;
        break;
      case 'reports':
        this.iconTopPosition = 32.5;
        break;
    }
  }
}
