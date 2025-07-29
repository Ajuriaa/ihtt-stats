import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { NameHelper } from 'src/app/admin/helpers';
import { cookieHelper } from 'src/app/core/helpers';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [MatFormFieldModule, MatSelectModule, MatOptionModule, FormsModule, CommonModule],
  providers: [NameHelper, cookieHelper],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
  public position = this.cookieHelper.getPosition();
  public title = 'Sistema de Estadísticas';
  public name = '';
  public mode = 'certificates';
  public availableModes = [
    { value: 'certificates', label: 'Certificados y Permisos' },
    { value: 'fines', label: 'Multas' },
    { value: 'eventual-permits', label: 'Permisos Eventuales' },
    { value: 'applications', label: 'Solicitudes' },
    { value: 'school-certificates', label: 'Certificados Escolares' }
  ];

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

  public onModeChange(newMode: string): void {
    this.mode = newMode;

    // Obtiene la ruta actual sin el parámetro de modo
    const currentUrl = this.router.url.split('/');
    currentUrl[3] = this.mode; // Cambia el `mode` en la posición correspondiente

    // Redirige al usuario a la nueva ruta
    this.router.navigateByUrl(currentUrl.join('/'));
  }


  private setTitle(): void {
    const url = this.router.url;
    let modeTitle = '';
    
    switch(this.mode) {
      case 'certificates':
        modeTitle = ' de Certificados, Permisos y Permisos Especiales';
        break;
      case 'fines':
        modeTitle = ' de Multas';
        break;
      case 'eventual-permits':
        modeTitle = ' de Permisos Eventuales';
        break;
      case 'applications':
        modeTitle = ' de Solicitudes';
        break;
      case 'school-certificates':
        modeTitle = ' de Certificados Escolares';
        break;
      default:
        modeTitle = '';
    }
    
    switch(true) {
      case url.includes('dashboard'):
        this.title = 'Dashboard' + modeTitle;
        break;
      case url.includes('details'):
        this.title = 'Lista Detallada' + modeTitle;
        break;
      case url.includes('reports'):
        this.title = 'Reportes' + modeTitle;
        break;
      default:
        this.title = 'IHTT';
    }
  }
}
