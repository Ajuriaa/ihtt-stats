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
import { DashboardQueries } from '../../services';
import { ReportesPDFService } from '../../../reports/services/reportes-pdf.service';
import { LoadingComponent } from '../../../shared/loading/loading.component';

@Component({
  selector: 'app-eventual-permits-reports',
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
    LoadingComponent
  ],
  templateUrl: './eventual-permits-reports.component.html',
  styleUrl: './eventual-permits-reports.component.scss'
})
export class EventualPermitsReportsComponent implements OnInit {
  cargando = false;
  permisos: any[] = [];
  fechaInicio: Date | null = null;
  fechaFin: Date | null = null;
  tipoReporte: 'lista' | 'analisis' = 'analisis'; // Default to analytics report
  
  // Filtros
  filtros = {
    fechaInicio: '',
    fechaFin: '',
    estadoPermiso: '',
    tipoServicio: '',
    rtn: '',
    nombreSolicitante: ''
  };

  estadosPermiso = [
    'ACTIVO',
    'PROCESADO',
    'ANULADO',
    'PENDIENTE'
  ];

  tiposServicio = [
    'PASAJEROS',
    'CARGA',
    'No Especificado'
  ];

  oficinasRegionales = [
    'TEGUCIGALPA, OFICINA PRINCIPAL',
    'REGIONAL NOR OCCIDENTAL, OFICINA PRINCIPAL, SAN PEDRO SULA',
    'REGIONAL SUR, OFICINA PRINCIPAL, CHOLUTECA',
    'REGIONAL DEL ATLANTICO, OFICINA PRINCIPAL, LA CEIBA',
    'Creado desde portal'
  ];

  constructor(
    private dashboardQueries: DashboardQueries,
    private reportesPDFService: ReportesPDFService
  ) {}

  ngOnInit(): void {
    this.cargarPermisos();
  }

  cargarPermisos(): void {
    this.cargando = true;
    const parametros = this.construirParametros();
    
    this.dashboardQueries.getEventualPermits(parametros).subscribe({
      next: (response) => {
        this.permisos = response.data;
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar permisos eventuales:', error);
        this.cargando = false;
      }
    });
  }

  private construirParametros(): any {
    const params: any = {};
    
    if (this.filtros.fechaInicio) {
      params.startDate = this.filtros.fechaInicio;
    }
    if (this.filtros.fechaFin) {
      params.endDate = this.filtros.fechaFin;
    }
    if (this.filtros.estadoPermiso) {
      params.permitStatus = this.filtros.estadoPermiso;
    }
    if (this.filtros.tipoServicio) {
      params.serviceType = this.filtros.tipoServicio;
    }
    if (this.filtros.rtn) {
      params.rtn = this.filtros.rtn;
    }
    if (this.filtros.nombreSolicitante) {
      params.applicantName = this.filtros.nombreSolicitante;
    }
    
    // Always use 'system' dateType for eventual permits
    if (this.filtros.fechaInicio || this.filtros.fechaFin) {
      params.dateType = 'system';
    }
    
    return params;
  }

  aplicarFiltros(): void {
    this.cargarPermisos();
  }

  limpiarFiltros(): void {
    this.fechaInicio = null;
    this.fechaFin = null;
    this.filtros = {
      fechaInicio: '',
      fechaFin: '',
      estadoPermiso: '',
      tipoServicio: '',
      rtn: '',
      nombreSolicitante: ''
    };
    this.cargarPermisos();
  }

  generarReportePermisosPDF(): void {
    if (this.tipoReporte === 'analisis') {
      this.generarReporteAnalisisPermisos();
    } else {
      this.generarReporteListaPermisos();
    }
  }

  private generarReporteAnalisisPermisos(): void {
    this.cargando = true;
    const parametros = this.construirParametros();
    
    this.dashboardQueries.getEventualPermitsAnalyticsReport(parametros).subscribe({
      next: (datosAnalisis) => {
        this.reportesPDFService.generarReportePermisosEventualesAnalisis(
          datosAnalisis,
          this.filtros
        );
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al generar reporte de análisis:', error);
        alert('Error al generar el reporte de análisis');
        this.cargando = false;
      }
    });
  }

  private generarReporteListaPermisos(): void {
    if (this.permisos.length === 0) {
      alert('No hay datos para generar el reporte');
      return;
    }

    this.reportesPDFService.generateEventualPermitsPDF(
      this.permisos,
      this.filtros
    );
  }

  onFechaInicioChange(fecha: Date): void {
    this.fechaInicio = fecha;
    this.filtros.fechaInicio = fecha ? moment.utc(fecha).format('YYYY-MM-DD') : '';
  }

  onFechaFinChange(fecha: Date): void {
    this.fechaFin = fecha;
    this.filtros.fechaFin = fecha ? moment.utc(fecha).format('YYYY-MM-DD') : '';
  }

  // Método auxiliar para deduplicar permisos por noticeCode
  private deduplicarPermisos(): any[] {
    const mapaUnico = new Map();
    this.permisos.forEach(permiso => {
      const noticeCode = permiso.noticeCode?.toString();
      if (noticeCode && !mapaUnico.has(noticeCode)) {
        mapaUnico.set(noticeCode, permiso);
      } else if (!noticeCode) {
        // Si no tiene noticeCode, incluirlo de todas formas
        const uniqueId = `no-notice-${Math.random()}`;
        mapaUnico.set(uniqueId, permiso);
      }
    });
    return Array.from(mapaUnico.values());
  }

  // Métodos para obtener estadísticas rápidas (usando datos deduplicados)
  get totalPermisos(): number {
    return this.deduplicarPermisos().length;
  }

  get montoTotalPermisos(): number {
    const permisosUnicos = this.deduplicarPermisos();
    return permisosUnicos.reduce((total, permiso) => total + (permiso.amount || 0), 0);
  }

  get permisosActivos(): number {
    const permisosUnicos = this.deduplicarPermisos();
    return permisosUnicos.filter(permiso => permiso.permitStatus?.toLowerCase().includes('activo')).length;
  }

  get permisosProcesados(): number {
    const permisosUnicos = this.deduplicarPermisos();
    return permisosUnicos.filter(permiso => permiso.permitStatus?.toLowerCase().includes('procesado')).length;
  }
}