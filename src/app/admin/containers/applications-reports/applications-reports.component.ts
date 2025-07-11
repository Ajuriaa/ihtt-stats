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
import moment from 'moment';
import { Application, ApplicationFilters } from '../../interfaces/applications.interfaces';
import { ApplicationsQueries } from '../../services/applications.queries';
import { ReportesPDFService } from '../../../reports/services/reportes-pdf.service';
import { LoadingComponent } from '../../../shared/loading/loading.component';
import { DateFilterComponent } from '../../../shared/date-filter/date-filter.component';

@Component({
  selector: 'app-applications-reports',
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
    LoadingComponent,
    DateFilterComponent
  ],
  templateUrl: './applications-reports.component.html',
  styleUrl: './applications-reports.component.scss'
})
export class ApplicationsReportsComponent implements OnInit {
  cargando = false;
  solicitudes: Application[] = [];
  fechaInicio: Date | null = null;
  fechaFin: Date | null = null;
  tipoReporte: 'lista' | 'analisis' = 'analisis';
  
  filtros: ApplicationFilters = {
    startDate: '',
    endDate: '',
    fileStatus: '',
    procedureType: '',
    categoryId: '',
    applicantName: '',
    companyName: '',
    applicationId: '',
    isAutomaticRenewal: undefined,
    tipoReporte: 'analisis'
  };

  estadosSolicitud = ['PENDIENTE', 'APROBADO', 'RECHAZADO', 'EN PROCESO'];

  tiposTramine = [
    'CERTIFICADO DE OPERACION',
    'PERMISO DE EXPLOTACION',
    'RENOVACION DE CERTIFICADO',
    'RENOVACION DE PERMISO',
    'CAMBIO DE MODALIDAD',
    'CAMBIO DE RUTA'
  ];

  categorias = [
    'TRANSPORTE PUBLICO',
    'TRANSPORTE PRIVADO',
    'CARGA',
    'ESPECIAL',
    'EJECUTIVO'
  ];

  estadosRenovacion = [
    { value: true, label: 'Sí' },
    { value: false, label: 'No' }
  ];

  tiposFecha = [
    { value: 'received', label: 'Fecha de Recepción' },
    { value: 'system', label: 'Fecha del Sistema' }
  ];

  constructor(
    private applicationsQueries: ApplicationsQueries,
    private reportesPDFService: ReportesPDFService
  ) {}

  ngOnInit(): void {
    this.cargarSolicitudes();
  }

  cargarSolicitudes(): void {
    this.cargando = true;
    
    this.applicationsQueries.getApplications(this.filtros).subscribe({
      next: (response) => {
        this.solicitudes = response.data;
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar solicitudes:', error);
        this.cargando = false;
      }
    });
  }

  filtrarDatos(fechas: { startDate: Date | null, endDate: Date | null }): void {
    if (fechas.startDate && fechas.endDate) {
      this.filtros.startDate = moment.utc(fechas.startDate).format('YYYY-MM-DD');
      this.filtros.endDate = moment.utc(fechas.endDate).format('YYYY-MM-DD');
    }
  }

  aplicarFiltros(): void {
    this.filtros.tipoReporte = this.tipoReporte;
    this.cargarSolicitudes();
  }

  generarReporte(): void {
    if (this.solicitudes.length === 0) {
      alert('No hay datos para generar el reporte');
      return;
    }

    this.cargando = true;

    if (this.tipoReporte === 'lista') {
      // Generar reporte básico (lista detallada)
      this.reportesPDFService.generarReporteSolicitudes(this.solicitudes, this.filtros);
      this.cargando = false;
    } else {
      // Generar reporte analítico
      this.applicationsQueries.getApplicationsAnalyticsReport(this.filtros).subscribe({
        next: (data) => {
          this.reportesPDFService.generarReporteSolicitudesAnalisis(data, this.filtros);
          this.cargando = false;
        },
        error: (error) => {
          console.error('Error al generar reporte analítico:', error);
          this.cargando = false;
        }
      });
    }
  }

  limpiarFiltros(): void {
    this.filtros = {
      startDate: '',
      endDate: '',
      fileStatus: '',
      procedureType: '',
      categoryId: '',
      applicantName: '',
      companyName: '',
      applicationId: '',
        isAutomaticRenewal: undefined,
      tipoReporte: 'analisis'
    };
    this.tipoReporte = 'analisis';
    this.fechaInicio = null;
    this.fechaFin = null;
    this.cargarSolicitudes();
  }

  obtenerTextoBoton(): string {
    return this.tipoReporte === 'lista' 
      ? 'Generar Lista Detallada' 
      : 'Generar Reporte Analítico';
  }

  obtenerDescripcionReporte(): string {
    return this.tipoReporte === 'lista'
      ? 'Lista detallada de solicitudes con filtros aplicados en formato tabular'
      : 'Reporte ejecutivo con análisis estadístico, tendencias, insights y recomendaciones';
  }
}
