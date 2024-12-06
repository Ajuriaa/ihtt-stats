import { Component, OnInit } from '@angular/core';
import { DateFilterComponent, LoadingComponent } from "../../../shared";
import moment from 'moment';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatOptionModule } from '@angular/material/core';
import {MatSelectModule} from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { DashboardQueries } from '../../services';
import { Certificate } from '../../interfaces';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    DateFilterComponent, MatFormFieldModule, MatOptionModule, MatSelectModule, CommonModule, FormsModule,
    MatCardModule, LoadingComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit{
  public loading = false;
  public certificates: Certificate[] = [];
  public filteredCertificates: Certificate[] = [];
  public totalPaid = 0;
  public totalOwed = 0;
  public upcomingExpirations = 0;
  public start = moment.utc().startOf('month').format('YYYY-MM-DD');
  public end = moment.utc().format('YYYY-MM-DD');
  public documentStatuses: string[] = ['EN MOVIMIENTO', 'INVENTARIADO', 'TRASLADADO'];
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
  public selectedDocumentStatus = '';
  public selectedNoticeStatus = '';

  constructor(
    private dashboardQueries: DashboardQueries
  ) {}

  ngOnInit(): void {
    this.fetchDashboard();
  }

  public filterDates(dates: { startDate: Date | null, endDate: Date | null }): void {
    if(dates.startDate && dates.endDate) {
      this.start = moment.utc(dates.startDate).format('YYYY-MM-DD');
      this.end = moment.utc(dates.endDate).format('YYYY-MM-DD');
      this.filterCertificates();
    }
  }
// Method to apply filters
  public applyFilter(filterType: string, value: string): void {
    switch (filterType) {
      case 'modality':
        this.selectedModality = value || '';
        break;
      case 'department':
        this.selectedDepartment = value || '';
        break;
      case 'documentStatus':
        this.selectedDocumentStatus = value || '';
        break;
      case 'noticeStatus':
        this.selectedNoticeStatus = value || '';
        break;
    }
    this.filterCertificates();
  }

  private filterCertificates(): void {
    this.filteredCertificates = this.certificates.filter(cert => {
      return (
        (!this.selectedModality || cert.modality === this.selectedModality) &&
        (!this.selectedDepartment || cert.department === this.selectedDepartment) &&
        (!this.selectedDocumentStatus || cert.documentStatus === this.selectedDocumentStatus) &&
        (!this.selectedNoticeStatus || cert.noticeStatusDescription === this.selectedNoticeStatus) &&
        moment(cert.paymentDate).isBetween(this.start, this.end)
      );
    });
    this.calculateKPIs();
  }

  // Fetch data from API and update UI
  public fetchDashboard(): void {
    this.loading = true;
    // Call API to fetch data
    // Update UI with data
    this.dashboardQueries.getCertificates({}).subscribe((response) => {
      this.certificates = response.data;
      this.filteredCertificates = this.certificates;
      this.filterCertificates();
      this.calculateKPIs();
      this.loading = false;
    });
  }

  private calculateKPIs(): void {
    this.totalPaid = this.filteredCertificates
      .filter(cert => cert.paymentDate !== null)
      .reduce((sum, cert) => sum + (cert.totalNoticeAmount || 0), 0);

    this.totalOwed = this.certificates
      .filter(cert => cert.noticeStatusDescription === 'ACTIVO')
      .reduce((sum, cert) => sum + (cert.totalNoticeAmount || 0), 0);

    this.upcomingExpirations = this.certificates.filter(cert => {
      const certExpDate = cert.certificateExpirationDate ? moment(cert.certificateExpirationDate) : null;
      const permExpDate = cert.permissionExpirationDate ? moment(cert.permissionExpirationDate) : null;

      const now = moment(); // Fecha actual
      const threeMonthsFromNow = moment().add(3, 'months'); // Fecha actual + 3 meses

      return (
        (certExpDate && certExpDate.isBetween(now, threeMonthsFromNow, 'day', '[]')) ||
        (permExpDate && permExpDate.isBetween(now, threeMonthsFromNow, 'day', '[]'))
      );
    }).length;
  }
}
