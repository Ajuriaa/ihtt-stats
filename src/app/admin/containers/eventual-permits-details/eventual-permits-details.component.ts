import { Component, OnInit } from '@angular/core';
import { DashboardQueries } from '../../services';
import { NgxPaginationModule } from 'ngx-pagination';
import { MatTableModule } from '@angular/material/table';
import moment from 'moment';
import { CommonModule } from '@angular/common';
import { DateFilterComponent, LoadingComponent, NoResultComponent, PrimaryButtonComponent } from 'src/app/shared';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { MatInputModule } from '@angular/material/input';
import { ExcelHelper, PDFHelper } from 'src/app/core/helpers';

const COLUMNS = ['systemDate', 'permitCode', 'applicantName', 'rtn', 'serviceTypeDescription', 'permitStatus', 'regionalOffice', 'amount', 'noticeCode', 'bankDescription'];

@Component({
  selector: 'app-eventual-permits-details',
  standalone: true,
  imports: [
    NgxPaginationModule, MatTableModule, CommonModule, NoResultComponent,
    DateFilterComponent, MatFormFieldModule, MatOptionModule, MatSelectModule,
    FormsModule, PrimaryButtonComponent, CommonModule, MatInputModule, LoadingComponent
  ],
  templateUrl: './eventual-permits-details.component.html',
  styleUrl: './eventual-permits-details.component.scss'
})
export class EventualPermitsDetailsComponent implements OnInit {
  public permits: any[] = [];
  public page = 1;
  public itemsPerPage = 10;
  public isLoading = false;
  public displayedColumns = COLUMNS;
  public start = moment.utc().startOf('month').format('YYYY-MM-DD');
  public end = moment.utc().format('YYYY-MM-DD');
  public dateType = 'system';
  public rtn = '';
  public applicantName = '';
  public permitStatuses: string[] = [
    'Entregado', 
    'Pendiente Pago en Banco', 
    'Pagado en Banco - Entregado'
  ];
  public serviceTypes: string[] = [
    'No Especificado',
    'PASAJEROS',
    'CARGA'
  ];
  public regionalOffices: string[] = [
    'Creado desde portal',
    'TEGUCIGALPA, OFICINA PRINCIPAL',
    'REGIONAL NOR OCCIDENTAL, OFICINA PRINCIPAL, SAN PEDRO SULA',
    'REGIONAL SUR, OFICINA PRINCIPAL, CHOLUTECA',
    'REGIONAL DEL ATLANTICO, OFICINA PRINCIPAL, LA CEIBA'
  ];
  public signatureTypes: string[] = [
    'Con Firma Digital',
    'Valido Solo con firma Fisica'
  ];
  public petiTypes: string[] = [
    'No Aplica',
    'TRANSPORTE DE MIGRANTES',
    'BUS INTERNACIONAL CON DESTINO/SALIDA HONDURAS'
  ];
  public creationOrigins: string[] = [
    'SIPEV (Sistema de Permisos Eventuales)',
    'SITRAP (Portal Transportista)',
    'LLAMADA TELEFONICA'
  ];
  public selectedPermitStatus = '';
  public selectedServiceType = '';
  public selectedRegionalOffice = '';
  public selectedSignatureType = '';
  public selectedPetiType = '';
  public selectedCreationOrigin = '';

  constructor(
    private permitService: DashboardQueries,
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
    this.onSubmit();
  }

  public onSubmit(): void {
    this.isLoading = true;
    this.page = 1;

    const params = {
      startDate: this.start || undefined,
      endDate: this.end || undefined,
      dateType: this.dateType || undefined,
      permitStatus: this.selectedPermitStatus || undefined,
      serviceType: this.selectedServiceType || undefined,
      regionalOffice: this.selectedRegionalOffice || undefined,
      signatureType: this.selectedSignatureType || undefined,
      petiType: this.selectedPetiType || undefined,
      creationOrigin: this.selectedCreationOrigin || undefined,
      rtn: this.rtn !== '' ? this.rtn : undefined,
      applicantName: this.applicantName !== '' ? this.applicantName : undefined
    };

    const cleanedParams = Object.fromEntries(
      Object.entries(params).filter(([_, value]) => value !== undefined)
    );

    this.permitService.getEventualPermits(cleanedParams).subscribe({
      next: (response) => {
        this.permits = response.data;
        this.isLoading = false;
      },
      error: (error) => {
        this._toaster.error('Error loading permits:', error);
        this.isLoading = false;
      }
    });
  }

  public generatePDF(): void {
    this.pdfHelper.generateEventualPermitsPDF(this.permits, {});
  }

  public generateExcel(): void {
    this.excelHelper.exportEventualPermitsToExcel(this.permits, 'permisos-eventuales.xlsx');
  }

  public filterDates(dates: { startDate: Date | null, endDate: Date | null, dateType?: string }): void {
    if (dates.startDate && dates.endDate) {
      this.start = moment.utc(dates.startDate).format('YYYY-MM-DD');
      this.end = moment.utc(dates.endDate).format('YYYY-MM-DD');
      // For eventual permits, we always use 'system' dateType regardless of what the date filter sends
      this.dateType = 'system';
    }
  }

  public applyFilter(filterType: string, value: string): void {
    switch (filterType) {
      case 'permitStatus':
        this.selectedPermitStatus = value || '';
        break;
      case 'serviceType':
        this.selectedServiceType = value || '';
        break;
      case 'regionalOffice':
        this.selectedRegionalOffice = value || '';
        break;
      case 'signatureType':
        this.selectedSignatureType = value || '';
        break;
      case 'petiType':
        this.selectedPetiType = value || '';
        break;
      case 'creationOrigin':
        this.selectedCreationOrigin = value || '';
        break;
    }
  }

  public getDate(date: string | null): string {
    if (!date) {
      return 'NO DISPONIBLE';
    }
    return moment.utc(date).format('DD/MM/YYYY');
  }

  onPageChange(page: number): void {
    this.page = page;
  }

  public formatCurrency(amount: number | null): string {
    if (!amount) return 'L. 0.00';
    return `L. ${amount.toLocaleString('es-HN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  public getStatusColor(status: string | null): string {
    switch (status) {
      case 'ACTIVO':
        return 'status-active';
      case 'PROCESADO':
        return 'status-processed';
      case 'ANULADO':
        return 'status-cancelled';
      case 'PENDIENTE':
        return 'status-pending';
      default:
        return 'status-default';
    }
  }

  public goToNoticeFile(id: string | null, amount: number): void {
    if (!id || !amount) {
      return;
    }
    window.open(`https://satt.transporte.gob.hn:90/api_rep.php?action=get-facturaPdf&nu=${id}&va=1`);
  }
}