import { Component, OnInit, OnDestroy } from '@angular/core';
import { DateFilterComponent, LoadingComponent } from "../../../shared";
import moment from 'moment';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { ApplicationsQueries } from '../../services/applications.queries';
import { Application, ApplicationAnalytics } from '../../interfaces/applications.interfaces';
import * as am5 from '@amcharts/amcharts5';
import * as am5percent from "@amcharts/amcharts5/percent";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import * as am5xy from "@amcharts/amcharts5/xy";
import { PrimaryButtonComponent } from "../../../shared/buttons/components/primary-button/primary-button.component";
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-applications-dashboard',
  standalone: true,
  imports: [
    DateFilterComponent, MatFormFieldModule, MatOptionModule, MatSelectModule, CommonModule, FormsModule,
    MatCardModule, LoadingComponent, PrimaryButtonComponent, MatInputModule
  ],
  templateUrl: './applications-dashboard.component.html',
  styleUrls: ['./applications-dashboard.component.scss']
})
export class ApplicationsDashboardComponent implements OnInit, OnDestroy {
  public loading = false;
  public applications: Application[] = [];
  public analytics: ApplicationAnalytics | null = null;
  public totalApplications = 0;
  public pendingApplications = 0;
  public approvedApplications = 0;
  public rejectedApplications = 0;
  public automaticRenewals = 0;
  public manualApplications = 0;
  public applicantName = '';
  public companyName = '';
  public start = moment.utc().startOf('month').format('YYYY-MM-DD');
  public end = moment.utc().format('YYYY-MM-DD');
  
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
  private chartRoots: am5.Root[] = [];

  constructor(
    private applicationsQueries: ApplicationsQueries
  ) {}

  ngOnInit(): void {
    this.fetchDashboard();
  }

  ngOnDestroy(): void {
    this.chartRoots.forEach(root => root.dispose());
  }

  public filterDates(dates: { startDate: Date | null, endDate: Date | null }): void {
    if (dates.startDate && dates.endDate) {
      this.start = moment.utc(dates.startDate).format('YYYY-MM-DD');
      this.end = moment.utc(dates.endDate).format('YYYY-MM-DD');
    }
  }

  public applyFilter(filterType: string, value: any): void {
    switch (filterType) {
      case 'fileStatus':
        this.selectedFileStatus = value || '';
        break;
      case 'procedureType':
        this.selectedProcedureType = value || '';
        break;
      case 'category':
        this.selectedCategory = value || '';
        break;
      case 'renewalState':
        this.selectedRenewalState = value !== '' ? value : null;
        break;
    }
  }

  public fetchDashboard(): void {
    this.loading = true;
    
    this.applicationsQueries.getApplicationsAnalytics({
      startDate: this.start,
      endDate: this.end
    }).subscribe((response) => {
      this.analytics = response;
      this.updateKPIsFromAnalytics();
      this.generateGraphsFromAnalytics();
      this.loading = false;
    });
  }

  public onSubmit(): void {
    this.loading = true;

    const params: any = {
      fileStatus: this.selectedFileStatus || undefined,
      procedureType: this.selectedProcedureType || undefined,
      categoryId: this.selectedCategory || undefined,
      startDate: this.start || undefined,
      endDate: this.end || undefined,
      applicantName: this.applicantName !== '' ? this.applicantName : undefined,
      companyName: this.companyName !== '' ? this.companyName : undefined,
      isAutomaticRenewal: this.selectedRenewalState !== null ? this.selectedRenewalState : undefined
    };

    const cleanedParams = Object.fromEntries(
      Object.entries(params).filter(([_, value]) => value !== undefined)
    );

    this.applicationsQueries.getApplicationsAnalytics(cleanedParams).subscribe((response) => {
      this.analytics = response;
      this.updateKPIsFromAnalytics();
      this.generateGraphsFromAnalytics();
      this.loading = false;
    });
  }

  private updateKPIsFromAnalytics(): void {
    if (!this.analytics?.kpis) return;
    
    this.totalApplications = this.analytics.kpis.totalApplications;
    this.pendingApplications = this.analytics.kpis.pendingApplications;
    this.approvedApplications = this.analytics.kpis.approvedApplications;
    this.rejectedApplications = this.analytics.kpis.rejectedApplications;
    this.automaticRenewals = this.analytics.kpis.automaticRenewals;
    this.manualApplications = this.analytics.kpis.manualApplications;
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

    const procedureChartData = Object.entries(chartData.procedureTypeDistribution).map(([type, count]) => ({
      category: type,
      value: count as number,
    }));

    const monthlyChartData = Object.entries(chartData.monthlyApplications).map(([month, count]) => ({
      category: month,
      value: count as number,
    }));

    const renewalChartData = Object.entries(chartData.renewalTypeDistribution).map(([type, count]) => ({
      category: type === 'AUTOMATICA' ? 'Automática' : 'Manual',
      value: count as number,
    }));

    const serviceClassChartData = Object.entries(chartData.serviceClassDistribution).map(([serviceClass, count]) => ({
      category: serviceClass,
      value: count as number,
    }));

    this.generateStatusPieChart(statusChartData);
    this.generateProcedureBarChart(procedureChartData);
    this.generateMonthlyLineChart(monthlyChartData);
    this.generateRenewalPieChart(renewalChartData);
    this.generateServiceClassBarChart(serviceClassChartData);
  }

  private generateStatusPieChart(data: { category: string, value: number }[]): void {
    const root = am5.Root.new("statusDistributionChart");
    this.chartRoots.push(root);

    root.setThemes([am5themes_Animated.new(root)]);

    const chart = root.container.children.push(
      am5percent.PieChart.new(root, {
        layout: root.verticalLayout,
      })
    );

    chart.children.unshift(
      am5.Label.new(root, {
        text: "Distribución por Estado de Solicitud",
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

  private generateProcedureBarChart(data: { category: string, value: number }[]): void {
    const root = am5.Root.new("procedureTypeChart");
    this.chartRoots.push(root);

    root.setThemes([am5themes_Animated.new(root)]);

    const chart = root.container.children.push(
      am5xy.XYChart.new(root, {
        layout: root.verticalLayout,
      })
    );

    chart.children.unshift(
      am5.Label.new(root, {
        text: "Solicitudes por Tipo de Trámite",
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

    const yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        renderer: am5xy.AxisRendererY.new(root, {}),
        min: 0
      })
    );

    xAxis.data.setAll(data);

    const series = chart.series.push(
      am5xy.ColumnSeries.new(root, {
        name: "Solicitudes",
        xAxis: xAxis,
        yAxis: yAxis,
        valueYField: "value",
        categoryXField: "category",
      })
    );

    series.data.setAll(data);

    series.columns.template.setAll({
      tooltipText: "{category}: [bold]{value}[/] solicitudes",
      fill: am5.color(0x2196f3),
      stroke: am5.color(0x2196f3),
    });

    series.appear(1000);
    chart.appear(1000, 100);
  }

  private generateMonthlyLineChart(data: { category: string, value: number }[]): void {
    const root = am5.Root.new("monthlyApplicationsChart");
    this.chartRoots.push(root);

    root.setThemes([am5themes_Animated.new(root)]);

    const chart = root.container.children.push(
      am5xy.XYChart.new(root, {
        layout: root.verticalLayout,
      })
    );

    chart.children.unshift(
      am5.Label.new(root, {
        text: "Tendencia Mensual de Solicitudes",
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
        name: "Solicitudes Mensuales",
        xAxis: xAxis,
        yAxis: yAxis,
        valueYField: "value",
        categoryXField: "category",
      })
    );

    series.data.setAll(sortedData);

    series.strokes.template.setAll({
      strokeWidth: 3,
      stroke: am5.color(0x4caf50)
    });

    series.bullets.push(() =>
      am5.Bullet.new(root, {
        locationY: 0.5,
        sprite: am5.Circle.new(root, {
          radius: 6,
          fill: am5.color(0x4caf50),
          stroke: root.interfaceColors.get("background"),
          strokeWidth: 2,
          tooltipText: "{category}: [bold]{valueY}[/] solicitudes"
        }),
      })
    );

    chart.appear(1000, 100);
  }

  private generateRenewalPieChart(data: { category: string, value: number }[]): void {
    const root = am5.Root.new("renewalTypeChart");
    this.chartRoots.push(root);

    root.setThemes([am5themes_Animated.new(root)]);

    const chart = root.container.children.push(
      am5percent.PieChart.new(root, {
        layout: root.verticalLayout,
      })
    );

    chart.children.unshift(
      am5.Label.new(root, {
        text: "Tipo de Renovación",
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
      tooltipText: "{category}: [bold]{value}[/] solicitudes"
    });

    // Custom colors for renewal types
    series.get("colors")?.set("colors", [
      am5.color(0x4caf50), // Green for automatic
      am5.color(0xff9800)  // Orange for manual
    ]);

    series.appear(1000, 100);
  }

  private generateServiceClassBarChart(data: { category: string, value: number }[]): void {
    const root = am5.Root.new("serviceClassChart");
    this.chartRoots.push(root);

    root.setThemes([am5themes_Animated.new(root)]);

    const chart = root.container.children.push(
      am5xy.XYChart.new(root, {
        layout: root.verticalLayout,
      })
    );

    chart.children.unshift(
      am5.Label.new(root, {
        text: "Solicitudes por Clase de Servicio",
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

    const yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        renderer: am5xy.AxisRendererY.new(root, {}),
        min: 0
      })
    );

    xAxis.data.setAll(data);

    const series = chart.series.push(
      am5xy.ColumnSeries.new(root, {
        name: "Solicitudes",
        xAxis: xAxis,
        yAxis: yAxis,
        valueYField: "value",
        categoryXField: "category",
      })
    );

    series.data.setAll(data);

    series.columns.template.setAll({
      tooltipText: "{category}: [bold]{value}[/] solicitudes",
      fill: am5.color(0x9c27b0),
      stroke: am5.color(0x9c27b0),
    });

    series.appear(1000);
    chart.appear(1000, 100);
  }
}