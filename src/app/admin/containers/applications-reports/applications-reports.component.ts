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

  estadosSolicitud = [
    'ACTIVO',
    'ESTADO-020', 
    'INACTIVO',
    'RETROTRAIDO POR ERROR DE USUARIO',
    'FINALIZADO'
  ];

  tiposTramine = [
    'NUEVO',
    'MODIFICACIÓN',
    'RENOVACIÓN',
    'REPOSICIÓN',
    'CANCELACIÓN',
    'DENUNCIA',
    'HISTORICO DGT',
    'INCREMENTO',
    'AUTORIZACION',
    'SUSPENSIÓN',
    'RENUNCIA',
    'OPOSICIÓN',
    'IMPUGNACIÓN'
  ];

  categorias = [
    'BUS NACIONAL EJECUTIVO AEROPORTUARIO',
    'TAXI DIRECTO O DE BARRIDO',
    'CARGA GENERAL',
    'MOTOTAXI',
    'CARGA PRIVADA GENERAL',
    'BUS INTERURBANO REGULAR',
    'CARGA GENERAL REMOLQUE/PLATAFORMA',
    'DENUNCIA',
    'TRANSPORTE DE GRUPO RELIGIOSOS',
    'TRANSPORTE DE TURISMO',
    'CARGA ESPECIALIZADA REMOLQUE',
    'BUS URBANO REGULAR',
    'TRANSPORTE DE ESTUDIANTES',
    'TRANSPORTE DE TRABAJADORES',
    'CARGA PRIVADA GENERAL REMOLQUE/PLATAFORMA',
    'HISTORICO DGT',
    'BUS URBANO RÁPIDO',
    'TRANSPORTE DE GRUPO  EXCURSIONES',
    'TAXI COLECTIVO O DE PUNTO',
    'CARGA ESPECIALIZADA NO ARTICULADA',
    'INTERNACIONAL DE CARGA EN TRANSITO POR HONDURAS.',
    'CARGA PRIVADA ESPECIALIZADA',
    'CERTIFICACION DE TALLER',
    'BUS SUB URBANO REGULAR',
    'BUS INTERNACIONAL CON DESTINO/SALIDA HONDURAS',
    'CARGA PRIVADA ESPECIALIZADA REMOLQUE',
    'BUS INTERURBANO EJECUTIVO',
    'TAXI EJECUTIVO AEROPORTUARIO',
    'TRANSPORTE DE GRUPOS SOCIALES',
    'BUS DE TRANSPORTE RÁPIDO',
    'BUS CO URBANO',
    'BUS INTERURBANO DIRECTO',
    'AUTORIZACION DE ESCUELA PRIVADA DE PILOTOS - ESCUELA NACIONAL DE TRANSPORTE TERRESTRE',
    'PROCEDIMIENTO DE OFICIO',
    'TAXI SERVICIO DE RADIO',
    'TAXI SERVICIO EJECUTIVO',
    'AUTORIZACIÓN Y REGISTRO DE CONSORCIO OPERATIVO',
    'TRANSPORTE PRIVADO DE CARGA',
    'BUS URBANO EJECUTIVO',
    'INTERNACIONAL DE CARGA CON DESTINO/SALIDA DE HONDURAS',
    'TRANSPORTE DE EQUIPO Y MAQUINARIA AGRÍCOLA',
    'BUS INTERNACIONAL EN TRANSITO POR HONDURAS',
    'TRANSPORTE GRUA',
    'PERFORADORA Y SIMILARES',
    'DICTAMEN TÉCNICO PRE-CERTIFICACIÓN',
    'BUS SUB URBANO RÁPIDO',
    'MOTOCARGA',
    'CARGA GENERAL NO ARTICULADA'
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
    // Initialize default date range (start of month to today)
    this.filtros.startDate = moment.utc().startOf('month').format('YYYY-MM-DD');
    this.filtros.endDate = moment.utc().format('YYYY-MM-DD');
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
      this.cargarSolicitudes();
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
      startDate: moment.utc().startOf('month').format('YYYY-MM-DD'),
      endDate: moment.utc().format('YYYY-MM-DD'),
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
