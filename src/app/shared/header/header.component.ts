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
  public title = 'Sistema de Estadísticas';
  public name = '';
  public mode = 'certificates';

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
    this.mode = this.router.url.split('/')[3];
    this.setTitle();
    this.name = this.nameHelper.getShortName(this.cookieHelper.getName());
  }

  public toggleMode(): void {
    this.mode = this.mode === 'certificates' ? 'fines' : 'certificates';

    // Obtiene la ruta actual sin el parámetro de modo
    const currentUrl = this.router.url.split('/');
    currentUrl[3] = this.mode; // Cambia el `mode` en la posición correspondiente

    // Redirige al usuario a la nueva ruta
    this.router.navigateByUrl(currentUrl.join('/'));
  }


  private setTitle(): void {
    const url = this.router.url;
    switch(true) {
      case url.includes('dashboard'):
        this.title = 'Dashboard' + (this.mode === 'certificates' ? ' de Certificados' : ' de Multas');
        break;
      case url.includes('details'):
        this.title = 'Lista Detallada' + (this.mode === 'certificates' ? ' de Certificados' : ' de Multas');
        break;
      case url.includes('reports'):
        this.title = 'Reportes' + (this.mode === 'certificates' ? ' de Certificados' : ' de Multas');
        break;
      default:
        this.title = 'IHTT';
    }
  }
}
