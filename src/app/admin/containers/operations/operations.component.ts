import { Component, OnInit } from '@angular/core';
import moment from 'moment';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { DateFilterComponent, LoadingComponent } from 'src/app/shared';
import { OperationsQueries } from '../../services';
import { IExpedientByModalityAndProcedureQuery, IExpedientByProcedureAndCategoryQuery, IExpedientRenovationQuery } from '../../interfaces';
import { Chart } from 'chart.js/auto';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-operations',
  standalone: true,
  imports: [DateFilterComponent, LoadingComponent, CommonModule],
  templateUrl: './operations.component.html',
  styleUrl: './operations.component.scss'
})
export class OperationsComponent implements OnInit {
  public loading = false;
  public start = moment.utc().startOf('month').format('DD-MM-YYYY');
  public end = moment.utc().format('DD-MM-YYYY');
  public expedientsByType: IExpedientRenovationQuery[] = [];
  public expedientsByProcedure: IExpedientByProcedureAndCategoryQuery[] = [];
  public expedientsByModality: IExpedientByModalityAndProcedureQuery[] = [];
  private typeChart: Chart | null = null;
  private procedureChart: Chart | null = null;
  private modalityChart: Chart | null = null;

  constructor(
    private operationQuery: OperationsQueries
  ) {}

  ngOnInit(): void {
    this.getExpedientsByType();
  }

  public filterDates(dates: { startDate: Date | null, endDate: Date | null }): void {
    if(dates.startDate && dates.endDate) {
      this.start = moment.utc(dates.startDate).format('DD-MM-YYYY');
      this.end = moment.utc(dates.endDate).format('DD-MM-YYYY');
      this.getExpedientsByType();
    }
  }

  private getExpedientsByType(): void {
    this.operationQuery.getExpedientsByType(this.start, this.end).subscribe((data) => {
      this.expedientsByType = data;
      this.expedientsByTypeGraph();
    });
    this.operationQuery.getExpedientsByProcedure(this.start, this.end).subscribe((data) => {
      this.expedientsByProcedure = data;
      this.expedientsByProcedureGraph();
    });
    this.operationQuery.getExpedientsByModality(this.start, this.end).subscribe((data) => {
      this.expedientsByModality = data;
      this.expedientByModalityGraph();
    });
  }

  private generateGraphs(): void {
    this.expedientsByProcedureGraph();
    this.expedientsByProcedureGraph();
    this.expedientByModalityGraph();
  }

  private expedientByModalityGraph(): void {
    if(this.modalityChart) {
      this.modalityChart.destroy();
    }
    const chartElem = <HTMLCanvasElement>document.getElementById(`expedients-by-modality`);
    const procedureTypes = Array.from(new Set(this.expedientsByModality.map(stat => stat.procedureType)));
    const categories = Array.from(new Set(this.expedientsByModality.map(stat => stat.modalityOrCategory)));

    const datasets = categories.map((modalityOrCategory) => ({
      label: modalityOrCategory,
      data: procedureTypes.map(type => {
        const stat = this.expedientsByModality.find(item => item.procedureType === type && item.modalityOrCategory === modalityOrCategory);
        return stat ? stat.expedientCount : 0;
      })
    }));
    this.modalityChart = new Chart(chartElem, {
      type: 'bar',
      data: {
        labels: procedureTypes,
        datasets: datasets
      },
      options: {
        maintainAspectRatio: false,
        responsive: true,
        plugins: {
          tooltip: {
            enabled: true
          },
          datalabels: {
            display: (context) => {
              return context.datasetIndex === datasets.length - 1;
            },
            color: 'black',
            anchor: 'end',
            align: 'end',
            formatter: (value, context) => {
              const index = context.dataIndex;
              const total = datasets.reduce((sum, dataset) => sum + dataset.data[index], 0);
              return total;
            }
          },
          title: {
            display: true,
            text: 'Expedientes por Procedimiento',
            font: { size: 20 }
          }
        },
        scales: {
          x: {
            stacked: true
          },
          y: {
            beginAtZero: true,
            stacked: true
          }
        }
      },
      plugins: [ChartDataLabels]
    });
  }

  private expedientsByProcedureGraph(): void {
    if(this.procedureChart) {
      this.procedureChart.destroy();
    }
    const chartElem = <HTMLCanvasElement>document.getElementById(`expedients-by-procedure`);
    const procedureTypes = Array.from(new Set(this.expedientsByProcedure.map(stat => stat.procedureType)));
    const categories = Array.from(new Set(this.expedientsByProcedure.map(stat => stat.category)));

    const datasets = categories.map((category) => ({
      label: category,
      data: procedureTypes.map(type => {
        const stat = this.expedientsByProcedure.find(item => item.procedureType === type && item.category === category);
        return stat ? stat.expedientCount : 0;
      })
    }));
    this.procedureChart = new Chart(chartElem, {
      type: 'bar',
      data: {
        labels: procedureTypes,
        datasets: datasets
      },
      options: {
        maintainAspectRatio: false,
        responsive: true,
        plugins: {
          tooltip: {
            enabled: true
          },
          datalabels: {
            display: (context) => {
              return context.datasetIndex === datasets.length - 1;
            },
            color: 'black',
            anchor: 'end',
            align: 'end',
            formatter: (value, context) => {
              const index = context.dataIndex;
              const total = datasets.reduce((sum, dataset) => sum + dataset.data[index], 0);
              return total;
            }
          },
          title: {
            display: true,
            text: 'Expedientes por Procedimiento',
            font: { size: 20 }
          }
        },
        scales: {
          x: {
            stacked: true
          },
          y: {
            beginAtZero: true,
            stacked: true
          }
        }
      },
      plugins: [ChartDataLabels]
    });
  }

  private expedientsByTypeGraph(): void {
    if(this.typeChart) {
      this.typeChart.destroy();
    }
    const chartElem = <HTMLCanvasElement>document.getElementById(`expedients-by-type`);

    this.typeChart = new Chart(chartElem, {
      type: 'bar',
      data: {
        labels: this.expedientsByType.map(stat => stat.cityCode),
        datasets: [
          {
            label: 'Proceso Normal',
            data: this.expedientsByType.map(stat => stat.normalProcessExpedientCount),
            backgroundColor: 'rgba(54, 162, 235, 0.6)'
          },
          {
            label: 'Renovación Automática',
            data: this.expedientsByType.map(stat => stat.automaticRenovationExpedientCount),
            backgroundColor: 'rgba(255, 99, 132, 0.6)'
          }
        ]
      },
      options: {
        maintainAspectRatio: false,
        responsive: true,
        plugins:{
          title: {
            display: true,
            text: 'Expedientes por Regional',
            font: { size: 20 }
          }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }
}
