import { Component, OnInit, OnDestroy } from '@angular/core';
import moment from 'moment';
import * as am5 from '@amcharts/amcharts5';
import * as am5percent from "@amcharts/amcharts5/percent";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import { Fine } from '../../interfaces';
import { DashboardQueries } from '../../services';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { DateFilterComponent, LoadingComponent, PrimaryButtonComponent } from 'src/app/shared';
import { MatInputModule } from '@angular/material/input';

@Component({
  standalone: true,
  imports: [
    DateFilterComponent, MatFormFieldModule, MatOptionModule, MatSelectModule, CommonModule, FormsModule,
    MatCardModule, LoadingComponent, PrimaryButtonComponent, MatInputModule
  ],
  selector: 'app-fines-dashboard',
  templateUrl: './fines-dashboard.component.html',
  styleUrls: ['./fines-dashboard.component.scss']
})
export class FinesDashboardComponent implements OnInit, OnDestroy {
  public fines: Fine[] = [];
  public analytics: any = null;
  public loading = false;
  public totalFines = 0;
  public totalFineRevenue = 0;
  public selectedRegion = '';
  public selectedDepartment = '';
  public rtn = '';
  public selectedStatus = '';
  public employeeId = '';
  public employeeName = '';
  public totalAmountDue = 0;
  public activeFines = 0;
  public statusWord = 'Activas';
  // Global KPIs
  public globalActiveFines = 0;
  public globalTotalAmountDue = 0;
  public globalTotalFines = 0;
  public startDate = moment().startOf('month').format('YYYY-MM-DD');
  public endDate = moment().format('YYYY-MM-DD');
  public departments: string[] = [
    'ATLANTIDA', 'CHOLUTECA', 'COLON', 'COMAYAGUA', 'COPAN',
    'CORTES', 'EL PARAISO', 'FRANCISCO MORAZAN', 'GRACIAS A DIOS',
    'INTIBUCA', 'ISLAS DE LA BAHIA', 'LA PAZ', 'LEMPIRA', 'NACIONAL',
    'OCOTEPEQUE', 'OLANCHO', 'SANTA BARBARA', 'VALLE', 'YORO'
  ];
  public statuses = ['ACTIVA', 'PAGADA', 'ANULADA'];
  public regions = [
    'REGIONAL DEL ATLANTICO, OFICINA PRINCIPAL, LA CEIBA',
    'REGIONAL NOR OCCIDENTAL, OFICINA PRINCIPAL, SAN PEDRO SULA',
    'REGIONAL OCCIDENTE, SANTA ROSA DE COPAN',
    'REGIONAL SUR, OFICINA PRINCIPAL, CHOLUTECA',
    'TEGUCIGALPA, OFICINA PRINCIPAL',
  ];
  private chartRoots: am5.Root[] = [];


  constructor(private dashboardQueries: DashboardQueries) {}

  ngOnInit(): void {
    this.fetchFines();
  }

  ngOnDestroy(): void {
    this.chartRoots.forEach(root => root.dispose());
  }

  public applyFilter(filterType: string, value: string): void {
    switch (filterType) {
      case 'department':
        this.selectedDepartment = value || '';
        break;
      case 'region':
        this.selectedRegion = value || '';
        break;
      case 'status':
        this.selectedStatus = value || '';
        break;
    }
  }

  public filterDates(dates: { startDate: Date | null; endDate: Date | null }): void {
    if (dates.startDate && dates.endDate) {
      this.startDate = moment(dates.startDate).format('YYYY-MM-DD');
      this.endDate = moment(dates.endDate).format('YYYY-MM-DD');
    }
  }

  public onSubmit(): void {
    this.loading = true;

    const params = {
      startDate: this.startDate,
      endDate: this.endDate,
      region: this.selectedRegion || undefined,
      department: this.selectedDepartment || undefined,
      status: this.selectedStatus || undefined,
      dniRtn: this.rtn !== '' ? this.rtn : undefined,
      employeeId: this.employeeId !== '' ? this.employeeId : undefined,
      employeeName: this.employeeName !== '' ? this.employeeName : undefined
    };

    const cleanedParams = Object.fromEntries(
      Object.entries(params).filter(([_, value]) => value !== undefined)
    );

    this.dashboardQueries.getFinesAnalytics(cleanedParams).subscribe(response => {
      this.analytics = response;
      this.updateKPIsFromAnalytics();
      this.generateChartsFromAnalytics();
      this.loading = false;
    });
  }

  private fetchFines(): void {
    this.loading = true;
    this.dashboardQueries.getFinesAnalytics({ startDate: this.startDate, endDate: this.endDate }).subscribe(response => {
      this.analytics = response;
      this.updateKPIsFromAnalytics();
      this.generateChartsFromAnalytics();
      this.loading = false;
    });
  }

  private updateKPIsFromAnalytics(): void {
    if (!this.analytics?.kpis) return;
    
    // Filtered KPIs
    this.totalFines = this.analytics.kpis.filtered.totalFines;
    this.totalFineRevenue = this.analytics.kpis.filtered.totalFineRevenue;
    this.totalAmountDue = this.analytics.kpis.filtered.totalAmountDue;
    
    // Global KPIs
    this.globalActiveFines = this.analytics.kpis.global.activeFines;
    this.globalTotalAmountDue = this.analytics.kpis.global.totalAmountDue;
    this.globalTotalFines = this.analytics.kpis.global.totalFines;
    
    // Fix status logic - use selected status or default to ACTIVA
    const state = this.selectedStatus !== '' ? this.selectedStatus : 'ACTIVA';
    this.statusWord = state === 'ACTIVA' ? 'Activas' : state === 'PAGADA' ? 'Pagadas' : 'Anuladas';
    
    switch (state) {
      case 'ACTIVA':
        this.activeFines = this.analytics.kpis.filtered.activeFines;
        break;
      case 'PAGADA':
        this.activeFines = this.analytics.kpis.filtered.paidFines;
        break;
      case 'ANULADA':
        this.activeFines = this.analytics.kpis.filtered.cancelledFines;
        break;
      default:
        this.activeFines = this.analytics.kpis.filtered.activeFines;
    }
  }

  private generateChartsFromAnalytics(): void {
    if (!this.analytics?.chartData) return;

    this.chartRoots.forEach(root => root.dispose());
    this.chartRoots = [];

    const { chartData } = this.analytics;

    // Convert backend data to chart format
    const statusData = Object.entries(chartData.statusDistribution).map(([status, count]) => ({
      category: status,
      value: count as number,
    }));

    const revenueData = Object.entries(chartData.monthlyRevenue).map(([month, revenue]) => ({
      category: month,
      value: revenue as number,
    }));

    const debtData = Object.entries(chartData.debtByDepartment).map(([department, amount]) => ({
      category: department,
      value: amount as number,
    }));

    const regionDebtData = Object.entries(chartData.debtByRegion).map(([region, data]: [string, any]) => ({
      category: region,
      value: data.totalAmount,
      count: data.count,
    }));

    const departmentLast12MonthsData = Object.entries(chartData.finesByDepartmentLast12Months).map(([department, data]: [string, any]) => ({
      category: department,
      value: data.value,
      count: data.count,
    }));

    // Global chart data
    const globalDebtDepartmentData = Object.entries(chartData.globalDebtByDepartment).map(([department, amount]) => ({
      category: department,
      value: amount as number,
    }));

    const globalDebtRegionData = Object.entries(chartData.globalDebtByRegion).map(([region, data]: [string, any]) => ({
      category: region,
      value: data.totalAmount,
      count: data.count,
    }));

    this.generatePieChart(statusData, "finesStatusChart", "Distribución por Estado");
    this.generateLineChart(revenueData, "monthlyFineRevenueChart", "Ingresos Mensuales por Multas");
    this.generateBarChart(debtData, "fineDebtByDepartmentChart", "Deuda por Departamento (Filtrada)");
    this.generateFinesByRegionChart(regionDebtData);
    this.generateFinesByDepartmentChartOptimized(departmentLast12MonthsData);
    
    // Global charts for comparison
    this.generateBarChart(globalDebtDepartmentData, "globalDebtByDepartmentChart", "Deuda por Departamento (Global)");
    this.generateFinesByRegionChartGlobal(globalDebtRegionData);
    
    this.loading = false;
  }


  private generateFinesByRegionChart(data: any[]): void {
    const root = am5.Root.new('finesByRegionChart');
    this.chartRoots.push(root);

    root.setThemes([am5themes_Animated.new(root)]);

    const chart = root.container.children.push(
      am5xy.XYChart.new(root, {
        layout: root.verticalLayout,
      })
    );

    // Agregar título al gráfico
    chart.children.unshift(
      am5.Label.new(root, {
        text: 'Deuda por Regional',
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        x: am5.p50,
        centerX: am5.p50,
      })
    );

    // Crear ejes
    const xAxis = chart.xAxes.push(
      am5xy.CategoryAxis.new(root, {
        categoryField: 'category',
        renderer: am5xy.AxisRendererX.new(root, {
          minGridDistance: 30,
        }),
      })
    );

    const yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        renderer: am5xy.AxisRendererY.new(root, {}),
        min: 0,
      })
    );

    xAxis.data.setAll(data);

    // Crear serie de barras
    const series = chart.series.push(
      am5xy.ColumnSeries.new(root, {
        name: 'Dinero por Multas',
        xAxis: xAxis,
        yAxis: yAxis,
        valueYField: 'value',
        categoryXField: 'category',
      })
    );

    series.data.setAll(data);

    // Configurar tooltip
    series.columns.template.setAll({
      tooltipText: '{category}: L. {value} ({count} multas)',
      tooltipY: 0,
    });

    // Agregar etiquetas de datos encima de las barras
    series.bullets.push(() =>
      am5.Bullet.new(root, {
        locationY: 1,
        sprite: am5.Label.new(root, {
          text: 'L. {value}',
          centerY: am5.p100,
          centerX: am5.p50,
          populateText: true,
        }),
      })
    );

    chart.appear(1000, 100);
  }

  private generateFinesByRegionChartGlobal(data: any[]): void {
    const root = am5.Root.new('globalFinesByRegionChart');
    this.chartRoots.push(root);

    root.setThemes([am5themes_Animated.new(root)]);

    const chart = root.container.children.push(
      am5xy.XYChart.new(root, {
        layout: root.verticalLayout,
      })
    );

    // Agregar título al gráfico
    chart.children.unshift(
      am5.Label.new(root, {
        text: 'Deuda por Regional (Global)',
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        x: am5.p50,
        centerX: am5.p50,
      })
    );

    // Crear ejes
    const xAxis = chart.xAxes.push(
      am5xy.CategoryAxis.new(root, {
        categoryField: 'category',
        renderer: am5xy.AxisRendererX.new(root, {
          minGridDistance: 30,
        }),
      })
    );

    const yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        renderer: am5xy.AxisRendererY.new(root, {}),
        min: 0,
      })
    );

    xAxis.data.setAll(data);

    // Crear serie de barras
    const series = chart.series.push(
      am5xy.ColumnSeries.new(root, {
        name: 'Dinero por Multas',
        xAxis: xAxis,
        yAxis: yAxis,
        valueYField: 'value',
        categoryXField: 'category',
      })
    );

    series.data.setAll(data);

    // Configurar tooltip
    series.columns.template.setAll({
      tooltipText: '{category}: L. {value} ({count} multas)',
      tooltipY: 0,
    });

    // Agregar etiquetas de datos encima de las barras
    series.bullets.push(() =>
      am5.Bullet.new(root, {
        locationY: 1,
        sprite: am5.Label.new(root, {
          text: 'L. {value}',
          centerY: am5.p100,
          centerX: am5.p50,
          populateText: true,
        }),
      })
    );

    chart.appear(1000, 100);
  }

  private generateFinesByDepartmentChartOptimized(data: any[]): void {
    const root = am5.Root.new('finesByDepartmentChart');
    this.chartRoots.push(root);

    root.setThemes([am5themes_Animated.new(root)]);

    const chart = root.container.children.push(
      am5xy.XYChart.new(root, {
        layout: root.verticalLayout,
      })
    );

    // Agregar título al gráfico
    chart.children.unshift(
      am5.Label.new(root, {
        text: 'Multas por Departamento en los Últimos 12 Meses',
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        x: am5.p50,
        centerX: am5.p50,
      })
    );

    // Crear ejes
    const xAxis = chart.xAxes.push(
      am5xy.CategoryAxis.new(root, {
        categoryField: 'category',
        renderer: am5xy.AxisRendererX.new(root, {
          minGridDistance: 30,
        }),
      })
    );

    const yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        renderer: am5xy.AxisRendererY.new(root, {}),
        min: 0,
      })
    );

    xAxis.data.setAll(data);

    // Crear serie de barras
    const series = chart.series.push(
      am5xy.ColumnSeries.new(root, {
        name: 'Dinero por Multas',
        xAxis: xAxis,
        yAxis: yAxis,
        valueYField: 'value',
        categoryXField: 'category',
      })
    );

    series.data.setAll(data);

    // Configurar tooltip
    series.columns.template.setAll({
      tooltipText: '{category}: L. {value} ({count} multas)',
      tooltipY: 0,
    });

    // Agregar etiquetas de datos encima de las barras
    series.bullets.push(() =>
      am5.Bullet.new(root, {
        locationY: 1,
        sprite: am5.Label.new(root, {
          text: 'L. {value}',
          centerY: am5.p100,
          centerX: am5.p50,
          populateText: true,
        }),
      })
    );

    chart.appear(1000, 100);
  }

  private generatePieChart(data: any[], chartId: string, title: string): void {
    const root = am5.Root.new(chartId);
    this.chartRoots.push(root);

    root.setThemes([am5themes_Animated.new(root)]);

    const chart = root.container.children.push(am5percent.PieChart.new(root, {}));
    // Agregar título
    chart.children.unshift(
      am5.Label.new(root, {
        text: title,
        fontSize: 20, // Tamaño de fuente
        fontWeight: "bold", // Negrita
        textAlign: "center", // Alinear al centro
        x: am5.p50, // Centrar horizontalmente
        centerX: am5.p50, // Centrar en el contenedor
      })
    );
    const series = chart.series.push(am5percent.PieSeries.new(root, {
      valueField: 'value',
      categoryField: 'category',
    }));
    series.data.setAll(data);
  }

  private generateLineChart(data: any[], chartId: string, title: string): void {
    const root = am5.Root.new(chartId);
    this.chartRoots.push(root);

    root.setThemes([am5themes_Animated.new(root)]);

    const chart = root.container.children.push(am5xy.XYChart.new(root, {}));
    const xAxis = chart.xAxes.push(
      am5xy.CategoryAxis.new(root, {
        categoryField: 'category',
        renderer: am5xy.AxisRendererX.new(root, {
          minGridDistance: 50,
        })
      }));
    const yAxis = chart.yAxes.push(am5xy.ValueAxis.new(root, {
      renderer: am5xy.AxisRendererY.new(root, {}),
      min: 0,
    }));
    const sortedData = data.sort((a, b) => {
      return new Date(a.category).getTime() - new Date(b.category).getTime();
    });

    const series = chart.series.push(am5xy.LineSeries.new(root, {
      name: 'Ingresos',
      xAxis: xAxis,
      yAxis: yAxis,
      valueYField: 'value',
      categoryXField: 'category',
    }));
    xAxis.data.setAll(sortedData);
    series.data.setAll(sortedData);

    series.strokes.template.setAll({
      strokeWidth: 2, // Ancho de la línea
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

    // Agregar título
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

    chart.appear(1000, 100);
  }

  private generateBarChart(data: any[], chartId: string, title: string): void {
    const root = am5.Root.new(chartId);
    this.chartRoots.push(root);

    root.setThemes([am5themes_Animated.new(root)]);

    const chart = root.container.children.push(am5xy.XYChart.new(root, {}));
    // Agregar título
    chart.children.unshift(
      am5.Label.new(root, {
        text: title,
        fontSize: 20, // Tamaño de fuente
        fontWeight: "bold", // Negrita
        textAlign: "center", // Alinear al centro
        x: am5.p50, // Centrar horizontalmente
        y: am5.p0, // Espacio superior
        centerX: am5.p50, // Centrar en el contenedor
      })
    );
    const xAxis = chart.xAxes.push(am5xy.CategoryAxis.new(root, {
      categoryField: 'category',
      renderer: am5xy.AxisRendererX.new(root, {
        minGridDistance: 30,
      })
    }));
    const yAxis = chart.yAxes.push(am5xy.ValueAxis.new(root, {
      renderer: am5xy.AxisRendererY.new(root, {}),
    }));
    const series = chart.series.push(am5xy.ColumnSeries.new(root, {
      name: 'Deuda',
      xAxis: xAxis,
      yAxis: yAxis,
      valueYField: 'value',
      categoryXField: 'category',
    }));
    xAxis.data.setAll(data);
    series.data.setAll(data);
    series.bullets.push(() =>
      am5.Bullet.new(root, {
        locationY: 1,
        sprite: am5.Label.new(root, {
          text: 'L. {value}',
          centerY: am5.p100,
          centerX: am5.p50,
          populateText: true,
        }),
      })
    );

    // Configurar interactividad
    series.columns.template.setAll({
      tooltipText: "{category}: [bold]{value}[/]",
    });

    // Animar la entrada
    series.appear(1000);
    chart.appear(1000, 100);
  }
}
