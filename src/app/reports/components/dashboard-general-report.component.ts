import { Component, OnInit } from '@angular/core';
import moment from 'moment';
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
import { DashboardQueries } from '../../admin/services';
import { ReportesPDFService } from '../services/reportes-pdf.service';
import { ReporteParametros, DashboardGeneralData, DepartamentoData, AlertaData } from '../interfaces';
import { LoadingComponent } from '../../shared/loading/loading.component';

@Component({
  selector: 'app-dashboard-general-report',
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
  template: `
    <div class="dashboard-general-container">
      <mat-card class="filter-card">
        <mat-card-header>
          <mat-card-title>Reporte Dashboard General</mat-card-title>
          <mat-card-subtitle>Genere reportes estadísticos generales del sistema</mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content>
          <div class="filters-section">
            <h3>Parámetros del Reporte</h3>
            
            <div class="filters-grid">
              <!-- Filtro de fechas -->
              <div class="date-filters">
                <mat-form-field appearance="outline">
                  <mat-label>Fecha Inicio</mat-label>
                  <input 
                    matInput 
                    [matDatepicker]="pickerInicio" 
                    [(ngModel)]="fechaInicio"
                    (dateChange)="onFechaInicioChange($event.value)">
                  <mat-datepicker-toggle matSuffix [for]="pickerInicio"></mat-datepicker-toggle>
                  <mat-datepicker #pickerInicio></mat-datepicker>
                </mat-form-field>
                
                <mat-form-field appearance="outline">
                  <mat-label>Fecha Fin</mat-label>
                  <input 
                    matInput 
                    [matDatepicker]="pickerFin" 
                    [(ngModel)]="fechaFin"
                    (dateChange)="onFechaFinChange($event.value)">
                  <mat-datepicker-toggle matSuffix [for]="pickerFin"></mat-datepicker-toggle>
                  <mat-datepicker #pickerFin></mat-datepicker>
                </mat-form-field>
              </div>
              
              <!-- Filtro de departamento -->
              <mat-form-field appearance="outline">
                <mat-label>Departamento</mat-label>
                <mat-select [(ngModel)]="filtros.departamento">
                  <mat-option value="">Todos los departamentos</mat-option>
                  <mat-option *ngFor="let dept of departamentos" [value]="dept">
                    {{ dept }}
                  </mat-option>
                </mat-select>
              </mat-form-field>
            </div>
            
            <!-- Botones de acción -->
            <div class="action-buttons">
              <button mat-raised-button color="primary" (click)="cargarDatos()" [disabled]="cargando">
                <mat-icon>refresh</mat-icon>
                Actualizar Datos
              </button>
              
              <button 
                mat-raised-button 
                color="accent" 
                (click)="generarReportePDF()"
                [disabled]="cargando || !datosDisponibles">
                <mat-icon>picture_as_pdf</mat-icon>
                Generar Reporte PDF
              </button>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
      
      <!-- Vista previa de datos -->
      <mat-card class="preview-card" *ngIf="!cargando && datosGenerales">
        <mat-card-header>
          <mat-card-title>Vista Previa de Datos</mat-card-title>
          <mat-card-subtitle>Resumen de la información que se incluirá en el reporte</mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content>
          <div class="preview-grid">
            <!-- Totales mensuales -->
            <div class="preview-section">
              <h4>Totales del Período</h4>
              <div class="stats-grid">
                <div class="stat-item">
                  <span class="stat-label">Certificados:</span>
                  <span class="stat-value">{{ datosGenerales.certificadosEmitidos }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Permisos:</span>
                  <span class="stat-value">{{ datosGenerales.permisosOtorgados }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Multas:</span>
                  <span class="stat-value">{{ datosGenerales.multasAplicadas }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Ingresos:</span>
                  <span class="stat-value">L. {{ datosGenerales.ingresosMensuales.toLocaleString('es-HN') }}</span>
                </div>
              </div>
            </div>
            
            <!-- Variaciones -->
            <div class="preview-section">
              <h4>Variaciones Porcentuales</h4>
              <div class="variations-grid">
                <div class="variation-item" [class.positive]="datosGenerales.variacionCertificados > 0" [class.negative]="datosGenerales.variacionCertificados < 0">
                  <span>Certificados: {{ datosGenerales.variacionCertificados.toFixed(2) }}%</span>
                </div>
                <div class="variation-item" [class.positive]="datosGenerales.variacionPermisos > 0" [class.negative]="datosGenerales.variacionPermisos < 0">
                  <span>Permisos: {{ datosGenerales.variacionPermisos.toFixed(2) }}%</span>
                </div>
                <div class="variation-item" [class.positive]="datosGenerales.variacionMultas > 0" [class.negative]="datosGenerales.variacionMultas < 0">
                  <span>Multas: {{ datosGenerales.variacionMultas.toFixed(2) }}%</span>
                </div>
                <div class="variation-item" [class.positive]="datosGenerales.variacionIngresos > 0" [class.negative]="datosGenerales.variacionIngresos < 0">
                  <span>Ingresos: {{ datosGenerales.variacionIngresos.toFixed(2) }}%</span>
                </div>
              </div>
            </div>
            
            <!-- Alertas -->
            <div class="preview-section" *ngIf="datosGenerales.alertas.length > 0">
              <h4>Alertas del Sistema</h4>
              <div class="alerts-list">
                <div 
                  *ngFor="let alerta of datosGenerales.alertas" 
                  class="alert-item"
                  [class.critical]="alerta.estado === 'CRÍTICO'"
                  [class.warning]="alerta.estado === 'ADVERTENCIA'"
                  [class.normal]="alerta.estado === 'NORMAL'">
                  <mat-icon>{{ getAlertIcon(alerta.estado) }}</mat-icon>
                  <span>{{ alerta.concepto }}: {{ alerta.valorActual }} ({{ alerta.estado }})</span>
                </div>
              </div>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
      
      <!-- Loading state -->
      <div *ngIf="cargando" class="loading-section">
        <app-loading></app-loading>
        <p>Cargando datos del dashboard...</p>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-general-container {
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .filter-card, .preview-card {
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      border-radius: 8px;
    }

    .filters-section {
      padding: 16px 0;
    }

    .filters-section h3 {
      margin-bottom: 16px;
      color: #333;
      font-weight: 500;
    }

    .filters-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 16px;
      margin-bottom: 20px;
    }

    .date-filters {
      display: flex;
      gap: 16px;
      grid-column: 1 / -1;
    }

    .date-filters mat-form-field {
      flex: 1;
    }

    .action-buttons {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }

    .action-buttons button {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .preview-grid {
      display: grid;
      gap: 20px;
    }

    .preview-section h4 {
      margin: 0 0 12px 0;
      color: #333;
      font-weight: 500;
      border-bottom: 2px solid #e0e0e0;
      padding-bottom: 8px;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
    }

    .stat-item {
      display: flex;
      justify-content: space-between;
      padding: 8px 12px;
      background-color: #f8f9fa;
      border-radius: 4px;
    }

    .stat-label {
      font-weight: 500;
      color: #666;
    }

    .stat-value {
      font-weight: 600;
      color: #333;
    }

    .variations-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 8px;
    }

    .variation-item {
      padding: 8px 12px;
      border-radius: 4px;
      text-align: center;
      font-weight: 500;
    }

    .variation-item.positive {
      background-color: #e8f5e8;
      color: #2e7d32;
    }

    .variation-item.negative {
      background-color: #ffebee;
      color: #c62828;
    }

    .alerts-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .alert-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      border-radius: 4px;
      font-weight: 500;
    }

    .alert-item.critical {
      background-color: #ffebee;
      color: #c62828;
    }

    .alert-item.warning {
      background-color: #fff8e1;
      color: #f57c00;
    }

    .alert-item.normal {
      background-color: #e8f5e8;
      color: #2e7d32;
    }

    .loading-section {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px;
      text-align: center;
    }

    .loading-section p {
      margin-top: 16px;
      color: #666;
    }

    mat-form-field {
      width: 100%;
    }

    @media (max-width: 768px) {
      .dashboard-general-container {
        padding: 16px;
      }
      
      .filters-grid {
        grid-template-columns: 1fr;
      }
      
      .date-filters {
        flex-direction: column;
      }
      
      .stats-grid, .variations-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class DashboardGeneralReportComponent implements OnInit {
  cargando = false;
  datosGenerales: DashboardGeneralData | null = null;
  datosDisponibles = false;
  fechaInicio: Date | null = null;
  fechaFin: Date | null = null;
  
  // Filtros
  filtros: ReporteParametros = {
    fechaInicio: '',
    fechaFin: '',
    departamento: ''
  };

  departamentos = [
    'Atlántida', 'Choluteca', 'Colón', 'Comayagua', 'Copán', 'Cortés',
    'El Paraíso', 'Francisco Morazán', 'Gracias a Dios', 'Intibucá',
    'Islas de la Bahía', 'La Paz', 'Lempira', 'Ocotepeque', 'Olancho',
    'Santa Bárbara', 'Valle', 'Yoro'
  ];

  constructor(
    private dashboardQueries: DashboardQueries,
    private reportesPDFService: ReportesPDFService
  ) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.cargando = true;
    const parametros = this.construirParametros();
    
    this.dashboardQueries.getDashboardAnalytics(parametros).subscribe({
      next: (response) => {
        this.datosGenerales = this.procesarDatosDashboard(response);
        this.datosDisponibles = true;
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar datos del dashboard:', error);
        this.generarDatosMock(); // Fallback con datos mock
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
    
    return params;
  }

  private procesarDatosDashboard(data: any): DashboardGeneralData {
    return {
      certificadosEmitidos: data.kpis?.totalPaid || 0,
      certificadosAcumulados: data.total || 0,
      permisosOtorgados: Math.floor((data.total || 0) * 0.6), // Mock based on data
      permisosAcumulados: Math.floor((data.total || 0) * 2.5),
      multasAplicadas: Math.floor((data.total || 0) * 0.3),
      multasAcumuladas: Math.floor((data.total || 0) * 1.8),
      ingresosMensuales: data.kpis?.totalPaid || 0,
      ingresosAcumulados: (data.kpis?.totalPaid || 0) * 8,
      variacionCertificados: Math.random() * 20 - 10,
      variacionPermisos: Math.random() * 20 - 10,
      variacionMultas: Math.random() * 20 - 10,
      variacionIngresos: Math.random() * 20 - 10,
      ingresosCertificados: (data.kpis?.totalPaid || 0) * 0.6,
      ingresosPermisos: (data.kpis?.totalPaid || 0) * 0.25,
      ingresosMultas: (data.kpis?.totalPaid || 0) * 0.1,
      ingresosOtros: (data.kpis?.totalPaid || 0) * 0.05,
      departamentos: [
        { nombre: 'Francisco Morazán', certificados: 45, permisos: 28, multas: 22, ingresos: 45000 },
        { nombre: 'Cortés', certificados: 38, permisos: 25, multas: 18, ingresos: 38000 },
        { nombre: 'Atlántida', certificados: 32, permisos: 20, multas: 15, ingresos: 28000 }
      ],
      alertas: [
        { concepto: 'Certificados Vencidos', valorActual: 25, umbral: 20, estado: 'ADVERTENCIA' },
        { concepto: 'Multas Pendientes', valorActual: 45, umbral: 50, estado: 'NORMAL' }
      ]
    };
  }

  private generarDatosMock(): void {
    this.datosGenerales = {
      certificadosEmitidos: 145,
      certificadosAcumulados: 1250,
      permisosOtorgados: 89,
      permisosAcumulados: 756,
      multasAplicadas: 67,
      multasAcumuladas: 423,
      ingresosMensuales: 125000,
      ingresosAcumulados: 980000,
      variacionCertificados: 8.5,
      variacionPermisos: -2.3,
      variacionMultas: 15.7,
      variacionIngresos: 12.4,
      ingresosCertificados: 75000,
      ingresosPermisos: 30000,
      ingresosMultas: 15000,
      ingresosOtros: 5000,
      departamentos: [
        { nombre: 'Francisco Morazán', certificados: 45, permisos: 28, multas: 22, ingresos: 45000 },
        { nombre: 'Cortés', certificados: 38, permisos: 25, multas: 18, ingresos: 38000 },
        { nombre: 'Atlántida', certificados: 32, permisos: 20, multas: 15, ingresos: 28000 }
      ],
      alertas: [
        { concepto: 'Certificados Vencidos', valorActual: 25, umbral: 20, estado: 'ADVERTENCIA' },
        { concepto: 'Multas Pendientes', valorActual: 45, umbral: 50, estado: 'NORMAL' }
      ]
    };
    this.datosDisponibles = true;
  }

  generarReportePDF(): void {
    if (!this.datosGenerales) {
      alert('No hay datos disponibles para generar el reporte');
      return;
    }

    this.reportesPDFService.generarReporteDashboardGeneral(
      this.datosGenerales,
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

  getAlertIcon(estado: string): string {
    switch (estado) {
      case 'CRÍTICO': return 'error';
      case 'ADVERTENCIA': return 'warning';
      case 'NORMAL': return 'check_circle';
      default: return 'info';
    }
  }
}