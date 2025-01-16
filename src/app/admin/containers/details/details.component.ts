import { Component } from '@angular/core';
import { DashboardQueries } from '../../services';
import { NgxPaginationModule } from 'ngx-pagination';
import { MatTableModule } from '@angular/material/table';
import moment from 'moment';
import { CommonModule } from '@angular/common';
import { DateFilterComponent, LoadingComponent, NoResultComponent, PrimaryButtonComponent } from 'src/app/shared';
import { Certificate } from '../../interfaces';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ExcelHelper, PDFHelper } from 'src/app/core/helpers';
import { MatInputModule } from '@angular/material/input';

const COLUMNS = ['certificateExpirationDate', 'permissionExpirationDate', 'paymentDate', 'areaName', 'department', 'coStatus', 'noticeStatusDescription', 'noticeCode', 'totalNoticeAmount', 'document'];
@Component({
  selector: 'app-details',
  standalone: true,
  imports: [
    NgxPaginationModule, MatTableModule, CommonModule, NoResultComponent,
    DateFilterComponent, MatFormFieldModule, MatOptionModule, MatSelectModule,
    FormsModule, PrimaryButtonComponent, CommonModule, MatInputModule, LoadingComponent
  ],
  templateUrl: './details.component.html',
  styleUrl: './details.component.scss'
})
export class DetailsComponent {
  public certificates: Certificate[] = []; // Almacena los certificados cargados
  public page = 1; // Página actual para la tabla (frontend)
  public backendPage = 1; // Página actual para el backend
  public itemsPerPage =  9; // Elementos por página en la tabla
  public totalCertificates = 0; // Total de certificados disponibles en el backend
  public isLoading = false; // Indicador de carga
  public displayedColumns = COLUMNS; // Columnas a mostrar en la tabla
  public start = moment.utc().startOf('month').format('YYYY-MM-DD');
  public selectedStatus = '';
  public statuses = ["ENTREGADO", "PENDIENTE", "IMPRESION", "DENEGADO"];
  public end = moment.utc().format('YYYY-MM-DD');
  public globalParams = {};
  public rtn = '';
  public noticeStatuses: string[] = ['ACTIVO', 'ANULADO', 'NO TIENE', 'PAGADO', 'SIN PAGO SEGUN DECRETO #60-2019'];
  public modalities: string[] = [
    'BUS INTERNACIONAL', 'BUS INTERURBANO', 'BUS URBANO',
    'CARGA ESPECIALIZADA', 'CARGA NO ESPECIALIZADA', 'CARGA PRIVADA ESPECIALIZADA',
    'ESPECIAL CARGA NO ESPECIALIZADA', 'ESPECIAL EVENTUAL PASAJEROS',
    'ESPECIAL PASAJEROS', 'MOTOTAXI', 'PRIVADO CARGA',
    'SERVICIO EJECUTIVO AEREOPORTUARIO', 'TAXI'
  ];
  public departments: string[] = [
    'ATLANTIDA', 'CHOLUTECA', 'COLON', 'COMAYAGUA', 'COPAN',
    'CORTES', 'EL PARAISO', 'FRANCISCO MORAZAN', 'GRACIAS A DIOS',
    'INTIBUCA', 'ISLAS DE LA BAHIA', 'LA PAZ', 'LEMPIRA', 'NACIONAL',
    'OCOTEPEQUE', 'OLANCHO', 'SANTA BARBARA', 'VALLE', 'YORO'
  ];
  public selectedModality = '';
  public selectedDepartment = '';
  public selectedNoticeStatus = '';

  constructor(
    private certificatesService: DashboardQueries,
    private _toaster: ToastrService,
    private pdfHelper: PDFHelper,
    private excelHelper: ExcelHelper
  ) {}

  ngOnInit(): void {
    this.loadCertificates();
  }

  public generatePDF(): void {
    this.pdfHelper.generateCertificatePDF(this.certificates, this.globalParams);
  }

  public onSubmit(): void {
    this.isLoading = true;
    this.page = 1;
    this.backendPage = 1;

    const params = {
      paginated: 'true',
      page: this.backendPage || undefined,
      startDate: this.start || undefined,
      endDate: this.end || undefined,
      modality: this.selectedModality || undefined,
      department: this.selectedDepartment || undefined,
      noticeStatus: this.selectedNoticeStatus || undefined,
      coStatus: this.selectedStatus || undefined,
      rtn: this.rtn !== '' ? this.rtn : undefined
    };

    // Limpiar parámetros: elimina claves con valores undefined
    const cleanedParams = Object.fromEntries(
      Object.entries(params).filter(([_, value]) => value !== undefined)
    );

    this.certificatesService.getCertificates(cleanedParams).subscribe({
      next: (response) => {
        this.certificates = response.data;
        this.totalCertificates = response.total;
        this.globalParams = params;
        this.updateDisplayedCertificates();
        this.isLoading = false;
      },
      error: (error) => {
        this._toaster.error('Error loading certificates:', error);
        this.isLoading = false;
      }
    });
  }

  public goToNoticeFile(id: string | null, amount: number): void {
    if (!id || !amount) {
      return;
    }
    window.open(`https://satt.transporte.gob.hn:90/api_rep.php?action=get-facturaPdf&nu=${id}&va=1`);
  }

  public generateExcel(): void {
    this.isLoading = true;
    const params = {
      startDate: this.start || undefined,
      endDate: this.end || undefined,
      modality: this.selectedModality || undefined,
      department: this.selectedDepartment || undefined,
      noticeStatus: this.selectedNoticeStatus || undefined,
      coStatus: this.selectedStatus || undefined,
      rtn: this.rtn !== '' ? this.rtn : undefined
    };

    // Limpiar parámetros: elimina claves con valores undefined
    const cleanedParams = Object.fromEntries(
      Object.entries(params).filter(([_, value]) => value !== undefined)
    );

    const filtersString = Object.entries(cleanedParams)
    .map(([key, value]) => `${value}`)
    .join('_');

    this.certificatesService.getCertificates(cleanedParams).subscribe({
      next: (response) => {
        this.excelHelper.exportCertificatesToExcel(response.data, `certificados y permisos-${filtersString}.xlsx`);
        this.isLoading = false;
      },
      error: (error) => {
        this._toaster.error('Error loading certificates:', error);
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

  public applyFilter(filterType: string, value: string): void {
    switch (filterType) {
      case 'modality':
        this.selectedModality = value || '';
        break;
      case 'department':
        this.selectedDepartment = value || '';
        break;
      case 'noticeStatus':
        this.selectedNoticeStatus = value || '';
        break;
      case 'coStatus':
        this.selectedStatus = value || '';
        break;
    }
  }

  public getDate(date: string | null): string {
    if (!date ) {
      return 'NO DISPONIBLE';
    }
    return moment.utc(date).format('DD/MM/YYYY');
  }

  public loadCertificates(): void {
    this.isLoading = true;
    const extraParams = this.globalParams;
    const params = {
      paginated: 'true',
      page: this.backendPage,
    };

    // Unir parámetros adicionales
    const cleanedParams = Object.fromEntries(
      Object.entries({ ...params, ...extraParams }).filter(([_, value]) => value !== undefined)
    );

    this.certificatesService.getCertificates(cleanedParams).subscribe({
      next: (response) => {
        this.certificates.push(...response.data); // Agregar nuevos certificados
        this.totalCertificates = response.total; // Total de certificados en el backend
        this.updateDisplayedCertificates(); // Actualizar los datos mostrados en la tabla
        this.isLoading = false;

        // Incrementar la página del backend solo si hay más registros
        if (this.certificates.length < this.totalCertificates) {
          this.backendPage++;
        }
      },
      error: (error) => {
        console.error('Error loading certificates:', error);
        this.isLoading = false;
      },
    });
  }

  updateDisplayedCertificates(): void {
    const startIndex = (this.page - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;

    // Si alcanzamos el final de los registros cargados, solicitar más datos del backend
    if (endIndex >= this.certificates.length && this.certificates.length < this.totalCertificates && !this.isLoading) {
      this.loadCertificates();
    }
  }

  onPageChange(page: number): void {
    this.page = page;
    this.updateDisplayedCertificates();
  }
}
