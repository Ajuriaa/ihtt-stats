import { Component } from '@angular/core';
import { DashboardQueries } from '../../services';
import { NgxPaginationModule } from 'ngx-pagination';
import { MatTableModule } from '@angular/material/table';
import moment from 'moment';
import { CommonModule } from '@angular/common';
import { DateFilterComponent, LoadingComponent, NoResultComponent, PrimaryButtonComponent } from 'src/app/shared';
import { Fine } from '../../interfaces';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ExcelHelper, PDFHelper } from 'src/app/core/helpers';

const COLUMNS = [
  'fineId', 'totalAmount', 'fineStatus', 'date', 'department', 'region', 'plate', 'rtn'
];
@Component({
  selector: 'app-fines-details',
  standalone: true,
  imports: [
    NgxPaginationModule, MatTableModule, CommonModule, NoResultComponent,
    DateFilterComponent, MatFormFieldModule, MatOptionModule, MatSelectModule,
    FormsModule, PrimaryButtonComponent, LoadingComponent
  ],
  templateUrl: './fines-details.component.html',
  styleUrl: './fines-details.component.scss'
})
export class FinesDetailsComponent {
  public fines: Fine[] = [];
  public page = 1;
  public backendPage = 1;
  public itemsPerPage = 9;
  public totalFines = 0;
  public isLoading = false;
  public displayedColumns = COLUMNS;
  public start = moment.utc().startOf('month').format('YYYY-MM-DD');
  public end = moment.utc().format('YYYY-MM-DD');
  public selectedStatus = '';
  public statuses = ['PAGADA', 'ACTIVA', 'ANULADA'];
  public departments: string[] = [
    'ATLÁNTIDA', 'COLON', 'YORO', 'OLANCHO',
    'ISLAS DE LA BAHÍA', 'CORTES', 'FRANCISCO MORAZÁN',
    'VALLE', 'COPAN', 'LEMPIRA', 'SANTA BARBARÁ', 'OCOTEPEQUE',
    'CHOLUTECA', 'COMAYAGUA', 'EL PARAÍSO', 'LA PAZ', 'INTIBUCA'
  ];
  public regions = [
    'REGIONAL DEL ATLANTICO, OFICINA PRINCIPAL, LA CEIBA',
    'REGIONAL NOR OCCIDENTAL, OFICINA PRINCIPAL, SAN PEDRO SULA',
    'REGIONAL OCCIDENTE, SANTA ROSA DE COPAN',
    'REGIONAL SUR, OFICINA PRINCIPAL, CHOLUTECA',
    'TEGUCIGALPA, OFICINA PRINCIPAL'
  ];
  public selectedDepartment = '';
  public selectedRegion = '';
  public globalParams = {};

  constructor(
    private finesService: DashboardQueries,
    private _toaster: ToastrService,
    private pdfHelper: PDFHelper,
    private excelHelper: ExcelHelper
  ) {}

  ngOnInit(): void {
    this.loadFines();
  }

  public generatePDF(): void {
    this.pdfHelper.generateFinePDF(this.fines, this.globalParams);
  }

  public generateExcel(): void {
    this.isLoading = true;
    const params = {
      startDate: this.start || undefined,
      endDate: this.end || undefined,
      status: this.selectedStatus || undefined,
      department: this.selectedDepartment || undefined,
      region: this.selectedRegion || undefined
    };

    const cleanedParams = Object.fromEntries(
      Object.entries(params).filter(([_, value]) => value !== undefined)
    );

    this.finesService.getFines(cleanedParams).subscribe({
      next: (response) => {
        this.excelHelper.exportFinesToExcel(response.data);
        this.isLoading = false;
      },
      error: (error) => {
        this._toaster.error('Error loading fines:', error);
        this.isLoading = false;
      }
    });
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
      status: this.selectedStatus || undefined,
      department: this.selectedDepartment || undefined,
      region: this.selectedRegion || undefined
    };
    this.globalParams = params;

    const cleanedParams = Object.fromEntries(
      Object.entries(params).filter(([_, value]) => value !== undefined)
    );

    this.finesService.getFines(cleanedParams).subscribe({
      next: (response) => {
        this.fines = response.data;
        this.totalFines = response.total;
        this.updateDisplayedFines();
        this.isLoading = false;
      },
      error: (error) => {
        this._toaster.error('Error loading fines:', error);
        this.isLoading = false;
      }
    });
  }

  public getDate(date: string | null): string {
    if (!date ) {
      return 'NO DISPONIBLE';
    }
    return moment.utc(date).format('DD/MM/YYYY');
  }

  public filterDates(dates: { startDate: Date | null, endDate: Date | null }): void {
    if (dates.startDate && dates.endDate) {
      this.start = moment.utc(dates.startDate).format('YYYY-MM-DD');
      this.end = moment.utc(dates.endDate).format('YYYY-MM-DD');
    }
  }

  public applyFilter(filterType: string, value: string): void {
    switch (filterType) {
      case 'fineStatus':
        this.selectedStatus = value || '';
        break;
      case 'department':
        this.selectedDepartment = value || '';
        break;
      case 'region':
        this.selectedRegion = value || '';
        break;
    }
  }

  public loadFines(): void {
    this.isLoading = true;

    const extraParams = this.globalParams;
    const params = {
      paginated: 'true',
      page: this.backendPage
    };

    const cleanedParams = Object.fromEntries(
      Object.entries({ ...params, ...extraParams }).filter(([_, value]) => value !== undefined)
    );

    this.finesService.getFines(cleanedParams).subscribe({
      next: (response) => {
        this.fines.push(...response.data);
        this.totalFines = response.total;
        this.updateDisplayedFines();
        this.isLoading = false;

        if (this.fines.length < this.totalFines) {
          this.backendPage++;
        }
      },
      error: (error) => {
        console.error('Error loading fines:', error);
        this.isLoading = false;
      },
    });
  }

  updateDisplayedFines(): void {
    const startIndex = (this.page - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;

    if (endIndex >= this.fines.length && this.fines.length < this.totalFines && !this.isLoading) {
      this.loadFines();
    }
  }

  onPageChange(page: number): void {
    this.page = page;
    this.updateDisplayedFines();
  }
}
