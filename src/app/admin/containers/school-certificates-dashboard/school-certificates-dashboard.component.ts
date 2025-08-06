import { Component, OnInit, OnDestroy } from '@angular/core';
import moment from 'moment';
import * as am5 from '@amcharts/amcharts5';
import * as am5percent from "@amcharts/amcharts5/percent";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import { DashboardQueries } from '../../services';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { DateFilterComponent, LoadingComponent, PrimaryButtonComponent } from 'src/app/shared';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

@Component({
  selector: 'app-school-certificates-dashboard',
  standalone: true,
  imports: [
    DateFilterComponent, MatFormFieldModule, MatOptionModule, MatSelectModule, CommonModule, FormsModule,
    MatCardModule, LoadingComponent, PrimaryButtonComponent, MatInputModule, MatAutocompleteModule
  ],
  templateUrl: './school-certificates-dashboard.component.html',
  styleUrl: './school-certificates-dashboard.component.scss'
})
export class SchoolCertificatesDashboardComponent implements OnInit, OnDestroy {
  public analytics: any = null;
  public loading = false;
  public startDate = moment().startOf('month').format('YYYY-MM-DD');
  public endDate = moment().format('YYYY-MM-DD');
  public dateType = 'issueDate';
  public searchTerm = '';

  // Filter properties
  public selectedNoticeStatus = '';
  public selectedTransportType = '';
  public selectedCategory = '';
  public selectedType = '';

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

  // Charts and Roots
  private monthlyRevenueChart: am5xy.XYChart | null = null;
  private statusChart: am5percent.PieChart | null = null;
  private transportChart: am5xy.XYChart | null = null;
  private categoryChart: am5xy.XYChart | null = null;
  private annualChart: am5xy.XYChart | null = null;
  private categoryPerformanceChart: am5xy.XYChart | null = null;
  private processingChart: am5xy.XYChart | null = null;
  private globalTransportChart: am5percent.PieChart | null = null;

  // Root references for proper disposal
  private chartRoots: { [key: string]: am5.Root } = {};

  constructor(
    private dashboardService: DashboardQueries
  ) {}

  get startDateObject(): Date {
    return new Date(this.startDate);
  }

  get endDateObject(): Date {
    return new Date(this.endDate);
  }

  ngOnInit(): void {
    this.loadAnalytics();
  }

  ngOnDestroy(): void {
    this.disposeCharts();
  }

  private disposeCharts(): void {
    // Dispose all chart roots to prevent "multiple Roots on same DOM node" errors
    Object.values(this.chartRoots).forEach(root => {
      if (root) {
        try {
          root.dispose();
        } catch (error) {
          console.warn('Error disposing chart root:', error);
        }
      }
    });
    
    // Clear the roots object
    this.chartRoots = {};
    
    // Reset chart references
    this.monthlyRevenueChart = null;
    this.statusChart = null;
    this.transportChart = null;
    this.categoryChart = null;
    this.annualChart = null;
    this.categoryPerformanceChart = null;
    this.processingChart = null;
    this.globalTransportChart = null;
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

  public loadAnalytics(): void {
    this.loading = true;

    const params = {
      startDate: this.startDate || undefined,
      endDate: this.endDate || undefined,
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

    this.dashboardService.getSchoolCertificatesAnalytics(cleanedParams).subscribe({
      next: (response) => {
        this.analytics = response;
        this.loading = false;
        // Delay chart creation to ensure DOM elements are rendered
        setTimeout(() => {
          this.createChartsWithRetry();
        }, 200);
      },
      error: (error) => {
        console.error('Error loading school certificates analytics:', error);
        this.loading = false;
      }
    });
  }

  public filterDates(dates: { startDate: Date | null, endDate: Date | null, dateType?: string }): void {
    if (dates.startDate && dates.endDate) {
      this.startDate = moment.utc(dates.startDate).format('YYYY-MM-DD');
      this.endDate = moment.utc(dates.endDate).format('YYYY-MM-DD');
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

  public onSubmit(): void {
    this.loadAnalytics();
  }

  private createChartsWithRetry(retryCount: number = 0): void {
    const maxRetries = 3;
    const chartIds = [
      'monthlyRevenueChart', 'statusChart', 'transportChart', 'categoryChart',
      'annualChart', 'categoryPerformanceChart', 'processingChart', 'globalTransportChart'
    ];

    // Check if all required DOM elements exist
    const allElementsExist = chartIds.every(id => {
      const element = document.getElementById(id);
      return element && element.offsetParent !== null; // offsetParent check ensures element is visible
    });

    if (!allElementsExist && retryCount < maxRetries) {
      // Retry after a short delay
      setTimeout(() => {
        this.createChartsWithRetry(retryCount + 1);
      }, 100 * (retryCount + 1)); // Exponential backoff
      return;
    }

    if (!allElementsExist) {
      console.warn('Some chart elements not found after retries, proceeding anyway');
    }

    this.createCharts();
  }

  private createCharts(): void {
    if (!this.analytics) return;

    this.disposeCharts();

    // Create all charts with error handling
    try {
      this.createMonthlyRevenueChart();
      this.createStatusDistributionChart();
      this.createTransportTypeChart();
      this.createCategoryChart();
      this.createAnnualOverviewChart();
      this.createCategoryPerformanceChart();
      this.createProcessingEfficiencyChart();
      this.createGlobalTransportChart();
    } catch (error) {
      console.error('Error creating charts:', error);
    }
  }

  private createMonthlyRevenueChart(): void {
    const chartId = "monthlyRevenueChart";
    const element = document.getElementById(chartId);
    if (!element || !element.offsetParent) {
      console.warn(`Chart element ${chartId} not found or not visible`);
      return;
    }

    try {
      // Dispose existing root if it exists
      if (this.chartRoots[chartId]) {
        this.chartRoots[chartId].dispose();
        delete this.chartRoots[chartId];
      }

      const root = am5.Root.new(chartId);
      this.chartRoots[chartId] = root;
    root.setThemes([am5themes_Animated.new(root)]);

    const chart = root.container.children.push(am5xy.XYChart.new(root, {
      panX: true,
      panY: true,
      wheelX: "panX",
      wheelY: "zoomX",
      pinchZoomX: true,
      layout: root.verticalLayout
    }));

    // Add title
    chart.children.unshift(
      am5.Label.new(root, {
        text: 'Tendencia de Ingresos (Últimos 6 Meses)',
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        x: am5.p50,
        centerX: am5.p50,
      })
    );

    const cursor = chart.set("cursor", am5xy.XYCursor.new(root, {}));
    cursor.lineY.set("visible", false);

    const xAxis = chart.xAxes.push(am5xy.CategoryAxis.new(root, {
      maxDeviation: 0.3,
      categoryField: "month",
      renderer: am5xy.AxisRendererX.new(root, {
        minGridDistance: 30
      })
    }));

    const yAxis = chart.yAxes.push(am5xy.ValueAxis.new(root, {
      renderer: am5xy.AxisRendererY.new(root, {})
    }));

    const series = chart.series.push(am5xy.LineSeries.new(root, {
      name: "Ingresos",
      xAxis: xAxis,
      yAxis: yAxis,
      valueYField: "amount",
      categoryXField: "month",
      tooltip: am5.Tooltip.new(root, {
        labelText: "[bold fontSize: 2rem]{categoryX}: L. {valueY}[/]"
      })
    }));

    // Add data labels on points
    series.bullets.push(() =>
      am5.Bullet.new(root, {
        locationY: 0,
        sprite: am5.Label.new(root, {
          text: "L. {valueY}",
          centerY: am5.p100,
          centerX: am5.p50,
          dy: -10,
          fontSize: 12,
          fontWeight: "bold",
          populateText: true
        })
      })
    );

      const data = this.analytics.chartData.filtered.monthlyRevenue || [];
      xAxis.data.setAll(data);
      series.data.setAll(data);

      this.monthlyRevenueChart = chart;
    } catch (error) {
      console.error(`Error creating ${chartId}:`, error);
      if (this.chartRoots[chartId]) {
        this.chartRoots[chartId].dispose();
        delete this.chartRoots[chartId];
      }
    }
  }

  private createStatusDistributionChart(): void {
    const chartId = "statusChart";
    const element = document.getElementById(chartId);
    if (!element || !element.offsetParent) {
      console.warn(`Chart element ${chartId} not found or not visible`);
      return;
    }

    try {
      // Dispose existing root if it exists
      if (this.chartRoots[chartId]) {
        this.chartRoots[chartId].dispose();
        delete this.chartRoots[chartId];
      }

      const root = am5.Root.new(chartId);
      this.chartRoots[chartId] = root;
    root.setThemes([am5themes_Animated.new(root)]);

    const chart = root.container.children.push(am5percent.PieChart.new(root, {
      layout: root.verticalLayout
    }));

    // Add title
    chart.children.unshift(
      am5.Label.new(root, {
        text: 'Distribución por Estado',
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        x: am5.p50,
        centerX: am5.p50,
      })
    );

    const series = chart.series.push(am5percent.PieSeries.new(root, {
      valueField: "count",
      categoryField: "status",
      tooltip: am5.Tooltip.new(root, {
        labelText: "[bold fontSize: 2rem]{category}: {value}[/]"
      })
    }));

    // Add data labels on slices
    series.labels.template.setAll({
      text: "{category}: {value}",
      fontSize: 12,
      fontWeight: "bold"
    });

    const statusData = this.analytics.chartData.filtered.statusDistribution || {};
    const data = Object.entries(statusData).map(([status, count]) => ({
      status,
      count
    }));

      series.data.setAll(data);
      this.statusChart = chart;
    } catch (error) {
      console.error(`Error creating ${chartId}:`, error);
      if (this.chartRoots[chartId]) {
        this.chartRoots[chartId].dispose();
        delete this.chartRoots[chartId];
      }
    }
  }

  private createTransportTypeChart(): void {
    const chartId = "transportChart";
    const element = document.getElementById(chartId);
    if (!element || !element.offsetParent) {
      console.warn(`Chart element ${chartId} not found or not visible`);
      return;
    }

    try {
      // Dispose existing root if it exists
      if (this.chartRoots[chartId]) {
        this.chartRoots[chartId].dispose();
        delete this.chartRoots[chartId];
      }

      const root = am5.Root.new(chartId);
      this.chartRoots[chartId] = root;
    root.setThemes([am5themes_Animated.new(root)]);

    const chart = root.container.children.push(am5xy.XYChart.new(root, {
      panX: false,
      panY: false,
      wheelX: "none",
      wheelY: "none",
      layout: root.verticalLayout
    }));

    // Add title
    chart.children.unshift(
      am5.Label.new(root, {
        text: 'Distribución por Tipo de Transporte',
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        x: am5.p50,
        centerX: am5.p50,
      })
    );

    const xAxis = chart.xAxes.push(am5xy.CategoryAxis.new(root, {
      categoryField: "type",
      renderer: am5xy.AxisRendererX.new(root, {})
    }));

    const yAxis = chart.yAxes.push(am5xy.ValueAxis.new(root, {
      renderer: am5xy.AxisRendererY.new(root, {})
    }));

    const series = chart.series.push(am5xy.ColumnSeries.new(root, {
      name: "Certificados",
      xAxis: xAxis,
      yAxis: yAxis,
      valueYField: "count",
      categoryXField: "type",
      tooltip: am5.Tooltip.new(root, {
        labelText: "[bold fontSize: 2rem]{categoryX}: {valueY} certificados[/]"
      })
    }));

    // Add data labels on top of bars
    series.bullets.push(() =>
      am5.Bullet.new(root, {
        locationY: 1,
        sprite: am5.Label.new(root, {
          text: "{valueY}",
          centerY: am5.p100,
          centerX: am5.p50,
          dy: -5,
          fontSize: 12,
          fontWeight: "bold",
          populateText: true
        })
      })
    );

    const transportData = this.analytics.chartData.filtered.transportTypeBreakdown || {};
    const data = Object.entries(transportData).map(([type, count]) => ({
      type,
      count
    }));

      xAxis.data.setAll(data);
      series.data.setAll(data);
      this.transportChart = chart;
    } catch (error) {
      console.error(`Error creating ${chartId}:`, error);
      if (this.chartRoots[chartId]) {
        this.chartRoots[chartId].dispose();
        delete this.chartRoots[chartId];
      }
    }
  }

  private createCategoryChart(): void {
    const chartId = "categoryChart";
    const element = document.getElementById(chartId);
    if (!element || !element.offsetParent) {
      console.warn(`Chart element ${chartId} not found or not visible`);
      return;
    }

    try {
      // Dispose existing root if it exists
      if (this.chartRoots[chartId]) {
        this.chartRoots[chartId].dispose();
        delete this.chartRoots[chartId];
      }

      const root = am5.Root.new(chartId);
      this.chartRoots[chartId] = root;
    root.setThemes([am5themes_Animated.new(root)]);

    const chart = root.container.children.push(am5xy.XYChart.new(root, {
      panX: false,
      panY: false,
      wheelX: "none",
      wheelY: "none",
      layout: root.verticalLayout
    }));

    // Add title
    chart.children.unshift(
      am5.Label.new(root, {
        text: 'Distribución por Categoría de Vehículo',
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        x: am5.p50,
        centerX: am5.p50,
      })
    );

    const xAxis = chart.xAxes.push(am5xy.CategoryAxis.new(root, {
      categoryField: "category",
      renderer: am5xy.AxisRendererX.new(root, {
        minGridDistance: 30
      })
    }));

    const yAxis = chart.yAxes.push(am5xy.ValueAxis.new(root, {
      renderer: am5xy.AxisRendererY.new(root, {})
    }));

    const series = chart.series.push(am5xy.ColumnSeries.new(root, {
      name: "Certificados",
      xAxis: xAxis,
      yAxis: yAxis,
      valueYField: "count",
      categoryXField: "category",
      tooltip: am5.Tooltip.new(root, {
        labelText: "[bold fontSize: 2rem]{categoryX}: {valueY} certificados[/]"
      })
    }));

    // Add data labels on top of bars
    series.bullets.push(() =>
      am5.Bullet.new(root, {
        locationY: 1,
        sprite: am5.Label.new(root, {
          text: "{valueY}",
          centerY: am5.p100,
          centerX: am5.p50,
          dy: -5,
          fontSize: 12,
          fontWeight: "bold",
          populateText: true
        })
      })
    );

    const categoryData = this.analytics.chartData.filtered.categoryDistribution || {};
    const data = Object.entries(categoryData).map(([category, count]) => ({
      category: category.length > 20 ? category.substring(0, 17) + '...' : category,
      count
    }));

      xAxis.data.setAll(data);
      series.data.setAll(data);
      this.categoryChart = chart;
    } catch (error) {
      console.error(`Error creating ${chartId}:`, error);
      if (this.chartRoots[chartId]) {
        this.chartRoots[chartId].dispose();
        delete this.chartRoots[chartId];
      }
    }
  }

  private createAnnualOverviewChart(): void {
    const chartId = "annualChart";
    const element = document.getElementById(chartId);
    if (!element || !element.offsetParent) {
      console.warn(`Chart element ${chartId} not found or not visible`);
      return;
    }

    try {
      // Dispose existing root if it exists
      if (this.chartRoots[chartId]) {
        this.chartRoots[chartId].dispose();
        delete this.chartRoots[chartId];
      }

      const root = am5.Root.new(chartId);
      this.chartRoots[chartId] = root;
    root.setThemes([am5themes_Animated.new(root)]);

    const chart = root.container.children.push(am5xy.XYChart.new(root, {
      panX: false,
      panY: false,
      layout: root.verticalLayout
    }));

    // Add title
    chart.children.unshift(
      am5.Label.new(root, {
        text: 'Resumen Anual de Certificados Escolares',
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        x: am5.p50,
        centerX: am5.p50,
      })
    );

    const xAxis = chart.xAxes.push(am5xy.CategoryAxis.new(root, {
      categoryField: "year",
      renderer: am5xy.AxisRendererX.new(root, {})
    }));

    const yAxis = chart.yAxes.push(am5xy.ValueAxis.new(root, {
      renderer: am5xy.AxisRendererY.new(root, {})
    }));

    const series = chart.series.push(am5xy.ColumnSeries.new(root, {
      name: "Certificados",
      xAxis: xAxis,
      yAxis: yAxis,
      valueYField: "count",
      categoryXField: "year",
      tooltip: am5.Tooltip.new(root, {
        labelText: "[bold fontSize: 2rem]{categoryX}: {valueY} certificados[/]"
      })
    }));

    // Add data labels on top of bars
    series.bullets.push(() =>
      am5.Bullet.new(root, {
        locationY: 1,
        sprite: am5.Label.new(root, {
          text: "{valueY}",
          centerY: am5.p100,
          centerX: am5.p50,
          dy: -5,
          fontSize: 12,
          fontWeight: "bold",
          populateText: true
        })
      })
    );

      const data = this.analytics.chartData.global.annualOverview || [];
      xAxis.data.setAll(data);
      series.data.setAll(data);
      this.annualChart = chart;
    } catch (error) {
      console.error(`Error creating ${chartId}:`, error);
      if (this.chartRoots[chartId]) {
        this.chartRoots[chartId].dispose();
        delete this.chartRoots[chartId];
      }
    }
  }

  private createCategoryPerformanceChart(): void {
    const chartId = "categoryPerformanceChart";
    const element = document.getElementById(chartId);
    if (!element || !element.offsetParent) {
      console.warn(`Chart element ${chartId} not found or not visible`);
      return;
    }

    try {
      // Dispose existing root if it exists
      if (this.chartRoots[chartId]) {
        this.chartRoots[chartId].dispose();
        delete this.chartRoots[chartId];
      }

      const root = am5.Root.new(chartId);
      this.chartRoots[chartId] = root;
    root.setThemes([am5themes_Animated.new(root)]);

    const chart = root.container.children.push(am5xy.XYChart.new(root, {
      panX: false,
      panY: false,
      layout: root.verticalLayout
    }));

    // Add title
    chart.children.unshift(
      am5.Label.new(root, {
        text: 'Rendimiento por Categoría (Pagados vs Sin Pagar)',
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        x: am5.p50,
        centerX: am5.p50,
      })
    );

    const xAxis = chart.xAxes.push(am5xy.CategoryAxis.new(root, {
      categoryField: "category",
      renderer: am5xy.AxisRendererX.new(root, {
        minGridDistance: 50
      })
    }));

    const yAxis = chart.yAxes.push(am5xy.ValueAxis.new(root, {
      renderer: am5xy.AxisRendererY.new(root, {})
    }));

    const paidSeries = chart.series.push(am5xy.ColumnSeries.new(root, {
      name: "Pagados",
      xAxis: xAxis,
      yAxis: yAxis,
      valueYField: "paid",
      categoryXField: "category",
      stacked: true,
      tooltip: am5.Tooltip.new(root, {
        labelText: "[bold fontSize: 2rem]{categoryX}[/]\n[bold]Pagados:[/] {paid}\n[bold]Sin Pagar:[/] {unpaid}\n[bold]Total:[/] {total}"
      })
    }));

    const unpaidSeries = chart.series.push(am5xy.ColumnSeries.new(root, {
      name: "Sin Pagar",
      xAxis: xAxis,
      yAxis: yAxis,
      valueYField: "unpaid",
      categoryXField: "category",
      stacked: true,
      tooltip: am5.Tooltip.new(root, {
        labelText: "[bold fontSize: 2rem]{categoryX}[/]\n[bold]Pagados:[/] {paid}\n[bold]Sin Pagar:[/] {unpaid}\n[bold]Total:[/] {total}"
      })
    }));

    // Add single data label on top of the entire stacked bar
    unpaidSeries.bullets.push(() =>
      am5.Bullet.new(root, {
        locationY: 1,
        sprite: am5.Label.new(root, {
          text: "P: {paid}, NP: {unpaid}",
          centerY: am5.p100,
          centerX: am5.p50,
          dy: -5,
          fontSize: 12,
          fontWeight: "bold",
          fill: am5.color("#000000"),
          populateText: true
        })
      })
    );

    const performanceData = this.analytics.chartData.global.categoryPerformance || {};
    
    // First, map and truncate categories
    const rawData = Object.entries(performanceData).map(([category, stats]: [string, any]) => ({
      category: category.length > 15 ? category.substring(0, 12) + '...' : category,
      paid: stats.paid || 0,
      unpaid: stats.unpaid || 0,
      total: (stats.paid || 0) + (stats.unpaid || 0)
    }));

    // Then, aggregate duplicate truncated categories
    const aggregatedData = new Map();
    
    rawData.forEach(item => {
      if (aggregatedData.has(item.category)) {
        const existing = aggregatedData.get(item.category);
        aggregatedData.set(item.category, {
          category: item.category,
          paid: existing.paid + item.paid,
          unpaid: existing.unpaid + item.unpaid,
          total: existing.total + item.total
        });
      } else {
        aggregatedData.set(item.category, item);
      }
    });

      // Convert back to array
      const data = Array.from(aggregatedData.values());
      console.log('Aggregated data:', data);
      xAxis.data.setAll(data);
      paidSeries.data.setAll(data);
      unpaidSeries.data.setAll(data);
      this.categoryPerformanceChart = chart;
    } catch (error) {
      console.error(`Error creating ${chartId}:`, error);
      if (this.chartRoots[chartId]) {
        this.chartRoots[chartId].dispose();
        delete this.chartRoots[chartId];
      }
    }
  }

  private createProcessingEfficiencyChart(): void {
    const chartId = "processingChart";
    const element = document.getElementById(chartId);
    if (!element || !element.offsetParent) {
      console.warn(`Chart element ${chartId} not found or not visible`);
      return;
    }

    try {
      // Dispose existing root if it exists
      if (this.chartRoots[chartId]) {
        this.chartRoots[chartId].dispose();
        delete this.chartRoots[chartId];
      }

      const root = am5.Root.new(chartId);
      this.chartRoots[chartId] = root;
    root.setThemes([am5themes_Animated.new(root)]);

    const chart = root.container.children.push(am5xy.XYChart.new(root, {
      panX: true,
      panY: true,
      wheelX: "panX",
      wheelY: "zoomX",
      layout: root.verticalLayout
    }));

    // Add title
    chart.children.unshift(
      am5.Label.new(root, {
        text: 'Eficiencia de Procesamiento (Tiempo Promedio)',
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        x: am5.p50,
        centerX: am5.p50,
      })
    );

    const xAxis = chart.xAxes.push(am5xy.CategoryAxis.new(root, {
      categoryField: "month",
      renderer: am5xy.AxisRendererX.new(root, {
        minGridDistance: 30
      })
    }));

    const yAxis = chart.yAxes.push(am5xy.ValueAxis.new(root, {
      renderer: am5xy.AxisRendererY.new(root, {})
    }));

    const series = chart.series.push(am5xy.LineSeries.new(root, {
      name: "Días Promedio",
      xAxis: xAxis,
      yAxis: yAxis,
      valueYField: "avgDays",
      categoryXField: "month",
      tooltip: am5.Tooltip.new(root, {
        labelText: "[bold fontSize: 2rem]{categoryX}: {valueY} días[/]"
      })
    }));

    // Add data labels on points
    series.bullets.push(() =>
      am5.Bullet.new(root, {
        locationY: 0,
        sprite: am5.Label.new(root, {
          text: "{valueY} días",
          centerY: am5.p100,
          centerX: am5.p50,
          dy: -10,
          fontSize: 12,
          fontWeight: "bold",
          populateText: true
        })
      })
    );

      const data = this.analytics.chartData.global.processingEfficiency || [];
      xAxis.data.setAll(data);
      series.data.setAll(data);
      this.processingChart = chart;
    } catch (error) {
      console.error(`Error creating ${chartId}:`, error);
      if (this.chartRoots[chartId]) {
        this.chartRoots[chartId].dispose();
        delete this.chartRoots[chartId];
      }
    }
  }

  private createGlobalTransportChart(): void {
    const chartId = "globalTransportChart";
    const element = document.getElementById(chartId);
    if (!element || !element.offsetParent) {
      console.warn(`Chart element ${chartId} not found or not visible`);
      return;
    }

    try {
      // Dispose existing root if it exists
      if (this.chartRoots[chartId]) {
        this.chartRoots[chartId].dispose();
        delete this.chartRoots[chartId];
      }

      const root = am5.Root.new(chartId);
      this.chartRoots[chartId] = root;
    root.setThemes([am5themes_Animated.new(root)]);

    const chart = root.container.children.push(am5percent.PieChart.new(root, {
      layout: root.verticalLayout
    }));

    // Add title
    chart.children.unshift(
      am5.Label.new(root, {
        text: 'Distribución Global de Transporte Escolar',
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        x: am5.p50,
        centerX: am5.p50,
      })
    );

    const series = chart.series.push(am5percent.PieSeries.new(root, {
      valueField: "count",
      categoryField: "type",
      tooltip: am5.Tooltip.new(root, {
        labelText: "[bold fontSize: 2rem]{category}: {value}[/]"
      })
    }));

    // Add data labels on slices
    series.labels.template.setAll({
      text: "{category}: {value}",
      fontSize: 12,
      fontWeight: "bold"
    });

    const transportData = this.analytics.chartData.global.globalTransportDistribution || {};
    const data = Object.entries(transportData).map(([type, count]) => ({
      type,
      count
    }));

      series.data.setAll(data);
      this.globalTransportChart = chart;
    } catch (error) {
      console.error(`Error creating ${chartId}:`, error);
      if (this.chartRoots[chartId]) {
        this.chartRoots[chartId].dispose();
        delete this.chartRoots[chartId];
      }
    }
  }

  public formatCurrency(amount: number | null): string {
    if (!amount) return 'L. 0.00';
    return `L. ${amount.toLocaleString('es-HN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  public formatPercentage(value: number | null): string {
    if (value === null || value === undefined) return '0.0%';
    return `${value.toFixed(1)}%`;
  }
}
