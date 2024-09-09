import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { NameHelper } from 'src/app/admin/helpers';
import { cookieHelper } from 'src/app/core/helpers';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [],
  providers: [NameHelper, cookieHelper],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
  public position = this.cookieHelper.getPosition();
  public title = 'Sistema de Gestión de Vehículos';
  public name = '';

  constructor(
    private cookieHelper: cookieHelper,
    public nameHelper: NameHelper,
    private router: Router
  ){
    this.router.events.subscribe((ev) => {
      if (ev instanceof NavigationEnd) {
        this.setTitle();
      }
    });
  }

  ngOnInit(): void {
    this.setTitle();
    this.name = this.nameHelper.getShortName(this.cookieHelper.getName());
  }

  private setTitle(): void {
    const url = this.router.url;
    switch(true) {
      case url.includes('dashboard'):
        this.title = 'Dashboard';
        break;
      default:
        this.title = 'IHTT';
    }
  }
}
