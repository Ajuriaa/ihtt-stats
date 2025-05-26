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
import { Certificate } from '../../interfaces';
import * as am5 from '@amcharts/amcharts5';
import * as am5percent from "@amcharts/amcharts5/percent";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import * as am5xy from "@amcharts/amcharts5/xy";
import { PrimaryButtonComponent } from "../../../shared/buttons/components/primary-button/primary-button.component";
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    DateFilterComponent, MatFormFieldModule, MatOptionModule, MatSelectModule, CommonModule, FormsModule,
    MatCardModule, LoadingComponent, PrimaryButtonComponent, MatInputModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  public loading = false;
  public certificates: Certificate[] = [];
  public analytics: any = null;
  public totalPaid = 0;
  public totalOwed = 0;
  public rtn = '';
  public upcomingExpirations = 0;
  public totalPaidLast12Months = 0;
  public totalProjectedNext12Months = 0;
  public start = moment.utc().startOf('month').format('YYYY-MM-DD');
  public end = moment.utc().format('YYYY-MM-DD');
  public dateType = 'certificateExpiration';
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
      this.dateType = dates.dateType || 'certificateExpiration';
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
    }
  }

  // Fetch data from API and update UI
  public fetchDashboard(): void {
    this.loading = true;
    
    this.dashboardQueries.getDashboardAnalytics({
      startDate: this.start,
      endDate: this.end,
      dateType: this.dateType
    }).subscribe((response) => {
      this.analytics = response;
      this.updateKPIsFromAnalytics();
      this.generateGraphsFromAnalytics();
      this.loading = false;
    });
  }

  public onSubmit(): void {
    this.loading = true;

    // Construir parámetros para la consulta
    const params: any = {
      modality: this.selectedModality || undefined,
      department: this.selectedDepartment || undefined,
      noticeStatus: this.selectedNoticeStatus || undefined,
      startDate: this.start || undefined,
      endDate: this.end || undefined,
      dateType: this.dateType || undefined,
      rtn: this.rtn !== '' ? this.rtn : undefined
    };

    // Limpiar parámetros: elimina claves con valores undefined
    const cleanedParams = Object.fromEntries(
      Object.entries(params).filter(([_, value]) => value !== undefined)
    );

    // Llamar al servicio con los parámetros construidos
    this.dashboardQueries.getDashboardAnalytics(cleanedParams).subscribe((response) => {
      this.analytics = response;
      this.updateKPIsFromAnalytics();
      this.generateGraphsFromAnalytics();
      this.loading = false;
    });
  }

  private updateKPIsFromAnalytics(): void {
    if (!this.analytics?.kpis) return;
    
    this.totalPaid = this.analytics.kpis.totalPaid;
    this.totalOwed = this.analytics.kpis.totalOwed;
    this.upcomingExpirations = this.analytics.kpis.upcomingExpirations;
    this.totalPaidLast12Months = this.analytics.kpis.totalPaidLast12Months;
    this.totalProjectedNext12Months = this.analytics.kpis.totalProjectedNext12Months;
  }

  private generateGraphsFromAnalytics(): void {
    if (!this.analytics?.chartData) return;

    // Limpia gráficos anteriores antes de generar nuevos
    this.chartRoots.forEach(root => root.dispose());
    this.chartRoots = [];

    const { chartData } = this.analytics;

    // Convert backend data to chart format
    const pieChartData = Object.entries(chartData.debtDistribution).map(([status, amount]) => ({
      category: status,
      value: amount as number,
    }));

    const barChartData = Object.entries(chartData.debtByDepartment).map(([department, amount]) => ({
      category: department,
      value: amount as number,
    }));

    const lineChartData = Object.entries(chartData.paidByMonth).map(([month, amount]) => ({
      category: month,
      value: amount as number,
    }));

    console.log('Raw projection data:', chartData.projectionsByMonth);
    
    const projectionChartData = Object.entries(chartData.projectionsByMonth)
      .sort(([a], [b]) => moment(a, "MM-YYYY").unix() - moment(b, "MM-YYYY").unix())
      .map(([month, amount]) => ({
        category: month,
        value: amount as number,
      }));
      
    console.log('Processed projection chart data:', projectionChartData);

    const modalityChartData = Object.entries(chartData.certificateByModality).map(([modality, data]: [string, any]) => ({
      modality,
      active: data.active,
      paid: data.paid
    }));

    this.generateBarChart(barChartData);
    this.generateLineChart(lineChartData);
    this.generatePieChart(pieChartData);
    
    console.log('About to generate projection chart with data:', projectionChartData);
    if (projectionChartData.length > 0) {
      this.generateProjectionChart(projectionChartData);
    } else {
      console.warn('No projection data available for chart generation');
    }
    
    this.generateCertificatesByModalityChart(modalityChartData);
  }



  private generateProjectionChart(data: { category: string; value: number }[]): void {
    console.log('generateProjectionChart called with data:', data);
    
    try {
      const rootProjection = am5.Root.new("projectionsChart");
      this.chartRoots.push(rootProjection);

    rootProjection.setThemes([am5themes_Animated.new(rootProjection)]);

    const chart = rootProjection.container.children.push(
      am5xy.XYChart.new(rootProjection, {
        layout: rootProjection.verticalLayout,
      })
    );

    const xAxis = chart.xAxes.push(
      am5xy.CategoryAxis.new(rootProjection, {
        categoryField: "category",
        renderer: am5xy.AxisRendererX.new(rootProjection, {
          minGridDistance: 50,
        }),
      })
    );

    const yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(rootProjection, {
        renderer: am5xy.AxisRendererY.new(rootProjection, {}),
        min: 0,
      })
    );

    const sortedData = data
    .map(item => ({
      ...item,
      sortDate: moment(item.category, "MM-YYYY").toDate().getTime(), // Fecha numérica para ordenar
    }))
    .sort((a, b) => a.sortDate - b.sortDate)
    .map(({ category, value }) => ({ category, value })); // Elimina la propiedad auxiliar después de ordenar


    // Configurar categorías ordenadas en el eje X
    xAxis.data.setAll(sortedData);

    const series = chart.series.push(
      am5xy.ColumnSeries.new(rootProjection, {
        name: "Proyección de Ingresos",
        xAxis: xAxis,
        yAxis: yAxis,
        valueYField: "value",
        categoryXField: "category",
      })
    );

    series.data.setAll(sortedData);

    series.columns.template.setAll({
      tooltipText: "{category}: [bold]{value}[/]",
      fill: am5.color(0x4caf50), // Color verde
      stroke: am5.color(0x4caf50),
    });

    series.bullets.push(() =>
      am5.Bullet.new(rootProjection, {
        locationY: 1, // Coloca la etiqueta encima de la barra
        sprite: am5.Label.new(rootProjection, {
          populateText: true,
          text: "L. {valueY}", // Muestra el valor dinámico
          fontSize: 12,
          fontWeight: "bold", // Texto en negrita
          fill: am5.color(0x000000), // Color negro
          centerY: am5.p100, // Alinea la etiqueta arriba de la barra
          centerX: am5.p50, // Centra horizontalmente
        }),
      })
    );

    // Forzar visualización de barras con valor 0
    series.columns.template.setAll({
      minWidth: 5, // Define un ancho mínimo para todas las barras
      tooltipText: "{category}: [bold]{valueY}[/]",
      strokeOpacity: 0, // Evita bordes si no los quieres
    });

    // Agregar título
    chart.children.unshift(
      am5.Label.new(rootProjection, {
        text: "Proyección de Ingresos Mensuales",
        fontSize: 20,
        fontWeight: "bold",
        textAlign: "center",
        x: am5.p50,
        centerX: am5.p50,
      })
    );

    chart.appear(1000, 100);
    console.log('Projection chart generated successfully');
    
    } catch (error) {
      console.error('Error generating projection chart:', error);
    }
  }

  private generateCertificatesByModalityChart(data: any[]): void {
    const root = am5.Root.new('modalityChart');
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
        text: 'Certificados por Modalidad',
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
        categoryField: 'modality',
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

    // Crear serie para ACTIVO
    const activeSeries = chart.series.push(
      am5xy.ColumnSeries.new(root, {
        name: 'Deuda (ACTIVO)',
        stacked: true,
        xAxis: xAxis,
        yAxis: yAxis,
        valueYField: 'active',
        categoryXField: 'modality',
      })
    );

    // Crear serie para PAGADO
    const paidSeries = chart.series.push(
      am5xy.ColumnSeries.new(root, {
        name: 'Generado (PAGADO)',
        stacked: true,
        xAxis: xAxis,
        yAxis: yAxis,
        valueYField: 'paid',
        categoryXField: 'modality',
      })
    );

    activeSeries.data.setAll(data);
    paidSeries.data.setAll(data);

    // Configurar tooltips
    [activeSeries, paidSeries].forEach(series => {
      series.columns.template.setAll({
        tooltipText: 'Pagado: L. {paid}\nActivo: L. {active}',
        tooltipY: 0
      });
    });

    // Agregar leyenda
    const legend = chart.children.push(
      am5.Legend.new(root, {
        centerX: am5.p50,
        x: am5.p50,
      })
    );

    legend.data.setAll([activeSeries, paidSeries]);
    chart.appear(1000, 100);
  }

  private generateLineChart(data: { category: string, value: number }[]): void {
    const rootLine = am5.Root.new("monthlyRevenueChart");
    this.chartRoots.push(rootLine);

    rootLine.setThemes([am5themes_Animated.new(rootLine)]);

    const chart = rootLine.container.children.push(
      am5xy.XYChart.new(rootLine, {
        layout: rootLine.verticalLayout,
      })
    );

    const xAxis = chart.xAxes.push(
      am5xy.CategoryAxis.new(rootLine, {
        categoryField: "category",
        renderer: am5xy.AxisRendererX.new(rootLine, {}),
      })
    );

    const yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(rootLine, {
        renderer: am5xy.AxisRendererY.new(rootLine, {}),
        min: 0, // Asegura que el eje Y comience desde 0
      })
    );

    const sortedData = data.sort((a, b) => {
      return new Date(a.category).getTime() - new Date(b.category).getTime();
    });

    xAxis.data.setAll(sortedData); // Configurar categorías en el eje X

    const series = chart.series.push(
      am5xy.LineSeries.new(rootLine, {
        name: "Recaudación Mensual",
        xAxis: xAxis,
        yAxis: yAxis,
        valueYField: "value",
        categoryXField: "category",
      })
    );

    series.data.setAll(sortedData);

    series.strokes.template.setAll({
      strokeWidth: 2, // Ancho de la línea
    });

    series.bullets.push(() =>
      am5.Bullet.new(rootLine, {
        locationY: 0.5,
        sprite: am5.Circle.new(rootLine, {
          radius: 5,
          fill: rootLine.interfaceColors.get("background"),
          stroke: series.get("fill"),
          strokeWidth: 2,
          tooltipText: "{category}: [bold]{valueY}[/]"
        }),
      })
    );

    // Agregar título
    chart.children.unshift(
      am5.Label.new(rootLine, {
        text: "Tendencia de Recaudación Mensual",
        fontSize: 20,
        fontWeight: "bold",
        textAlign: "center",
        x: am5.p50,
        centerX: am5.p50,
      })
    );

    chart.appear(1000, 100);
  }


  private generateBarChart(data: { category: string, value: number }[]): void {
    const rootBar = am5.Root.new("debtByDepartmentChart");
    this.chartRoots.push(rootBar);

    rootBar.setThemes([am5themes_Animated.new(rootBar)]);

    const chart = rootBar.container.children.push(
      am5xy.XYChart.new(rootBar, {
        layout: rootBar.verticalLayout,
      })
    );

    // Agregar título
    chart.children.unshift(
      am5.Label.new(rootBar, {
        text: "Distribución de Deuda por Departamento",
        fontSize: 20, // Tamaño de fuente
        fontWeight: "bold", // Negrita
        textAlign: "center", // Alinear al centro
        x: am5.p50, // Centrar horizontalmente
        centerX: am5.p50, // Centrar en el contenedor
      })
    );

    const xAxis = chart.xAxes.push(
      am5xy.CategoryAxis.new(rootBar, {
        categoryField: "category",
        renderer: am5xy.AxisRendererX.new(rootBar, {
          minGridDistance: 30,
        }),
      })
    );
    xAxis.data.setAll(data);

    const yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(rootBar, {
        renderer: am5xy.AxisRendererY.new(rootBar, {}),
      })
    );

    const series = chart.series.push(
      am5xy.ColumnSeries.new(rootBar, {
        name: "Deuda",
        xAxis: xAxis,
        yAxis: yAxis,
        valueYField: "value",
        categoryXField: "category",
      })
    );

    // Configurar datos
    series.data.setAll(data);

    // Configurar interactividad
    series.columns.template.setAll({
      tooltipText: "{category}: [bold]{value}[/]",
    });

    // Animar la entrada
    series.appear(1000);
    chart.appear(1000, 100);
  }

  private generatePieChart(data: { category: string, value: number }[]): void {
    const root = am5.Root.new("debtDistributionChart");
    this.chartRoots.push(root);

    root.setThemes([am5themes_Animated.new(root)]);

    const chart = root.container.children.push(
      am5percent.PieChart.new(root, {
        layout: root.verticalLayout,
      })
    );

    // Agregar título
    chart.children.unshift(
      am5.Label.new(root, {
        text: "Distribución por Estado del Aviso",
        fontSize: 20, // Tamaño de fuente
        fontWeight: "bold", // Negrita
        textAlign: "center", // Alinear al centro
        x: am5.p50, // Centrar horizontalmente
        centerX: am5.p50, // Centrar en el contenedor
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

}
