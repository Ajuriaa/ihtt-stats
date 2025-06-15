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
import { Fine } from '../../interfaces';
import { DashboardQueries } from '../../services';
import { ReportesPDFService } from '../../../reports/services/reportes-pdf.service';
import { ReporteParametros, MultasAnalisisData } from '../../../reports/interfaces';
import { LoadingComponent } from '../../../shared/loading/loading.component';

@Component({
  selector: 'app-fines-reports',
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
  templateUrl: './fines-reports.component.html',
  styleUrl: './fines-reports.component.scss'
})
export class FinesReportsComponent implements OnInit {
  cargando = false;
  multas: Fine[] = [];
  fechaInicio: Date | null = null;
  fechaFin: Date | null = null;
  tipoReporte: 'lista' | 'analisis' = 'analisis'; // Default to analytics report
  
  // Filtros
  filtros: ReporteParametros = {
    fechaInicio: '',
    fechaFin: '',
    departamento: '',
    region: '',
    estado: '',
    rtn: '',
    empleadoId: '',
    empleadoNombre: ''
  };

  departamentos = [
    'ATLÁNTIDA', 'COLON', 'YORO', 'OLANCHO',
    'ISLAS DE LA BAHÍA', 'CORTES', 'FRANCISCO MORAZÁN',
    'VALLE', 'COPAN', 'LEMPIRA', 'SANTA BARBARÁ', 'OCOTEPEQUE',
    'CHOLUTECA', 'COMAYAGUA', 'EL PARAÍSO', 'LA PAZ', 'INTIBUCA'
  ];

  regiones = [
    'REGIONAL DEL ATLANTICO, OFICINA PRINCIPAL, LA CEIBA',
    'REGIONAL NOR OCCIDENTAL, OFICINA PRINCIPAL, SAN PEDRO SULA',
    'REGIONAL OCCIDENTE, SANTA ROSA DE COPAN',
    'REGIONAL SUR, OFICINA PRINCIPAL, CHOLUTECA',
    'TEGUCIGALPA, OFICINA PRINCIPAL'
  ];

  estadosMulta = [
    'PAGADA',
    'ACTIVA', 
    'ANULADA'
  ];

  constructor(
    private dashboardQueries: DashboardQueries,
    private reportesPDFService: ReportesPDFService
  ) {}

  ngOnInit(): void {
    this.cargarMultas();
  }

  cargarMultas(): void {
    this.cargando = true;
    const parametros = this.construirParametros();
    
    this.dashboardQueries.getFines(parametros).subscribe({
      next: (response) => {
        this.multas = response.data;
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar multas:', error);
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
    if (this.filtros.departamento) {
      params.department = this.filtros.departamento;
    }
    if (this.filtros.region) {
      params.region = this.filtros.region;
    }
    if (this.filtros.estado) {
      params.status = this.filtros.estado;
    }
    if (this.filtros.rtn) {
      params.dniRtn = this.filtros.rtn;
    }
    if (this.filtros.empleadoId) {
      params.employeeId = this.filtros.empleadoId;
    }
    if (this.filtros.empleadoNombre) {
      params.employeeName = this.filtros.empleadoNombre;
    }
    
    return params;
  }

  aplicarFiltros(): void {
    this.cargarMultas();
  }

  limpiarFiltros(): void {
    this.fechaInicio = null;
    this.fechaFin = null;
    this.filtros = {
      fechaInicio: '',
      fechaFin: '',
      departamento: '',
      region: '',
      estado: '',
      rtn: '',
      empleadoId: '',
      empleadoNombre: ''
    };
    this.cargarMultas();
  }

  generarReporteMultasPDF(): void {
    if (this.tipoReporte === 'analisis') {
      this.generarReporteAnalisisMultas();
    } else {
      this.generarReporteListaMultas();
    }
  }

  private generarReporteAnalisisMultas(): void {
    this.cargando = true;
    const parametros = this.construirParametros();
    
    this.dashboardQueries.getFinesAnalyticsReport(parametros).subscribe({
      next: (datosAnalisis) => {
        this.reportesPDFService.generarReporteMultasAnalisis(
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

  private generarReporteListaMultas(): void {
    if (this.multas.length === 0) {
      alert('No hay datos para generar el reporte');
      return;
    }

    this.reportesPDFService.generarReporteMultas(
      this.multas,
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

  // Método auxiliar para deduplicar multas por noticeCode
  private deduplicarMultas(): any[] {
    const mapaUnico = new Map();
    this.multas.forEach(multa => {
      const noticeCode = multa.noticeCode?.toString();
      if (noticeCode && !mapaUnico.has(noticeCode)) {
        mapaUnico.set(noticeCode, multa);
      } else if (!noticeCode) {
        // Si no tiene noticeCode, incluirlo de todas formas
        const uniqueId = `no-notice-${Math.random()}`;
        mapaUnico.set(uniqueId, multa);
      }
    });
    return Array.from(mapaUnico.values());
  }

  // Métodos para obtener estadísticas rápidas (usando datos deduplicados)
  get totalMultas(): number {
    return this.deduplicarMultas().length;
  }

  get montoTotalMultas(): number {
    const multasUnicas = this.deduplicarMultas();
    return multasUnicas.reduce((total, multa) => total + (multa.totalAmount || 0), 0);
  }

  get multasPendientes(): number {
    const multasUnicas = this.deduplicarMultas();
    return multasUnicas.filter(multa => multa.fineStatus?.toLowerCase().includes('activa')).length;
  }

  get multasPagadas(): number {
    const multasUnicas = this.deduplicarMultas();
    return multasUnicas.filter(multa => multa.fineStatus?.toLowerCase().includes('pagada')).length;
  }
}
