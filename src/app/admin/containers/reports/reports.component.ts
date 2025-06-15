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
import { Certificate } from '../../interfaces';
import { DashboardQueries } from '../../services';
import { ReportesPDFService } from '../../../reports/services/reportes-pdf.service';
import { ReporteParametros, CertificadosAnalisisData } from '../../../reports/interfaces';
import { LoadingComponent } from '../../../shared/loading/loading.component';
import { DateFilterComponent } from '../../../shared/date-filter/date-filter.component';

@Component({
  selector: 'app-reports',
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
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.scss'
})
export class ReportsComponent implements OnInit {
  cargando = false;
  certificados: Certificate[] = [];
  fechaInicio: Date | null = null;
  fechaFin: Date | null = null;
  tipoReporte: 'lista' | 'analisis' = 'analisis'; // Default to analytics report
  
  // Filtros
  filtros: ReporteParametros = {
    fechaInicio: '',
    fechaFin: '',
    departamento: '',
    modalidad: '',
    estadoAviso: '',
    rtn: '',
    tipoFecha: 'certificateExpiration'
  };

  departamentos = [
    'ATLANTIDA', 'CHOLUTECA', 'COLON', 'COMAYAGUA', 'COPAN',
    'CORTES', 'EL PARAISO', 'FRANCISCO MORAZAN', 'GRACIAS A DIOS',
    'INTIBUCA', 'ISLAS DE LA BAHIA', 'LA PAZ', 'LEMPIRA', 'NACIONAL',
    'OCOTEPEQUE', 'OLANCHO', 'SANTA BARBARA', 'VALLE', 'YORO'
  ];

  modalidades = [
    'BUS INTERNACIONAL', 'BUS INTERURBANO', 'BUS URBANO',
    'CARGA ESPECIALIZADA', 'CARGA NO ESPECIALIZADA', 'CARGA PRIVADA ESPECIALIZADA',
    'ESPECIAL CARGA NO ESPECIALIZADA', 'ESPECIAL EVENTUAL PASAJEROS',
    'ESPECIAL PASAJEROS', 'MOTOTAXI', 'PRIVADO CARGA',
    'SERVICIO EJECUTIVO AEREOPORTUARIO', 'TAXI'
  ];

  estadosAviso = [
    'ACTIVO', 'ANULADO', 'NO TIENE', 'PAGADO', 'SIN PAGO SEGUN DECRETO #60-2019'
  ];

  tiposFecha = [
    { value: 'certificateExpiration', label: 'Expiración de Certificado' },
    { value: 'permissionExpiration', label: 'Expiración de Permiso' },
    { value: 'payment', label: 'Fecha de Pago' }
  ];

  constructor(
    private dashboardQueries: DashboardQueries,
    private reportesPDFService: ReportesPDFService
  ) {}

  ngOnInit(): void {
    this.cargarCertificados();
  }

  cargarCertificados(): void {
    this.cargando = true;
    const parametros = this.construirParametros();
    
    this.dashboardQueries.getCertificates(parametros).subscribe({
      next: (response) => {
        this.certificados = response.data;
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar certificados:', error);
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
    if (this.filtros.modalidad) {
      params.modality = this.filtros.modalidad;
    }
    if (this.filtros.estadoAviso) {
      params.noticeStatus = this.filtros.estadoAviso;
    }
    if (this.filtros.rtn) {
      params.rtn = this.filtros.rtn;
    }
    if (this.filtros.tipoFecha) {
      params.dateType = this.filtros.tipoFecha;
    }
    
    return params;
  }

  aplicarFiltros(): void {
    this.cargarCertificados();
  }

  limpiarFiltros(): void {
    this.fechaInicio = null;
    this.fechaFin = null;
    this.filtros = {
      fechaInicio: '',
      fechaFin: '',
      departamento: '',
      modalidad: '',
      estadoAviso: '',
      rtn: '',
      tipoFecha: 'certificateExpiration'
    };
    this.cargarCertificados();
  }

  generarReportePDF(): void {
    if (this.tipoReporte === 'analisis') {
      this.generarReporteAnalisisCertificados();
    } else {
      this.generarReporteListaCertificados();
    }
  }

  private generarReporteAnalisisCertificados(): void {
    this.cargando = true;
    const parametros = this.construirParametros();
    
    this.dashboardQueries.getCertificatesAnalyticsReport(parametros).subscribe({
      next: (datosAnalisis) => {
        this.reportesPDFService.generarReporteCertificadosAnalisisEjecutivo(
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

  private generarReporteListaCertificados(): void {
    if (this.certificados.length === 0) {
      alert('No hay datos para generar el reporte');
      return;
    }

    this.reportesPDFService.generarReporteCertificados(
      this.certificados,
      this.filtros
    );
  }

  // Legacy method - kept for backward compatibility
  generarReporteDetalladoPDF(): void {
    if (this.certificados.length === 0) {
      alert('No hay datos para generar el reporte');
      return;
    }

    // Cargar datos de analytics para reporte detallado
    const parametros = this.construirParametros();
    this.dashboardQueries.getCertificatesAnalytics(parametros).subscribe({
      next: (response) => {
        this.reportesPDFService.generarReporteCertificadosAnalisis(
          response,
          this.filtros
        );
      },
      error: (error) => {
        console.error('Error al cargar datos de análisis:', error);
        alert('Error al generar el reporte de análisis');
      }
    });
  }

  onFechaInicioChange(fecha: Date): void {
    this.fechaInicio = fecha;
    this.filtros.fechaInicio = fecha ? moment.utc(fecha).format('YYYY-MM-DD') : '';
  }

  onFechaFinChange(fecha: Date): void {
    this.fechaFin = fecha;
    this.filtros.fechaFin = fecha ? moment.utc(fecha).format('YYYY-MM-DD') : '';
  }
}