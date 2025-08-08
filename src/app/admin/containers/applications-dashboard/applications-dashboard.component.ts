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
import { MatAutocompleteModule } from '@angular/material/autocomplete';

@Component({
  selector: 'app-applications-dashboard',
  standalone: true,
  imports: [
    DateFilterComponent, MatFormFieldModule, MatOptionModule, MatSelectModule, CommonModule, FormsModule,
    MatCardModule, LoadingComponent, PrimaryButtonComponent, MatInputModule, MatAutocompleteModule
  ],
  templateUrl: './applications-dashboard.component.html',
  styleUrls: ['./applications-dashboard.component.scss']
})
export class ApplicationsDashboardComponent implements OnInit, OnDestroy {
  public loading = false;
  public applications: Application[] = [];
  public analytics: ApplicationAnalytics | null = null;
  public totalApplications = 0;
  public activeApplications = 0;
  public finalizedApplications = 0;
  public inactiveApplications = 0;
  public errorApplications = 0;
  public estado020Applications = 0;
  public automaticRenewals = 0;
  public manualApplications = 0;
  public applicantName = '';
  public companyName = '';
  public start = moment.utc().startOf('month').format('YYYY-MM-DD');
  public end = moment.utc().format('YYYY-MM-DD');
  
  // Filter options from documentation
  public fileStatuses: string[] = [
    'ACTIVO',
    'ESTADO-020', 
    'INACTIVO',
    'RETROTRAIDO POR ERROR DE USUARIO',
    'FINALIZADO'
  ];
  
  public procedureTypes: string[] = [
    'NUEVO',
    'MODIFICACIÓN',
    'RENOVACIÓN',
    'REPOSICIÓN',
    'CANCELACIÓN',
    'DENUNCIA',
    'HISTORICO DGT',
    'INCREMENTO',
    'AUTORIZACION',
    'SUSPENSIÓN',
    'RENUNCIA',
    'OPOSICIÓN',
    'IMPUGNACIÓN'
  ];
  
  public categories: string[] = [
    'BUS NACIONAL EJECUTIVO AEROPORTUARIO',
    'TAXI DIRECTO O DE BARRIDO',
    'CARGA GENERAL',
    'MOTOTAXI',
    'CARGA PRIVADA GENERAL',
    'BUS INTERURBANO REGULAR',
    'CARGA GENERAL REMOLQUE/PLATAFORMA',
    'DENUNCIA',
    'TRANSPORTE DE GRUPO RELIGIOSOS',
    'TRANSPORTE DE TURISMO',
    'CARGA ESPECIALIZADA REMOLQUE',
    'BUS URBANO REGULAR',
    'TRANSPORTE DE ESTUDIANTES',
    'TRANSPORTE DE TRABAJADORES',
    'CARGA PRIVADA GENERAL REMOLQUE/PLATAFORMA',
    'HISTORICO DGT',
    'BUS URBANO RÁPIDO',
    'TRANSPORTE DE GRUPO  EXCURSIONES',
    'TAXI COLECTIVO O DE PUNTO',
    'CARGA ESPECIALIZADA NO ARTICULADA',
    'INTERNACIONAL DE CARGA EN TRANSITO POR HONDURAS.',
    'CARGA PRIVADA ESPECIALIZADA',
    'CERTIFICACION DE TALLER',
    'BUS SUB URBANO REGULAR',
    'BUS INTERNACIONAL CON DESTINO/SALIDA HONDURAS',
    'CARGA PRIVADA ESPECIALIZADA REMOLQUE',
    'BUS INTERURBANO EJECUTIVO',
    'TAXI EJECUTIVO AEROPORTUARIO',
    'TRANSPORTE DE GRUPOS SOCIALES',
    'BUS DE TRANSPORTE RÁPIDO',
    'BUS CO URBANO',
    'BUS INTERURBANO DIRECTO',
    'AUTORIZACION DE ESCUELA PRIVADA DE PILOTOS - ESCUELA NACIONAL DE TRANSPORTE TERRESTRE',
    'PROCEDIMIENTO DE OFICIO',
    'TAXI SERVICIO DE RADIO',
    'TAXI SERVICIO EJECUTIVO',
    'AUTORIZACIÓN Y REGISTRO DE CONSORCIO OPERATIVO',
    'TRANSPORTE PRIVADO DE CARGA',
    'BUS URBANO EJECUTIVO',
    'INTERNACIONAL DE CARGA CON DESTINO/SALIDA DE HONDURAS',
    'TRANSPORTE DE EQUIPO Y MAQUINARIA AGRÍCOLA',
    'BUS INTERNACIONAL EN TRANSITO POR HONDURAS',
    'TRANSPORTE GRUA',
    'PERFORADORA Y SIMILARES',
    'DICTAMEN TÉCNICO PRE-CERTIFICACIÓN',
    'BUS SUB URBANO RÁPIDO',
    'MOTOCARGA',
    'CARGA GENERAL NO ARTICULADA'
  ];
  
  public procedureClasses: string[] = [
    'PERMISO DE EXPLOTACIÓN',
    'CAMBIO DE PLACA',
    'CERTIFICADO DE OPERACIÓN',
    'INCREMENTO DE CERTIFICADO DE OPERACIÓN AL PERMISO DE EXPLOTACION',
    'DESVINCULACION DE UNIDAD',
    'ESTUDIO DE FACTIBILIDAD',
    'PERMISO ESPECIAL PARA EL SERVICIO DE TRANSPORTE ESPECIAL',
    'LEGALIZACIÓN',
    'CAMBIO DE UNIDAD',
    'DENUNCIA TRANSPORTISTA',
    'CESIÓN DE DERECHO POR RAZÓN DE CENSO',
    'CANTIDAD DE PASAJEROS',
    'CESIÓN DE DERECHO',
    'SOCIO',
    'CAMBIO DE EJES',
    'CAMBIO DE MOTOR',
    'DENUNCIA CIUDADANA',
    'RAZON SOCIAL O DENOMINACION SOCIAL',
    'CAMBIO DE CATEGORIA',
    'DENUNCIA PERDIDA/EXTRAVIO C.O/P.E',
    'HISTORICO DGT',
    'CAMBIOS DE HORARIOS',
    'CAMBIO DE TARIFA',
    'CAMBIO DE RUTA',
    'CERTIFICACION DE TALLER AUTOMOTRIZ MIXTO',
    'CAMBIO DE COLOR',
    'RECORTE DE RUTA',
    'CAMBIO DE TIPO DE VEHICULO',
    'EXTENSION DE RUTA',
    'CERTIFICACION DE TALLER AUTOMOTRIZ PUBLICO',
    'CERTIFICACION DE TALLER AUTOMOTRIZ PRIVADO',
    'CERTIFICADO DE OPERACIÓN PROCESO PERIODO TAXI',
    'PERMISO DE EXPLOTACIÓN PROCESO PERIODO TAXI',
    'CAMBIO DE PILOTO',
    'AUTORIZACION DE ESCUELA PRIVADA DE PILOTOS - ESCUELA NACIONAL DE TRANSPORTE TERRESTRE',
    'RECONSTRUCCIÓN DE EXPEDIENTE',
    'RECTIFICACION DE CERTIFICADO DE OPERACION O PERMISO DE EXPLOTACION',
    'CAMBIO DE CHASIS',
    'CODIGO ADUANERO HN',
    'UNIFICACION DE PERMISOS DE EXPLOTACION CON INCORPORACION DE CERTIFICADOS DE OPERACIÓN',
    'PROCEDIMIENTO DE OFICIO IHTT',
    'TEMPORAL',
    'INCLUSION DE PUNTOS INTERMEDIOS',
    'REPRESENTANTE  LEGAL',
    'AUTORIZACIÓN Y REGISTRO DE CONSORCIO OPERATIVO',
    'CAMBIO DE CARROCERIA',
    'CAMBIO DE DESCRIPCION',
    'PROCEDIMIENTO DE DESVINCULACION DE UNIDAD DE OFICIO IHTT',
    'DESBLOQUEO DE VEHICULO',
    'DENUNCIA INCUMPLIMIENTO TARIFAS MÍNIMAS',
    'DICTAMEN TÉCNICO PRE-CERTIFICACIÓN',
    'TARJETA INTELIGENTE',
    'SOLICITUD APROBACIÓN E INSCRIPCIÓN DE CONTRATO',
    'PERMISO EVENTUAL PARA OPERAR CARGA SOBREDIMENSIONADA',
    'BENEFICIO DE REACTIVACION',
    'COMPENSACION DE TASA UNICA VEHICULAR ANUAL',
    'CAMBIOS DE ITINERARIOS',
    'INCORPORACION AL PROYECTO TAXI ROSA',
    'CERTIFICADO UNIFICACION DE FECHAS',
    'CONVERSIÓN  DE SISTEMA DE COMBUSTION',
    'PERMISO DE EXPLOTACION UNIFICACION DE FECHAS',
    'PERMISO ESPECIAL EVENTUAL',
    'PETICIÓN DE CENSO STPP',
    'REGULARIZACION DE LA PROPIEDAD DE LA CONCESION',
    'SOLICITUD EN TRAMITE',
    'ACTO ADMINISTRATIVO EMITIDO'
  ];
  
  public cityOptions: string[] = [
    'Regional SPS',
    'Regional TGU', 
    'Regional CHO',
    'Regional CEI'
  ];
  public renewalStates = [
    { value: true, label: 'Sí' },
    { value: false, label: 'No' }
  ];

  public selectedFileStatus = '';
  public selectedProcedureType = '';
  public selectedProcedureClass = '';
  public selectedCategory = '';
  public selectedCityCode = '';
  public selectedRenewalState: boolean | null = null;
  
  // Filtered options for autocomplete
  public filteredCategories = this.categories;
  public filteredProcedureClasses = this.procedureClasses;
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
      case 'procedureClass':
        this.selectedProcedureClass = value || '';
        break;
      case 'category':
        this.selectedCategory = value || '';
        break;
      case 'cityCode':
        this.selectedCityCode = value || '';
        break;
      case 'renewalState':
        this.selectedRenewalState = value !== '' ? value : null;
        break;
    }
  }
  
  public filterCategories(value: string): void {
    if (!value) {
      this.filteredCategories = this.categories;
      return;
    }
    this.filteredCategories = this.categories.filter(category =>
      category.toLowerCase().includes(value.toLowerCase())
    );
  }
  
  public filterProcedureClasses(value: string): void {
    if (!value) {
      this.filteredProcedureClasses = this.procedureClasses;
      return;
    }
    this.filteredProcedureClasses = this.procedureClasses.filter(procedureClass => 
      procedureClass.toLowerCase().includes(value.toLowerCase())
    );
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
      procedureTypeDescription: this.selectedProcedureType || undefined,
      procedureClassDescription: this.selectedProcedureClass || undefined,
      categoryDescription: this.selectedCategory || undefined,
      cityCode: this.selectedCityCode || undefined,
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
    this.activeApplications = this.analytics.kpis.activeApplications;
    this.finalizedApplications = this.analytics.kpis.finalizedApplications;
    this.inactiveApplications = this.analytics.kpis.inactiveApplications;
    this.errorApplications = this.analytics.kpis.errorApplications;
    this.estado020Applications = this.analytics.kpis.estado020Applications;
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
      category: this.formatMonthLabel(month),
      value: count as number,
      rawMonth: month
    }));

    const renewalChartData = Object.entries(chartData.renewalTypeDistribution).map(([type, count]) => ({
      category: type === 'AUTOMATICA' ? 'Automática' : 'Manual',
      value: count as number,
    }));

    const serviceClassChartData = Object.entries(chartData.serviceClassDistribution).map(([serviceClass, count]) => ({
      category: this.getLastTwoWords(serviceClass), // Short label for display
      fullCategory: serviceClass, // Full text for tooltips
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
      // Sort by rawMonth if available, otherwise by category
      const dateA = (a as any).rawMonth ? (a as any).rawMonth + '-01' : a.category + '-01';
      const dateB = (b as any).rawMonth ? (b as any).rawMonth + '-01' : b.category + '-01';
      return new Date(dateA).getTime() - new Date(dateB).getTime();
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

  private formatMonthLabel(month: string): string {
    const [year, monthNum] = month.split('-');
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return `${months[parseInt(monthNum) - 1]} ${year}`;
  }

  private getLastTwoWords(text: string): string {
    const words = text.trim().split(/\s+/);
    if (words.length <= 2) {
      return text;
    }
    return words.slice(-2).join(' ');
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
      tooltipText: "{fullCategory}: [bold]{value}[/] solicitudes", // Use full category in tooltip
      fill: am5.color(0x9c27b0),
      stroke: am5.color(0x9c27b0),
    });

    series.appear(1000);
    chart.appear(1000, 100);
  }
}