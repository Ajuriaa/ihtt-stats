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
  
  // Filtros
  filtros: ReporteParametros = {
    fechaInicio: '',
    fechaFin: '',
    departamento: '',
    estado: ''
  };

  departamentos = [
    'Atlántida', 'Choluteca', 'Colón', 'Comayagua', 'Copán', 'Cortés',
    'El Paraíso', 'Francisco Morazán', 'Gracias a Dios', 'Intibucá',
    'Islas de la Bahía', 'La Paz', 'Lempira', 'Ocotepeque', 'Olancho',
    'Santa Bárbara', 'Valle', 'Yoro'
  ];

  estadosMulta = [
    'Pendiente',
    'Pagada',
    'Vencida',
    'En Proceso',
    'Cancelada'
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
    if (this.filtros.estado) {
      params.status = this.filtros.estado;
    }
    
    return params;
  }

  aplicarFiltros(): void {
    this.cargarMultas();
  }

  limpiarFiltros(): void {
    this.filtros = {
      fechaInicio: '',
      fechaFin: '',
      departamento: '',
      estado: ''
    };
    this.cargarMultas();
  }

  generarReporteMultasPDF(): void {
    if (this.multas.length === 0) {
      alert('No hay datos para generar el reporte');
      return;
    }

    this.reportesPDFService.generarReporteMultas(
      this.multas,
      this.filtros
    );
  }

  onFechaInicioChange(fecha: string): void {
    this.filtros.fechaInicio = fecha;
  }

  onFechaFinChange(fecha: string): void {
    this.filtros.fechaFin = fecha;
  }

  // Métodos para obtener estadísticas rápidas
  get totalMultas(): number {
    return this.multas.length;
  }

  get montoTotalMultas(): number {
    return this.multas.reduce((total, multa) => total + (multa.totalAmount || 0), 0);
  }

  get multasPendientes(): number {
    return this.multas.filter(multa => multa.fineStatus?.toLowerCase().includes('pendiente')).length;
  }

  get multasPagadas(): number {
    return this.multas.filter(multa => multa.fineStatus?.toLowerCase().includes('pagada')).length;
  }
}
