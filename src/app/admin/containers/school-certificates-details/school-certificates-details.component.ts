import { Component } from '@angular/core';
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
import { ExcelHelper, PDFHelper } from 'src/app/core/helpers';
import { ReportesPDFService } from '../../../reports/services/reportes-pdf.service';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

const COLUMNS = ['preRegistrationCode', 'dealerName', 'amount', 'noticeStatus', 'transportType', 'categoryDescription', 'type', 'issueDate', 'deliveryDate'];

@Component({
  selector: 'app-school-certificates-details',
  standalone: true,
  imports: [
    NgxPaginationModule, MatTableModule, CommonModule, NoResultComponent,
    DateFilterComponent, MatFormFieldModule, MatOptionModule, MatSelectModule,
    FormsModule, PrimaryButtonComponent, CommonModule, MatInputModule, LoadingComponent,
    MatAutocompleteModule
  ],
  templateUrl: './school-certificates-details.component.html',
  styleUrl: './school-certificates-details.component.scss'
})
export class SchoolCertificatesDetailsComponent {
  public schoolCertificates: any[] = [];
  public page = 1;
  public backendPage = 1;
  public itemsPerPage = 9;
  public totalCertificates = 0;
  public isLoading = false;
  public displayedColumns = COLUMNS;
  public start = moment.utc().startOf('month').format('YYYY-MM-DD');
  public end = moment.utc().format('YYYY-MM-DD');
  public dateType = 'issueDate';
  public globalParams = {};

  // Filter properties
  public selectedNoticeStatus = '';
  public selectedTransportType = '';
  public selectedCategory = '';
  public selectedType = '';
  public searchTerm = '';

  // Filter options
  public noticeStatuses: string[] = ['PAGADO', 'ACTIVO', 'ANULADO'];
  public transportTypes: string[] = ['CARGA', 'PASAJEROS'];
  public categories: string[] = [
    'VEHICULO DE CARGA NO ARTICULADA',
    'BUS URBANO E INTERURBANO',
    'VEHICULO DE CARGA ARTICULADA',
    'TAXI',
    'VEHICULO DE CARGA ESPECIALIZADA',
    'BUS INTERNACIONAL',
    'BUS ESCOLAR',
    'INSTRUCTOR PRÁCTICO',
    'INSTRUCTOR TEÓRICO',
    'MOTOTAXI',
    'VEHICULO DE CARGA NO ARTICULADA MAYOR A 7,500 kg',
    'BUS URBANO E INTERURBANO HASTA 30 PASAJEROS'
  ];
  public types: string[] = [
    'HASTA 7500 KG',
    'MAYOR A 7500 KG',
    'MAYOR O IGUAL A 26 PASAJEROS',
    'HASTA 25 PASAJEROS',
    'ARTICULADA',
    'NO ARTICULADA HASTA 7500 KG',
    'TAXI',
    'MAYOR A 30 PASAJEROS',
    'HASTA 30 PASAJEROS',
    'MOTOTAXI'
  ];

  // Autocomplete for categories
  public filteredCategories: string[] = this.categories;

  constructor(
    private dashboardService: DashboardQueries,
    private _toaster: ToastrService,
    private pdfHelper: PDFHelper,
    private excelHelper: ExcelHelper,
    private reportesPDFService: ReportesPDFService
  ) {}

  get startDateObject(): Date {
    return new Date(this.start);
  }

  get endDateObject(): Date {
    return new Date(this.end);
  }

  ngOnInit(): void {
    this.loadSchoolCertificates();
  }

  public filterCategories(value: string): void {
    if (!value) {
      this.filteredCategories = this.categories;
      return;
    }
    
    const filterValue = value.toLowerCase();
    this.filteredCategories = this.categories.filter(category =>
      category.toLowerCase().includes(filterValue)
    );
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
      dateType: this.dateType || undefined,
      noticeStatus: this.selectedNoticeStatus || undefined,
      transportType: this.selectedTransportType || undefined,
      categoryDescription: this.selectedCategory || undefined,
      type: this.selectedType || undefined,
      searchTerm: this.searchTerm || undefined
    };

    // Clean undefined parameters
    const cleanedParams = Object.fromEntries(
      Object.entries(params).filter(([_, value]) => value !== undefined)
    );

    this.dashboardService.getSchoolCertificates(cleanedParams).subscribe({
      next: (response) => {
        this.schoolCertificates = response.data;
        this.totalCertificates = response.total;
        this.globalParams = params;
        this.updateDisplayedCertificates();
        this.isLoading = false;
      },
      error: (error) => {
        this._toaster.error('Error loading school certificates:', error);
        this.isLoading = false;
      }
    });
  }

  public generatePDF(): void {
    this.isLoading = true;
    const params = {
      startDate: this.start || undefined,
      endDate: this.end || undefined,
      dateType: this.dateType || undefined,
      noticeStatus: this.selectedNoticeStatus || undefined,
      transportType: this.selectedTransportType || undefined,
      categoryDescription: this.selectedCategory || undefined,
      type: this.selectedType || undefined,
      searchTerm: this.searchTerm || undefined
    };

    const cleanedParams = Object.fromEntries(
      Object.entries(params).filter(([_, value]) => value !== undefined)
    );

    this.dashboardService.getSchoolCertificates(cleanedParams).subscribe({
      next: (response) => {
        const allCertificates = response.data || [];
        if (allCertificates.length === 0) {
          this._toaster.warning('No hay datos para generar el PDF');
          this.isLoading = false;
          return;
        }

        const parametros = {
          fechaInicio: this.start || undefined,
          fechaFin: this.end || undefined,
          tipoFecha: this.dateType,
          filtroEstado: this.selectedNoticeStatus || undefined,
          filtroTransporte: this.selectedTransportType || undefined,
          filtroCategoria: this.selectedCategory || undefined,
          filtroTipo: this.selectedType || undefined,
          busqueda: this.searchTerm || undefined
        };

        this.reportesPDFService.generarReporteEscuelasLista(allCertificates, parametros);
        this._toaster.success(`PDF generado: ${allCertificates.length} certificados escolares`);
        this.isLoading = false;
      },
      error: (error) => {
        this._toaster.error('Error al generar PDF');
        console.error('PDF generation error:', error);
        this.isLoading = false;
      }
    });
  }

  public generateExcel(): void {
    this.isLoading = true;
    const params = {
      startDate: this.start || undefined,
      endDate: this.end || undefined,
      dateType: this.dateType || undefined,
      noticeStatus: this.selectedNoticeStatus || undefined,
      transportType: this.selectedTransportType || undefined,
      categoryDescription: this.selectedCategory || undefined,
      type: this.selectedType || undefined,
      searchTerm: this.searchTerm || undefined
    };

    const cleanedParams = Object.fromEntries(
      Object.entries(params).filter(([_, value]) => value !== undefined)
    );

    this.dashboardService.getSchoolCertificates(cleanedParams).subscribe({
      next: (response) => {
        const allCertificates = response.data || [];
        if (allCertificates.length === 0) {
          this._toaster.warning('No hay datos para exportar');
          this.isLoading = false;
          return;
        }

        const fileName = `certificados-escolares-detalles-${moment().format('YYYY-MM-DD-HHmm')}.xlsx`;
        this.excelHelper.exportSchoolCertificatesToExcel(allCertificates, fileName);
        this._toaster.success(`Excel generado: ${allCertificates.length} registros exportados`);
        this.isLoading = false;
      },
      error: (error) => {
        this._toaster.error('Error al exportar a Excel');
        console.error('Excel export error:', error);
        this.isLoading = false;
      }
    });
  }

  public filterDates(dates: { startDate: Date | null, endDate: Date | null, dateType?: string }): void {
    if (dates.startDate && dates.endDate) {
      this.start = moment.utc(dates.startDate).format('YYYY-MM-DD');
      this.end = moment.utc(dates.endDate).format('YYYY-MM-DD');
    }
    if (dates.dateType) {
      this.dateType = dates.dateType;
    }
  }

  public applyFilter(filterType: string, value: string): void {
    switch (filterType) {
      case 'noticeStatus':
        this.selectedNoticeStatus = value || '';
        break;
      case 'transportType':
        this.selectedTransportType = value || '';
        break;
      case 'categoryDescription':
        this.selectedCategory = value || '';
        break;
      case 'type':
        this.selectedType = value || '';
        break;
      case 'searchTerm':
        this.searchTerm = value || '';
        break;
    }
  }

  public getDate(date: string | null): string {
    if (!date) {
      return 'NO DISPONIBLE';
    }
    return moment.utc(date).format('DD/MM/YYYY');
  }

  public loadSchoolCertificates(): void {
    this.isLoading = true;
    const extraParams = this.globalParams;
    const params = {
      paginated: 'true',
      page: this.backendPage,
    };

    const cleanedParams = Object.fromEntries(
      Object.entries({ ...params, ...extraParams }).filter(([_, value]) => value !== undefined)
    );

    this.dashboardService.getSchoolCertificates(cleanedParams).subscribe({
      next: (response) => {
        this.schoolCertificates.push(...response.data);
        this.totalCertificates = response.total;
        this.updateDisplayedCertificates();
        this.isLoading = false;

        if (this.schoolCertificates.length < this.totalCertificates) {
          this.backendPage++;
        }
      },
      error: (error) => {
        console.error('Error loading school certificates:', error);
        this.isLoading = false;
      },
    });
  }

  updateDisplayedCertificates(): void {
    const startIndex = (this.page - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;

    if (endIndex >= this.schoolCertificates.length && this.schoolCertificates.length < this.totalCertificates && !this.isLoading) {
      this.loadSchoolCertificates();
    }
  }

  onPageChange(page: number): void {
    this.page = page;
    this.updateDisplayedCertificates();
  }

  public formatCurrency(amount: number | null): string {
    if (!amount) return 'L. 0.00';
    return `L. ${amount.toLocaleString('es-HN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
}
