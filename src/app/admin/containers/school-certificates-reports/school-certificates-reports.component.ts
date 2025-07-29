import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import moment from 'moment';
import { DashboardQueries } from '../../services';
import { LoadingComponent } from '../../../shared/loading/loading.component';
import { DateFilterComponent } from '../../../shared/date-filter/date-filter.component';

@Component({
  selector: 'app-school-certificates-reports',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatAutocompleteModule,
    LoadingComponent,
    DateFilterComponent
  ],
  templateUrl: './school-certificates-reports.component.html',
  styleUrl: './school-certificates-reports.component.scss'
})
export class SchoolCertificatesReportsComponent implements OnInit {
  public loading = false;
  public schoolCertificates: any[] = [];
  public tipoReporte: 'lista' | 'analisis' = 'analisis';
  public dateType = 'issueDate';
  public searchTerm = '';
  
  // Date filters
  public startDate = moment().startOf('month').format('YYYY-MM-DD');
  public endDate = moment().format('YYYY-MM-DD');
  
  // Filter properties
  public selectedNoticeStatus = '';
  public selectedTransportType = '';
  public selectedCategory = '';
  public selectedType = '';
  
  // Filter options
  public noticeStatuses: string[] = ['PAGADO', 'ACTIVO', 'ANULADO'];
  public transportTypes: string[] = ['CARGA', 'PASAJEROS'];
  public categories: string[] = [
    'VEHICULO DE CARGA NO ARTICULADA',
    'BUS URBANO E INTERURBANO',
    'VEHICULO DE CARGA ARTICULADA',
    'TAXI',
    'VEHICULO DE CARGA ESPECIALIZADA',
    'BUS INTERNACIONAL',
    'BUS ESCOLAR',
    'INSTRUCTOR PRÁCTICO',
    'INSTRUCTOR TEÓRICO',
    'MOTOTAXI',
    'VEHICULO DE CARGA NO ARTICULADA MAYOR A 7,500 kg',
    'BUS URBANO E INTERURBANO HASTA 30 PASAJEROS'
  ];
  public types: string[] = [
    'HASTA 7500 KG',
    'MAYOR A 7500 KG',
    'MAYOR O IGUAL A 26 PASAJEROS',
    'HASTA 25 PASAJEROS',
    'ARTICULADA',
    'NO ARTICULADA HASTA 7500 KG',
    'TAXI',
    'MAYOR A 30 PASAJEROS',
    'HASTA 30 PASAJEROS',
    'MOTOTAXI'
  ];
  
  // Autocomplete for categories
  public filteredCategories: string[] = this.categories;
  
  constructor(
    private dashboardService: DashboardQueries
  ) {}
  
  get startDateObject(): Date {
    return new Date(this.startDate);
  }
  
  get endDateObject(): Date {
    return new Date(this.endDate);
  }
  
  ngOnInit(): void {
    this.loadSchoolCertificates();
  }
  
  public filterCategories(value: string): void {
    if (!value) {
      this.filteredCategories = this.categories;
      return;
    }
    
    const filterValue = value.toLowerCase();
    this.filteredCategories = this.categories.filter(category =>
      category.toLowerCase().includes(filterValue)
    );
  }
  
  public loadSchoolCertificates(): void {
    this.loading = true;
    
    const params = {
      startDate: this.startDate || undefined,
      endDate: this.endDate || undefined,
      dateType: this.dateType || undefined,
      noticeStatus: this.selectedNoticeStatus || undefined,
      transportType: this.selectedTransportType || undefined,
      categoryDescription: this.selectedCategory || undefined,
      type: this.selectedType || undefined,
      searchTerm: this.searchTerm || undefined
    };
    
    // Clean undefined parameters
    const cleanedParams = Object.fromEntries(
      Object.entries(params).filter(([_, value]) => value !== undefined)
    );
    
    this.dashboardService.getSchoolCertificates(cleanedParams).subscribe({
      next: (response) => {
        this.schoolCertificates = response.data || [];
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading school certificates:', error);
        this.loading = false;
      }
    });
  }
  
  public filterDates(dates: { startDate: Date | null, endDate: Date | null, dateType?: string }): void {
    if (dates.startDate && dates.endDate) {
      this.startDate = moment.utc(dates.startDate).format('YYYY-MM-DD');
      this.endDate = moment.utc(dates.endDate).format('YYYY-MM-DD');
    }
    if (dates.dateType) {
      this.dateType = dates.dateType;
    }
  }
  
  public applyFilter(filterType: string, value: string): void {
    switch (filterType) {
      case 'noticeStatus':
        this.selectedNoticeStatus = value || '';
        break;
      case 'transportType':
        this.selectedTransportType = value || '';
        break;
      case 'categoryDescription':
        this.selectedCategory = value || '';
        break;
      case 'type':
        this.selectedType = value || '';
        break;
      case 'searchTerm':
        this.searchTerm = value || '';
        break;
    }
  }
  
  public aplicarFiltros(): void {
    this.loadSchoolCertificates();
  }
  
  public limpiarFiltros(): void {
    this.startDate = moment().startOf('month').format('YYYY-MM-DD');
    this.endDate = moment().format('YYYY-MM-DD');
    this.dateType = 'issueDate';
    this.searchTerm = '';
    this.selectedNoticeStatus = '';
    this.selectedTransportType = '';
    this.selectedCategory = '';
    this.selectedType = '';
    this.filteredCategories = this.categories;
    this.loadSchoolCertificates();
  }
  
  public generarReportePDF(): void {
    if (this.tipoReporte === 'analisis') {
      this.generarReporteAnalisis();
    } else {
      this.generarReporteDetallado();
    }
  }
  
  private generarReporteAnalisis(): void {
    alert('Funcionalidad de reporte ejecutivo en desarrollo. Próximamente estará disponible.');
  }
  
  private generarReporteDetallado(): void {
    if (this.schoolCertificates.length === 0) {
      alert('No hay datos para generar el reporte');
      return;
    }
    
    alert('Funcionalidad de reporte detallado en desarrollo. Próximamente estará disponible.');
  }
  
  public exportToExcel(): void {
    if (this.schoolCertificates.length === 0) {
      alert('No hay datos para exportar');
      return;
    }
    
    alert('Funcionalidad de exportación a Excel en desarrollo. Próximamente estará disponible.');
  }
}
