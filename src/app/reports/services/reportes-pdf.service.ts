import { Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import moment from 'moment';
import { Certificate, Fine } from 'src/app/admin/interfaces';
import { 
  DashboardGeneralData, 
  PermisosOperacionData, 
  IngresosInstitucionalData,
  ReporteParametros 
} from '../interfaces';

@Injectable({
  providedIn: 'root'
})
export class ReportesPDFService {
  private esPrimeraPagina = false;
  private finalY = 0;

  constructor() {}

  private configurarDocumento(): jsPDF {
    const doc = new jsPDF('landscape');
    doc.setTextColor(40);
    this.esPrimeraPagina = false;
    return doc;
  }

  private crearEncabezadoYPie(
    doc: jsPDF, 
    titulo: string, 
    parametros: ReporteParametros
  ): (data: any) => void {
    const azul = '#88CFE0';
    
    return (data: any) => {
      doc.setFontSize(20);
      const tamanioPagina = doc.internal.pageSize;

      // Encabezado
      if (!this.esPrimeraPagina) {
        data.settings.margin.top = 4;
        const centroX = tamanioPagina.width / 2;
        doc.text(titulo, centroX - (doc.getTextWidth(titulo) / 2), 25);

        doc.addImage('assets/pdf.jpg', 'JPEG', 20, 5, 40, 40);
        doc.addImage('assets/pdf2.jpg', 'JPEG', tamanioPagina.width-50, 2, 40, 40);
        this.esPrimeraPagina = true;
      }

      // Franja lateral
      const margen = 4;
      doc.setFillColor(azul);
      doc.rect(margen, margen, 10, tamanioPagina.height-2*margen, 'F');
      this.finalY = data.cursor?.y || 95;
    };
  }

  private agregarPiesDePagina(
    doc: jsPDF, 
    parametros: ReporteParametros
  ): void {
    const totalPaginas = (doc as any).internal.getNumberOfPages();
    const alturaPie = doc.internal.pageSize.height - 7;

    for(let i = 1; i <= totalPaginas; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.text('Página ' + i + ' de ' + totalPaginas, doc.internal.pageSize.width - 35, alturaPie);
      doc.text('Reporte generado el ' + moment().format('DD/MM/YYYY'), 25, alturaPie);
      
      const textoParametros = this.formatearParametros(parametros);
      if (textoParametros) {
        doc.text('Parámetros: ' + textoParametros, 80, alturaPie);
      }
    }
  }

  private formatearParametros(parametros: ReporteParametros): string {
    const params = [];
    if (parametros.fechaInicio) params.push(`Desde: ${moment(parametros.fechaInicio).format('DD/MM/YYYY')}`);
    if (parametros.fechaFin) params.push(`Hasta: ${moment(parametros.fechaFin).format('DD/MM/YYYY')}`);
    if (parametros.departamento) params.push(`Departamento: ${parametros.departamento}`);
    if (parametros.region) params.push(`Región: ${parametros.region}`);
    return params.join(', ');
  }

  private obtenerFecha(fecha: Date | null | undefined | string): string {
    if (!fecha) {
      return 'NO DISPONIBLE';
    }
    return moment(fecha).format('DD/MM/YYYY');
  }

  private formatearMoneda(cantidad: number | null | undefined): string {
    if (!cantidad) return 'L. 0.00';
    return `L. ${cantidad.toLocaleString('es-HN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  private formatearPorcentaje(valor: number | null | undefined): string {
    if (!valor) return '0.00%';
    return `${valor.toFixed(2)}%`;
  }

  // Método para deduplicar certificados por noticeCode y evitar doble conteo
  private deduplicarCertificados(certificados: Certificate[]): Certificate[] {
    const mapaUnico = new Map<string, Certificate>();
    
    certificados.forEach(cert => {
      const noticeCode = cert.noticeCode?.toString();
      if (noticeCode && !mapaUnico.has(noticeCode)) {
        mapaUnico.set(noticeCode, cert);
      } else if (!noticeCode) {
        // Si no tiene noticeCode, incluirlo de todas formas pero con ID único
        const uniqueId = `no-notice-${Math.random()}`;
        mapaUnico.set(uniqueId, cert);
      }
    });
    
    return Array.from(mapaUnico.values());
  }

  // Método para deduplicar multas por noticeCode y evitar doble conteo
  private deduplicarMultas(multas: Fine[]): Fine[] {
    const mapaUnico = new Map<string, Fine>();
    
    multas.forEach(multa => {
      const noticeCode = multa.noticeCode?.toString();
      if (noticeCode && !mapaUnico.has(noticeCode)) {
        mapaUnico.set(noticeCode, multa);
      } else if (!noticeCode) {
        // Si no tiene noticeCode, incluirlo de todas formas pero con ID único
        const uniqueId = `no-notice-${Math.random()}`;
        mapaUnico.set(uniqueId, multa);
      }
    });
    
    return Array.from(mapaUnico.values());
  }

  // 1. Reporte Dashboard General
  public generarReporteDashboardGeneral(
    datos: DashboardGeneralData, 
    parametros: ReporteParametros
  ): void {
    const doc = this.configurarDocumento();
    const titulo = 'Reporte Dashboard General - Estadísticas Mensuales';

    // Sección 1: Totales Mensuales y Acumulados
    const datosTotales = [
      ['Certificados Emitidos', datos.certificadosEmitidos.toString(), datos.certificadosAcumulados.toString()],
      ['Permisos Otorgados', datos.permisosOtorgados.toString(), datos.permisosAcumulados.toString()],
      ['Multas Aplicadas', datos.multasAplicadas.toString(), datos.multasAcumuladas.toString()],
      ['Ingresos Totales', this.formatearMoneda(datos.ingresosMensuales), this.formatearMoneda(datos.ingresosAcumulados)]
    ];

    autoTable(doc, {
      head: [['Concepto', 'Mensual', 'Acumulado']],
      body: datosTotales,
      startY: 50,
      margin: { top: 45, right: 10, bottom: 20, left: 20 },
      styles: { halign: 'center', valign: 'middle', fontSize: 10 },
      headStyles: { fillColor: '#88CFE0', fontStyle: 'bold' },
      didDrawPage: this.crearEncabezadoYPie(doc, titulo, parametros)
    });

    this.agregarPiesDePagina(doc, parametros);
    doc.output('dataurlnewwindow');
  }

  // 2. Reporte de Certificados
  public generarReporteCertificados(
    certificados: Certificate[], 
    parametros: ReporteParametros
  ): void {
    const doc = this.configurarDocumento();
    const titulo = 'Reporte Detallado de Certificados';

    // DEDUPLICAR POR NOTICECODE PARA EVITAR DOBLE CONTEO
    const certificadosUnicos = this.deduplicarCertificados(certificados);

    const columnas = [
      'Fecha Emisión',
      'Número Certificado',
      'Tipo de Documento',
      'Modalidad',
      'Departamento',
      'Estado',
      'Monto Total',
      'Fecha Vencimiento'
    ];

    const datosFormateados = certificadosUnicos.map(cert => [
      this.obtenerFecha(cert.deliveryDate),
      cert.certificateNumber || 'N/A',
      cert.documentType || 'N/A',
      cert.modality || 'N/A',
      cert.department || 'N/A',
      cert.documentStatus || 'N/A',
      this.formatearMoneda(cert.totalNoticeAmount),
      this.obtenerFecha(cert.certificateExpirationDate)
    ]);

    autoTable(doc, {
      head: [columnas],
      body: datosFormateados,
      margin: { top: 45, right: 10, bottom: 20, left: 20 },
      styles: { halign: 'center', valign: 'middle', fontSize: 8 },
      headStyles: { fillColor: '#88CFE0', fontStyle: 'bold' },
      didDrawPage: this.crearEncabezadoYPie(doc, titulo, parametros)
    });

    this.agregarPiesDePagina(doc, parametros);
    doc.output('dataurlnewwindow');
  }

  // 2b. Reporte de Certificados - Análisis Detallado
  public generarReporteCertificadosAnalisis(
    datosAnalisis: any, 
    parametros: ReporteParametros
  ): void {
    const doc = this.configurarDocumento();
    const titulo = 'Análisis Detallado de Certificados';

    let yPosition = 50;

    // Resumen mensual
    if (datosAnalisis.monthlyBreakdown && datosAnalisis.monthlyBreakdown.length > 0) {
      doc.text('Desglose Mensual', 14, yPosition);
      yPosition += 10;

      const datosMenuales = datosAnalisis.monthlyBreakdown.map((mes: any) => [
        mes.month,
        mes.quantity.toString(),
        this.formatearMoneda(mes.totalAmount),
        this.formatearPorcentaje(mes.variation || 0)
      ]);

      autoTable(doc, {
        head: [['Mes', 'Cantidad', 'Monto Total', 'Variación (%)']],
        body: datosMenuales,
        startY: yPosition,
        margin: { left: 14, right: 14 },
        styles: { halign: 'center', valign: 'middle', fontSize: 9 },
        headStyles: { fillColor: '#88CFE0', fontStyle: 'bold' },
        didDrawPage: this.crearEncabezadoYPie(doc, titulo, parametros)
      });

      yPosition = (doc as any).lastAutoTable.finalY + 15;
    }

    // Clasificación por tipo
    if (datosAnalisis.typeClassification) {
      doc.text('Clasificación por Tipo de Documento', 14, yPosition);
      yPosition += 10;

      const datosTipos = Object.entries(datosAnalisis.typeClassification).map(([tipo, data]: [string, any]) => [
        tipo,
        data.quantity.toString(),
        this.formatearPorcentaje(data.percentage),
        this.formatearMoneda(data.revenue)
      ]);

      autoTable(doc, {
        head: [['Tipo de Documento', 'Cantidad', 'Porcentaje (%)', 'Ingresos']],
        body: datosTipos,
        startY: yPosition,
        margin: { left: 14, right: 14 },
        styles: { halign: 'center', valign: 'middle', fontSize: 9 },
        headStyles: { fillColor: '#FFE082', fontStyle: 'bold' },
        didDrawPage: this.crearEncabezadoYPie(doc, titulo, parametros)
      });

      yPosition = (doc as any).lastAutoTable.finalY + 15;
    }

    // Segmentación departamental
    if (datosAnalisis.departmentSegmentation) {
      doc.text('Segmentación por Departamento', 14, yPosition);
      yPosition += 10;

      const datosDepartamentos = Object.entries(datosAnalisis.departmentSegmentation).map(([dept, data]: [string, any]) => [
        dept,
        data.quantity.toString(),
        this.formatearMoneda(data.revenue)
      ]);

      autoTable(doc, {
        head: [['Departamento', 'Cantidad', 'Ingresos']],
        body: datosDepartamentos,
        startY: yPosition,
        margin: { left: 14, right: 14 },
        styles: { halign: 'center', valign: 'middle', fontSize: 9 },
        headStyles: { fillColor: '#A5D6A7', fontStyle: 'bold' },
        didDrawPage: this.crearEncabezadoYPie(doc, titulo, parametros)
      });

      yPosition = (doc as any).lastAutoTable.finalY + 15;
    }

    // Observaciones técnicas
    if (datosAnalisis.observations && datosAnalisis.observations.length > 0) {
      // Verificar si necesitamos nueva página
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }

      doc.text('Observaciones Técnicas', 14, yPosition);
      yPosition += 10;

      const observaciones = datosAnalisis.observations.map((obs: any) => [
        this.obtenerFecha(obs.date),
        obs.observation,
        obs.category,
        obs.priority
      ]);

      autoTable(doc, {
        head: [['Fecha', 'Observación', 'Categoría', 'Prioridad']],
        body: observaciones,
        startY: yPosition,
        margin: { left: 14, right: 14 },
        styles: { halign: 'left', valign: 'middle', fontSize: 8 },
        headStyles: { fillColor: '#FFCDD2', fontStyle: 'bold' },
        columnStyles: {
          1: { cellWidth: 'wrap' }
        },
        didDrawPage: this.crearEncabezadoYPie(doc, titulo, parametros)
      });
    }

    this.agregarPiesDePagina(doc, parametros);
    doc.output('dataurlnewwindow');
  }

  // 3. Reporte de Permisos de Operación
  public generarReportePermisosOperacion(
    datos: PermisosOperacionData, 
    parametros: ReporteParametros
  ): void {
    const doc = this.configurarDocumento();
    const titulo = 'Reporte de Permisos de Operación';

    // Clasificación por Tipo de Transporte
    const datosTipoTransporte = datos.tiposTransporte.map(tipo => [
      tipo.nombre,
      tipo.permisos.toString(),
      this.formatearPorcentaje(tipo.variacionMensual)
    ]);

    autoTable(doc, {
      head: [['Tipo de Transporte', 'Permisos Otorgados', 'Variación Mensual (%)']],
      body: datosTipoTransporte,
      startY: 50,
      margin: { top: 45, right: 10, bottom: 20, left: 20 },
      styles: { halign: 'center', valign: 'middle', fontSize: 10 },
      headStyles: { fillColor: '#88CFE0', fontStyle: 'bold' },
      didDrawPage: this.crearEncabezadoYPie(doc, titulo, parametros)
    });

    this.agregarPiesDePagina(doc, parametros);
    doc.output('dataurlnewwindow');
  }

  // 4. Reporte de Multas
  public generarReporteMultas(
    multas: Fine[], 
    parametros: ReporteParametros
  ): void {
    const doc = this.configurarDocumento();
    const titulo = 'Reporte Detallado de Multas';

    // DEDUPLICAR POR NOTICECODE PARA EVITAR DOBLE CONTEO
    const multasUnicas = this.deduplicarMultas(multas);

    const columnas = [
      'Fecha',
      'Placa',
      'Tipo de Infracción',
      'Empresa',
      'Departamento',
      'Estado',
      'Monto',
      'Código Aviso'
    ];

    const datosFormateados = multasUnicas.map(multa => [
      this.obtenerFecha(multa.startDate),
      multa.plate || 'N/A',
      multa.origin || 'N/A',
      multa.companyName || 'N/A',
      multa.department || 'N/A',
      multa.fineStatus || 'N/A',
      this.formatearMoneda(multa.totalAmount),
      multa.noticeCode?.toString() || 'N/A'
    ]);

    autoTable(doc, {
      head: [columnas],
      body: datosFormateados,
      margin: { top: 45, right: 10, bottom: 20, left: 20 },
      styles: { halign: 'center', valign: 'middle', fontSize: 8 },
      headStyles: { fillColor: '#88CFE0', fontStyle: 'bold' },
      didDrawPage: this.crearEncabezadoYPie(doc, titulo, parametros)
    });

    this.agregarPiesDePagina(doc, parametros);
    doc.output('dataurlnewwindow');
  }

  // 5. Reporte de Ingresos Institucionales
  public generarReporteIngresosInstitucionales(
    datos: IngresosInstitucionalData, 
    parametros: ReporteParametros
  ): void {
    const doc = this.configurarDocumento();
    const titulo = 'Reporte de Ingresos Institucionales';

    // Ingresos Consolidados por Fuente
    const datosFuentes = datos.fuentesIngreso.map(fuente => [
      fuente.nombre,
      this.formatearMoneda(fuente.ingresosReales),
      this.formatearMoneda(fuente.ingresosProyectados),
      this.formatearPorcentaje(fuente.porcentajeCumplimiento)
    ]);

    autoTable(doc, {
      head: [['Fuente de Ingreso', 'Ingresos Reales', 'Ingresos Proyectados', '% Cumplimiento']],
      body: datosFuentes,
      startY: 50,
      margin: { top: 45, right: 10, bottom: 20, left: 20 },
      styles: { halign: 'center', valign: 'middle', fontSize: 10 },
      headStyles: { fillColor: '#88CFE0', fontStyle: 'bold' },
      didDrawPage: this.crearEncabezadoYPie(doc, titulo, parametros)
    });

    this.agregarPiesDePagina(doc, parametros);
    doc.output('dataurlnewwindow');
  }
}