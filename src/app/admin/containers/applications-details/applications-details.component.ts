import { Component, OnInit } from '@angular/core';
import { ApplicationsQueries } from '../../services/applications.queries';
import { NgxPaginationModule } from 'ngx-pagination';
import { MatTableModule } from '@angular/material/table';
import moment from 'moment';
import { CommonModule } from '@angular/common';
import { DateFilterComponent, LoadingComponent, NoResultComponent, PrimaryButtonComponent } from 'src/app/shared';
import { Application } from '../../interfaces/applications.interfaces';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ExcelHelper, PDFHelper } from 'src/app/core/helpers';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

const COLUMNS = ['receivedDate', 'applicationId', 'applicantName', 'companyName', 'fileStatus', 'procedureTypeDescription', 'categoryDescription', 'isAutomaticRenewal', 'cityCode'];

@Component({
  selector: 'app-applications-details',
  standalone: true,
  imports: [
    NgxPaginationModule, MatTableModule, CommonModule, NoResultComponent,
    DateFilterComponent, MatFormFieldModule, MatOptionModule, MatSelectModule,
    FormsModule, PrimaryButtonComponent, CommonModule, MatInputModule, LoadingComponent, MatAutocompleteModule
  ],
  templateUrl: './applications-details.component.html',
  styleUrl: './applications-details.component.scss'
})
export class ApplicationsDetailsComponent implements OnInit {
  public applications: Application[] = [];
  public page = 1;
  public backendPage = 1;
  public itemsPerPage = 9;
  public totalApplications = 0;
  public isLoading = false;
  public displayedColumns = COLUMNS;
  public start = moment.utc().startOf('month').format('YYYY-MM-DD');
  public end = moment.utc().format('YYYY-MM-DD');
  public globalParams = {};
  public applicantName = '';
  public companyName = '';
  public applicationId = '';

  // Filter options from documentation
  public fileStatuses: string[] = [
    'ACTIVO',
    'ESTADO-020', 
    'INACTIVO',
    'RETROTRAIDO POR ERROR DE USUARIO',
    'FINALIZADO'
  ];
  
  public procedureTypes: string[] = [
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
  
  public categories: string[] = [
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
  
  public procedureClasses: string[] = [
    'PERMISO DE EXPLOTACIÓN',
    'CAMBIO DE PLACA',
    'CERTIFICADO DE OPERACIÓN',
    'INCREMENTO DE CERTIFICADO DE OPERACIÓN AL PERMISO DE EXPLOTACION',
    'DESVINCULACION DE UNIDAD',
    'ESTUDIO DE FACTIBILIDAD',
    'PERMISO ESPECIAL PARA EL SERVICIO DE TRANSPORTE ESPECIAL',
    'LEGALIZACIÓN',
    'CAMBIO DE UNIDAD',
    'DENUNCIA TRANSPORTISTA',
    'CESIÓN DE DERECHO POR RAZÓN DE CENSO',
    'CANTIDAD DE PASAJEROS',
    'CESIÓN DE DERECHO',
    'SOCIO',
    'CAMBIO DE EJES',
    'CAMBIO DE MOTOR',
    'DENUNCIA CIUDADANA',
    'RAZON SOCIAL O DENOMINACION SOCIAL',
    'CAMBIO DE CATEGORIA',
    'DENUNCIA PERDIDA/EXTRAVIO C.O/P.E',
    'HISTORICO DGT',
    'CAMBIOS DE HORARIOS',
    'CAMBIO DE TARIFA',
    'CAMBIO DE RUTA',
    'CERTIFICACION DE TALLER AUTOMOTRIZ MIXTO',
    'CAMBIO DE COLOR',
    'RECORTE DE RUTA',
    'CAMBIO DE TIPO DE VEHICULO',
    'EXTENSION DE RUTA',
    'CERTIFICACION DE TALLER AUTOMOTRIZ PUBLICO',
    'CERTIFICACION DE TALLER AUTOMOTRIZ PRIVADO',
    'CERTIFICADO DE OPERACIÓN PROCESO PERIODO TAXI',
    'PERMISO DE EXPLOTACIÓN PROCESO PERIODO TAXI',
    'CAMBIO DE PILOTO',
    'AUTORIZACION DE ESCUELA PRIVADA DE PILOTOS - ESCUELA NACIONAL DE TRANSPORTE TERRESTRE',
    'RECONSTRUCCIÓN DE EXPEDIENTE',
    'RECTIFICACION DE CERTIFICADO DE OPERACION O PERMISO DE EXPLOTACION',
    'CAMBIO DE CHASIS',
    'CODIGO ADUANERO HN',
    'UNIFICACION DE PERMISOS DE EXPLOTACION CON INCORPORACION DE CERTIFICADOS DE OPERACIÓN',
    'PROCEDIMIENTO DE OFICIO IHTT',
    'TEMPORAL',
    'INCLUSION DE PUNTOS INTERMEDIOS',
    'REPRESENTANTE  LEGAL',
    'AUTORIZACIÓN Y REGISTRO DE CONSORCIO OPERATIVO',
    'CAMBIO DE CARROCERIA',
    'CAMBIO DE DESCRIPCION',
    'PROCEDIMIENTO DE DESVINCULACION DE UNIDAD DE OFICIO IHTT',
    'DESBLOQUEO DE VEHICULO',
    'DENUNCIA INCUMPLIMIENTO TARIFAS MÍNIMAS',
    'DICTAMEN TÉCNICO PRE-CERTIFICACIÓN',
    'TARJETA INTELIGENTE',
    'SOLICITUD APROBACIÓN E INSCRIPCIÓN DE CONTRATO',
    'PERMISO EVENTUAL PARA OPERAR CARGA SOBREDIMENSIONADA',
    'BENEFICIO DE REACTIVACION',
    'COMPENSACION DE TASA UNICA VEHICULAR ANUAL',
    'CAMBIOS DE ITINERARIOS',
    'INCORPORACION AL PROYECTO TAXI ROSA',
    'CERTIFICADO UNIFICACION DE FECHAS',
    'CONVERSIÓN  DE SISTEMA DE COMBUSTION',
    'PERMISO DE EXPLOTACION UNIFICACION DE FECHAS',
    'PERMISO ESPECIAL EVENTUAL',
    'PETICIÓN DE CENSO STPP',
    'REGULARIZACION DE LA PROPIEDAD DE LA CONCESION',
    'SOLICITUD EN TRAMITE',
    'ACTO ADMINISTRATIVO EMITIDO'
  ];
  
  public cityOptions: string[] = [
    'Regional SPS',
    'Regional TGU', 
    'Regional CHO',
    'Regional CEI'
  ];
  public renewalStates = [
    { value: true, label: 'Sí' },
    { value: false, label: 'No' }
  ];

  public selectedFileStatus = '';
  public selectedProcedureType = '';
  public selectedProcedureClass = '';
  public selectedCategory = '';
  public selectedCityCode = '';
  public selectedRenewalState: boolean | null = null;
  
  // Filtered options for autocomplete
  public filteredCategories = this.categories;
  public filteredProcedureClasses = this.procedureClasses;

  constructor(
    private applicationsService: ApplicationsQueries,
    private _toaster: ToastrService,
    private pdfHelper: PDFHelper,
    private excelHelper: ExcelHelper
  ) {}

  get startDateObject(): Date {
    return new Date(this.start);
  }

  get endDateObject(): Date {
    return new Date(this.end);
  }

  ngOnInit(): void {
    this.loadApplications();
  }

  public loadApplications(): void {
    this.isLoading = true;

    const extraParams = this.globalParams;
    const params = {
      paginated: true,
      page: this.backendPage
    };

    const cleanedParams = Object.fromEntries(
      Object.entries({ ...params, ...extraParams }).filter(([_, value]) => value !== undefined)
    );

    this.applicationsService.getApplications(cleanedParams).subscribe({
      next: (response) => {
        this.applications.push(...response.data);
        this.totalApplications = response.total;
        this.updateDisplayedApplications();
        this.isLoading = false;

        if (this.applications.length < this.totalApplications) {
          this.backendPage++;
        }
      },
      error: (error) => {
        console.error('Error loading applications:', error);
        this.isLoading = false;
      },
    });
  }

  public generatePDF(): void {
    this.pdfHelper.generateApplicationsPDF(this.applications, this.globalParams);
  }

  public onSubmit(): void {
    this.isLoading = true;
    this.page = 1;
    this.backendPage = 1;

    const params = {
      paginated: true,
      page: this.backendPage || undefined,
      startDate: this.start || undefined,
      endDate: this.end || undefined,
      fileStatus: this.selectedFileStatus || undefined,
      procedureTypeDescription: this.selectedProcedureType || undefined,
      procedureClassDescription: this.selectedProcedureClass || undefined,
      categoryDescription: this.selectedCategory || undefined,
      cityCode: this.selectedCityCode || undefined,
      applicantName: this.applicantName !== '' ? this.applicantName : undefined,
      companyName: this.companyName !== '' ? this.companyName : undefined,
      applicationId: this.applicationId !== '' ? this.applicationId : undefined,
      isAutomaticRenewal: this.selectedRenewalState !== null ? this.selectedRenewalState : undefined
    };
    this.globalParams = params;

    const cleanedParams = Object.fromEntries(
      Object.entries(params).filter(([_, value]) => value !== undefined)
    );

    this.applicationsService.getApplications(cleanedParams).subscribe({
      next: (response) => {
        this.applications = response.data;
        this.totalApplications = response.total;
        this.updateDisplayedApplications();
        this.isLoading = false;
      },
      error: (error) => {
        this._toaster.error('Error loading applications:', error);
        this.isLoading = false;
      }
    });
  }

  public generateExcel(): void {
    this.isLoading = true;
    const params = {
      startDate: this.start || undefined,
      endDate: this.end || undefined,
      fileStatus: this.selectedFileStatus || undefined,
      procedureTypeDescription: this.selectedProcedureType || undefined,
      procedureClassDescription: this.selectedProcedureClass || undefined,
      categoryDescription: this.selectedCategory || undefined,
      cityCode: this.selectedCityCode || undefined,
      applicantName: this.applicantName !== '' ? this.applicantName : undefined,
      companyName: this.companyName !== '' ? this.companyName : undefined,
      applicationId: this.applicationId !== '' ? this.applicationId : undefined,
      isAutomaticRenewal: this.selectedRenewalState !== null ? this.selectedRenewalState : undefined
    };

    const cleanedParams = Object.fromEntries(
      Object.entries(params).filter(([_, value]) => value !== undefined)
    );

    this.applicationsService.getApplications(cleanedParams).subscribe({
      next: (response) => {
        this.excelHelper.generateApplicationsExcel(response.data, 'solicitudes.xlsx');
        this.isLoading = false;
      },
      error: (error) => {
        this._toaster.error('Error generating Excel:', error);
        this.isLoading = false;
      }
    });
  }

  public filterDates(dates: { startDate: Date | null, endDate: Date | null }): void {
    if (dates.startDate && dates.endDate) {
      this.start = moment.utc(dates.startDate).format('YYYY-MM-DD');
      this.end = moment.utc(dates.endDate).format('YYYY-MM-DD');
    }
  }

  public onPageChange(page: number): void {
    this.page = page;
    this.updateDisplayedApplications();
  }

  updateDisplayedApplications(): void {
    const startIndex = (this.page - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;

    if (endIndex >= this.applications.length && this.applications.length < this.totalApplications && !this.isLoading) {
      this.loadApplications();
    }
  }

  public getStatusBadgeClass(status: string | null): string {
    switch (status) {
      case 'ACTIVO':
        return 'status-active';
      case 'FINALIZADO':
        return 'status-finalized';
      case 'INACTIVO':
        return 'status-inactive';
      case 'RETROTRAIDO POR ERROR DE USUARIO':
        return 'status-error';
      case 'ESTADO-020':
        return 'status-020';
      default:
        return 'status-unknown';
    }
  }
  
  public filterCategories(value: string): void {
    if (!value) {
      this.filteredCategories = this.categories;
      return;
    }
    this.filteredCategories = this.categories.filter(category =>
      category.toLowerCase().includes(value.toLowerCase())
    );
  }
  
  public filterProcedureClasses(value: string): void {
    if (!value) {
      this.filteredProcedureClasses = this.procedureClasses;
      return;
    }
    this.filteredProcedureClasses = this.procedureClasses.filter(procedureClass => 
      procedureClass.toLowerCase().includes(value.toLowerCase())
    );
  }

  public getRenewalText(isAutomatic: boolean): string {
    return isAutomatic ? 'Automática' : 'Manual';
  }

  public getRenewalClass(isAutomatic: boolean): string {
    return isAutomatic ? 'renewal-automatic' : 'renewal-manual';
  }
}
