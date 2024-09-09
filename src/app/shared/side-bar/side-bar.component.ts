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
  public selectedOption = 'emissions';
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
      this.router.navigate([`admin/`, option]);
    }, 500);
  }

  public logout(): void {
    this.router.navigate([``]);
  }

  private routeOption(): void {
    const url = this.router.url;
    switch(true) {
      case url.includes('inspection'):
        this.selectedOption = 'inspection';
        break;
      case url.includes('emissions'):
        this.selectedOption = 'emissions';
        break;
      case url.includes('operations'):
        this.selectedOption = 'operations';
        break;
      default:
        this.selectedOption = 'emissions';
    }
    this.animateIcon();
  }


  private animateIcon(): void {
    switch (this.selectedOption) {
      case 'emissions':
        this.iconTopPosition = 3.5;
        break;
      case 'inspection':
        this.iconTopPosition = 18;
        break;
      case 'operations':
        this.iconTopPosition = 32.5;
        break;
    }
  }
}
