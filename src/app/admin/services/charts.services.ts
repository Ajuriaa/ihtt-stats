import { Injectable } from '@angular/core';
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import * as am5percent from "@amcharts/amcharts5/percent";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";

@Injectable({
  providedIn: 'root'
})
export class ChartService {
  constructor() {}

  // Método para crear un gráfico de barras
  public createBarChart(containerId: string, data: { category: string; value: number }[]): am5.Root {
    const root = am5.Root.new(containerId);

    // Aplicar temas
    root.setThemes([am5themes_Animated.new(root)]);

    // Crear gráfico XY
    const chart = root.container.children.push(
      am5xy.XYChart.new(root, {
        panX: true,
        panY: true,
        wheelX: "panX",
        wheelY: "zoomX",
        layout: root.verticalLayout,
      })
    );

    // Crear ejes
    const xAxis = chart.xAxes.push(
      am5xy.CategoryAxis.new(root, {
        categoryField: "category",
        renderer: am5xy.AxisRendererX.new(root, {}),
      })
    );

    const yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        renderer: am5xy.AxisRendererY.new(root, {}),
      })
    );

    // Crear serie
    const series = chart.series.push(
      am5xy.ColumnSeries.new(root, {
        name: "Value",
        xAxis: xAxis,
        yAxis: yAxis,
        valueYField: "value",
        categoryXField: "category",
      })
    );

    // Configurar datos
    series.data.setAll(data);

    // Animación inicial
    series.appear(1000);
    chart.appear(1000, 100);

    return root;
  }

  // Método para crear un gráfico de pastel
  public createPieChart(containerId: string, data: { category: string; value: number }[]): am5.Root {
    const root = am5.Root.new(containerId);

    root.setThemes([am5themes_Animated.new(root)]);

    const chart = root.container.children.push(
      am5percent.PieChart.new(root, {
        layout: root.verticalLayout,
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
      tooltipText: "{category}: {value}",
    });

    series.appear(1000, 100);

    return root;
  }
}
