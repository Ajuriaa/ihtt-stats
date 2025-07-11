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

const COLUMNS = ['receivedDate', 'applicationId', 'applicantName', 'companyName', 'fileStatus', 'procedureTypeDescription', 'categoryDescription', 'isAutomaticRenewal', 'cityCode'];

@Component({
  selector: 'app-applications-details',
  standalone: true,
  imports: [
    NgxPaginationModule, MatTableModule, CommonModule, NoResultComponent,
    DateFilterComponent, MatFormFieldModule, MatOptionModule, MatSelectModule,
    FormsModule, PrimaryButtonComponent, CommonModule, MatInputModule, LoadingComponent
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

  public fileStatuses: string[] = ['PENDIENTE', 'APROBADO', 'RECHAZADO', 'EN PROCESO'];
  public procedureTypes: string[] = [
    'CERTIFICADO DE OPERACION',
    'PERMISO DE EXPLOTACION',
    'RENOVACION DE CERTIFICADO',
    'RENOVACION DE PERMISO',
    'CAMBIO DE MODALIDAD',
    'CAMBIO DE RUTA'
  ];
  public categories: string[] = [
    'TRANSPORTE PUBLICO',
    'TRANSPORTE PRIVADO',
    'CARGA',
    'ESPECIAL',
    'EJECUTIVO'
  ];
  public renewalStates = [
    { value: true, label: 'Sí' },
    { value: false, label: 'No' }
  ];

  public selectedFileStatus = '';
  public selectedProcedureType = '';
  public selectedCategory = '';
  public selectedRenewalState: boolean | null = null;

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
      procedureType: this.selectedProcedureType || undefined,
      categoryId: this.selectedCategory || undefined,
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
      procedureType: this.selectedProcedureType || undefined,
      categoryId: this.selectedCategory || undefined,
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
      case 'APROBADO':
        return 'status-approved';
      case 'RECHAZADO':
        return 'status-rejected';
      case 'PENDIENTE':
        return 'status-pending';
      case 'EN PROCESO':
        return 'status-processing';
      default:
        return 'status-unknown';
    }
  }

  public getRenewalText(isAutomatic: boolean): string {
    return isAutomatic ? 'Automática' : 'Manual';
  }

  public getRenewalClass(isAutomatic: boolean): string {
    return isAutomatic ? 'renewal-automatic' : 'renewal-manual';
  }
}
