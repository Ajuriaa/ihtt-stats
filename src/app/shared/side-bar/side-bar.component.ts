import { Component, OnInit } from '@angular/core';
import {MatSidenavModule} from '@angular/material/sidenav';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
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

  constructor(
    private router: Router
  ){}

  ngOnInit(): void {
    this.selectedOption = this.router.url.split('/')[2];
    this.animateIcon();
    this.routeOption();
  }

  public selectOption(option: string): void {
    this.selectedOption = option;
    this.animateIcon();
    setTimeout(() => {
      option === 'history' ? this.router.navigate(['admin/history/0']) : this.router.navigate([`admin/`, option]);
    }, 500);
  }

  public logout(): void {
    this.router.navigate([``]);
  }

  private routeOption(): void {
    const url = this.router.url;
    switch(true) {
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
      case 'products':
        this.iconTopPosition = 18;
        break;
      case 'inventory':
        this.iconTopPosition = 32.5;
        break;
      case 'providers':
        this.iconTopPosition = 47;
        break;
      case 'requisitions':
        this.iconTopPosition = 61.5;
        break;
      case 'history':
        this.iconTopPosition = 76;
        break;
    }
  }
}
