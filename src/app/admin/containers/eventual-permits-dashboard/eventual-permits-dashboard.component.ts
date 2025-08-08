import { Component, OnInit, OnDestroy } from '@angular/core';
import { DateFilterComponent, LoadingComponent } from "../../../shared";
import moment from 'moment';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { DashboardQueries } from '../../services';
import * as am5 from '@amcharts/amcharts5';
import * as am5percent from "@amcharts/amcharts5/percent";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import * as am5xy from "@amcharts/amcharts5/xy";
import { PrimaryButtonComponent } from "../../../shared/buttons/components/primary-button/primary-button.component";
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-eventual-permits-dashboard',
  standalone: true,
  imports: [
    DateFilterComponent, MatFormFieldModule, MatOptionModule, MatSelectModule, CommonModule, FormsModule,
    MatCardModule, LoadingComponent, PrimaryButtonComponent, MatInputModule, MatIconModule
  ],
  templateUrl: './eventual-permits-dashboard.component.html',
  styleUrls: ['./eventual-permits-dashboard.component.scss']
})
export class EventualPermitsDashboardComponent implements OnInit, OnDestroy {
  public loading = false;
  public analytics: any = null;
  public totalPermits = 0;
  public totalRevenue = 0;
  public totalOwed = 0;
  public activePermits = 0;
  public processedPermits = 0;
  public cancelledPermits = 0;
  public deliveredPermits = 0;
  public pendingPermits = 0;
  // Global KPIs
  public globalTotalPermits = 0;
  public globalTotalRevenue = 0;
  public globalTotalOwed = 0;
  public globalActivePermits = 0;
  public globalProcessedPermits = 0;
  public globalDeliveredPermits = 0;
  public rtn = '';
  public applicantName = '';
  public start = moment.utc().startOf('month').format('YYYY-MM-DD');
  public end = moment.utc().format('YYYY-MM-DD');
  public dateType = 'system';
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
  private chartRoots: am5.Root[] = [];

  constructor(
    private dashboardQueries: DashboardQueries
  ) {}

  ngOnInit(): void {
    this.fetchDashboard();
  }

  ngOnDestroy(): void {
    this.chartRoots.forEach(root => root.dispose());
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

  public fetchDashboard(): void {
    this.loading = true;

    const params: any = {
      startDate: this.start,
      endDate: this.end,
      dateType: this.dateType
    };

    // Add filters only if they have values
    if (this.selectedPermitStatus) params.permitStatus = this.selectedPermitStatus;
    if (this.selectedServiceType) params.serviceType = this.selectedServiceType;
    if (this.selectedRegionalOffice) params.regionalOffice = this.selectedRegionalOffice;
    if (this.selectedSignatureType) params.signatureType = this.selectedSignatureType;
    if (this.selectedPetiType) params.petiType = this.selectedPetiType;
    if (this.selectedCreationOrigin) params.creationOrigin = this.selectedCreationOrigin;
    if (this.rtn) params.rtn = this.rtn;
    if (this.applicantName) params.applicantName = this.applicantName;

    this.dashboardQueries.getEventualPermitsAnalytics(params).subscribe((response) => {
      this.analytics = response;
      this.updateKPIsFromAnalytics();
      this.generateGraphsFromAnalytics();
      this.loading = false;
    });
  }

  public applyFilters(): void {
    this.loading = true;

    const params: any = {
      permitStatus: this.selectedPermitStatus || undefined,
      serviceType: this.selectedServiceType || undefined,
      startDate: this.start || undefined,
      endDate: this.end || undefined,
      dateType: this.dateType || undefined,
      rtn: this.rtn !== '' ? this.rtn : undefined,
      applicantName: this.applicantName !== '' ? this.applicantName : undefined
    };

    const cleanedParams = Object.fromEntries(
      Object.entries(params).filter(([_, value]) => value !== undefined)
    );

    this.dashboardQueries.getEventualPermitsAnalytics(cleanedParams).subscribe((response) => {
      this.analytics = response;
      this.updateKPIsFromAnalytics();
      this.generateGraphsFromAnalytics();
      this.loading = false;
    });
  }

  private updateKPIsFromAnalytics(): void {
    if (!this.analytics?.kpis) return;
    
    // Filtered KPIs (based on current filters)
    this.totalPermits = this.analytics.kpis.filtered.totalPermits;
    this.totalRevenue = this.analytics.kpis.filtered.totalRevenue;
    this.totalOwed = this.analytics.kpis.filtered.totalOwed;
    this.activePermits = this.analytics.kpis.filtered.activePermits;
    this.processedPermits = this.analytics.kpis.filtered.processedPermits;
    this.cancelledPermits = this.analytics.kpis.filtered.cancelledPermits;
    this.deliveredPermits = this.analytics.kpis.filtered.deliveredPermits;
    this.pendingPermits = this.analytics.kpis.filtered.pendingPermits;
    
    // Global KPIs (overall totals regardless of filters)
    this.globalTotalPermits = this.analytics.kpis.global.totalPermits;
    this.globalTotalRevenue = this.analytics.kpis.global.totalRevenue;
    this.globalTotalOwed = this.analytics.kpis.global.totalOwed;
    this.globalActivePermits = this.analytics.kpis.global.activePermits;
    this.globalProcessedPermits = this.analytics.kpis.global.processedPermits;
    this.globalDeliveredPermits = this.analytics.kpis.global.deliveredPermits;
  }

  private generateGraphsFromAnalytics(): void {
    if (!this.analytics?.chartData) return;

    this.chartRoots.forEach(root => root.dispose());
    this.chartRoots = [];

    const { chartData } = this.analytics;

    const statusChartData = Object.entries(chartData.statusDistribution).map(([status, count]) => ({
      category: status,
      value: count as number,
    }));

    const revenueByStatusData = Object.entries(chartData.revenueByStatus).map(([status, amount]) => ({
      category: status,
      value: amount as number,
    }));

    const serviceTypeData = Object.entries(chartData.serviceTypeDistribution).map(([serviceType, count]) => ({
      category: serviceType,
      value: count as number,
    }));

    const monthlyRevenueData = Object.entries(chartData.monthlyRevenue).map(([month, amount]) => ({
      category: month,
      value: amount as number,
    }));

    const regionalOfficeData = Object.entries(chartData.regionalOfficeDistribution).map(([office, count]) => ({
      category: office,
      value: count as number,
    }));

    // Bank distribution data
    const bankData = Object.entries(chartData.bankDistribution || {}).map(([bank, amount]) => ({
      category: bank,
      value: amount as number,
    }));

    this.generatePieChart(statusChartData, "statusDistributionChart", "Distribución por Estado del Permiso");
    this.generatePieChart(bankData, "permitsBankChart", "Distribución por Banco");
    this.generateBarChart(revenueByStatusData, "revenueByStatusChart", "Ingresos por Estado del Permiso");
    this.generateBarChart(serviceTypeData, "serviceTypeChart", "Distribución por Tipo de Servicio");
    this.generateLineChart(monthlyRevenueData, "monthlyRevenueChart", "Tendencia de Ingresos Mensuales");
    this.generateBarChart(regionalOfficeData, "regionalOfficeChart", "Distribución por Oficina Regional");
  }

  private generatePieChart(data: { category: string, value: number }[], containerId: string, title: string): void {
    const root = am5.Root.new(containerId);
    this.chartRoots.push(root);

    root.setThemes([am5themes_Animated.new(root)]);

    const chart = root.container.children.push(
      am5percent.PieChart.new(root, {
        layout: root.verticalLayout,
      })
    );

    chart.children.unshift(
      am5.Label.new(root, {
        text: title,
        fontSize: 20,
        fontWeight: "bold",
        textAlign: "center",
        x: am5.p50,
        centerX: am5.p50,
      })
    );

    const series = chart.series.push(
      am5percent.PieSeries.new(root, {
        valueField: "value",
        categoryField: "category",
      })
    );

    series.data.setAll(data);

    series.slices.template.setAll({
      tooltipText: "{category}: [bold]{value}[/]"
    });

    series.appear(1000, 100);
  }

  private generateBarChart(data: { category: string, value: number }[], containerId: string, title: string): void {
    const root = am5.Root.new(containerId);
    this.chartRoots.push(root);

    root.setThemes([am5themes_Animated.new(root)]);

    const chart = root.container.children.push(
      am5xy.XYChart.new(root, {
        layout: root.verticalLayout,
      })
    );

    chart.children.unshift(
      am5.Label.new(root, {
        text: title,
        fontSize: 20,
        fontWeight: "bold",
        textAlign: "center",
        x: am5.p50,
        centerX: am5.p50,
      })
    );

    const xAxis = chart.xAxes.push(
      am5xy.CategoryAxis.new(root, {
        categoryField: "category",
        renderer: am5xy.AxisRendererX.new(root, {
          minGridDistance: 30,
        }),
      })
    );
    xAxis.data.setAll(data);

    const yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        renderer: am5xy.AxisRendererY.new(root, {}),
      })
    );

    const series = chart.series.push(
      am5xy.ColumnSeries.new(root, {
        name: "Valores",
        xAxis: xAxis,
        yAxis: yAxis,
        valueYField: "value",
        categoryXField: "category",
      })
    );

    series.data.setAll(data);

    series.columns.template.setAll({
      tooltipText: "{category}: [bold]{value}[/]",
    });

    series.appear(1000);
    chart.appear(1000, 100);
  }

  private generateLineChart(data: { category: string, value: number }[], containerId: string, title: string): void {
    const root = am5.Root.new(containerId);
    this.chartRoots.push(root);

    root.setThemes([am5themes_Animated.new(root)]);

    const chart = root.container.children.push(
      am5xy.XYChart.new(root, {
        layout: root.verticalLayout,
      })
    );

    chart.children.unshift(
      am5.Label.new(root, {
        text: title,
        fontSize: 20,
        fontWeight: "bold",
        textAlign: "center",
        x: am5.p50,
        centerX: am5.p50,
      })
    );

    const xAxis = chart.xAxes.push(
      am5xy.CategoryAxis.new(root, {
        categoryField: "category",
        renderer: am5xy.AxisRendererX.new(root, {}),
      })
    );

    const yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        renderer: am5xy.AxisRendererY.new(root, {}),
        min: 0,
      })
    );

    const sortedData = data.sort((a, b) => {
      return new Date(a.category).getTime() - new Date(b.category).getTime();
    });

    xAxis.data.setAll(sortedData);

    const series = chart.series.push(
      am5xy.LineSeries.new(root, {
        name: "Ingresos Mensuales",
        xAxis: xAxis,
        yAxis: yAxis,
        valueYField: "value",
        categoryXField: "category",
      })
    );

    series.data.setAll(sortedData);

    series.strokes.template.setAll({
      strokeWidth: 2,
    });

    series.bullets.push(() =>
      am5.Bullet.new(root, {
        locationY: 0.5,
        sprite: am5.Circle.new(root, {
          radius: 5,
          fill: root.interfaceColors.get("background"),
          stroke: series.get("fill"),
          strokeWidth: 2,
          tooltipText: "{category}: [bold]{valueY}[/]"
        }),
      })
    );

    chart.appear(1000, 100);
  }
}
