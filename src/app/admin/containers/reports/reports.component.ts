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
  
  // Filtros
  filtros: ReporteParametros = {
    fechaInicio: '',
    fechaFin: '',
    departamento: '',
    tipoDocumento: '',
    estado: ''
  };

  departamentos = [
    'Atlántida', 'Choluteca', 'Colón', 'Comayagua', 'Copán', 'Cortés',
    'El Paraíso', 'Francisco Morazán', 'Gracias a Dios', 'Intibucá',
    'Islas de la Bahía', 'La Paz', 'Lempira', 'Ocotepeque', 'Olancho',
    'Santa Bárbara', 'Valle', 'Yoro'
  ];

  tiposDocumento = [
    'Certificado de Operación',
    'Certificado de Habilitación',
    'Certificado de Inspección',
    'Certificado de Renovación'
  ];

  estados = [
    'Activo',
    'Vencido',
    'Pendiente',
    'Cancelado'
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
    if (this.filtros.tipoDocumento) {
      params.documentType = this.filtros.tipoDocumento;
    }
    if (this.filtros.estado) {
      params.status = this.filtros.estado;
    }
    
    return params;
  }

  aplicarFiltros(): void {
    this.cargarCertificados();
  }

  limpiarFiltros(): void {
    this.filtros = {
      fechaInicio: '',
      fechaFin: '',
      departamento: '',
      tipoDocumento: '',
      estado: ''
    };
    this.cargarCertificados();
  }

  generarReportePDF(): void {
    if (this.certificados.length === 0) {
      alert('No hay datos para generar el reporte');
      return;
    }

    this.reportesPDFService.generarReporteCertificados(
      this.certificados,
      this.filtros
    );
  }

  generarReporteDetalladoPDF(): void {
    if (this.certificados.length === 0) {
      alert('No hay datos para generar el reporte');
      return;
    }

    // Aquí se podría generar un reporte más detallado con análisis
    // Para ahora usamos el mismo método
    this.reportesPDFService.generarReporteCertificados(
      this.certificados,
      this.filtros
    );
  }

  onFechaInicioChange(fecha: string): void {
    this.filtros.fechaInicio = fecha;
  }

  onFechaFinChange(fecha: string): void {
    this.filtros.fechaFin = fecha;
  }
}