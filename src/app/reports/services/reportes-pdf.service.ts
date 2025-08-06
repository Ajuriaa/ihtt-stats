import { Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import moment from 'moment';
import { Certificate, Fine, Application } from 'src/app/admin/interfaces';
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

  // Método para deduplicar permisos eventuales por noticeCode y evitar doble conteo
  private deduplicarEventualPermits(permits: any[]): any[] {
    const mapaUnico = new Map<string, any>();

    permits.forEach(permit => {
      const noticeCode = permit.noticeCode?.toString();
      if (noticeCode && !mapaUnico.has(noticeCode)) {
        mapaUnico.set(noticeCode, permit);
      } else if (!noticeCode) {
        // Si no tiene noticeCode, incluirlo de todas formas pero con ID único
        const uniqueId = `no-notice-${Math.random()}`;
        mapaUnico.set(uniqueId, permit);
      }
    });

    return Array.from(mapaUnico.values());
  }

  // Método para deduplicar solicitudes por applicationId y evitar doble conteo
  private deduplicarSolicitudes(solicitudes: Application[]): Application[] {
    const mapaUnico = new Map<string, Application>();

    solicitudes.forEach(solicitud => {
      const applicationId = solicitud.applicationId?.toString();
      if (applicationId && !mapaUnico.has(applicationId)) {
        mapaUnico.set(applicationId, solicitud);
      } else if (!applicationId) {
        // Si no tiene applicationId, incluirlo de todas formas pero con ID único
        const uniqueId = `no-app-${Math.random()}`;
        mapaUnico.set(uniqueId, solicitud);
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

  // 2c. Reporte de Certificados - Análisis Ejecutivo
  public generarReporteCertificadosAnalisisEjecutivo(
    datosAnalisis: any,
    parametros: ReporteParametros
  ): void {
    const doc = this.configurarDocumento();
    const titulo = 'Reporte Ejecutivo de Certificados - Análisis Integral';

    let yPosition = 50;

    // ======== RESUMEN EJECUTIVO ========
    doc.setFontSize(16);
    doc.setFont('bold');
    doc.text('RESUMEN EJECUTIVO', 20, yPosition);
    yPosition += 15;

    const resumenEjecutivo = [
      ['Total de Certificados Emitidos', datosAnalisis.reportAnalysis.executiveSummary.totalCertificates.toString()],
      ['Ingresos Totales', this.formatearMoneda(datosAnalisis.reportAnalysis.executiveSummary.totalRevenue)],
      ['Tasa de Pago', this.formatearPorcentaje(datosAnalisis.reportAnalysis.executiveSummary.paymentRate)],
      ['Certificados Vigentes', datosAnalisis.reportAnalysis.executiveSummary.validCertificates.toString()],
      ['Vencen en 30 días', datosAnalisis.reportAnalysis.executiveSummary.expiringSoon.toString()],
      ['Período Analizado', `${this.obtenerFecha(datosAnalisis.reportAnalysis.executiveSummary.periodCovered.startDate)} - ${this.obtenerFecha(datosAnalisis.reportAnalysis.executiveSummary.periodCovered.endDate)}`]
    ];

    autoTable(doc, {
      body: resumenEjecutivo,
      startY: yPosition,
      margin: { left: 20, right: 20 },
      styles: { halign: 'left', valign: 'middle', fontSize: 11 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 80 },
        1: { fontStyle: 'normal', cellWidth: 60 }
      },
      theme: 'grid',
      headStyles: { fillColor: '#4CAF50' },
      didDrawPage: this.crearEncabezadoYPie(doc, titulo, parametros)
    });

    yPosition = (doc as any).lastAutoTable.finalY + 20;

    // ======== ANÁLISIS DE INGRESOS ========
    if (yPosition > 230) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(14);
    doc.setFont('bold');
    doc.text('ANÁLISIS DE INGRESOS Y PAGOS', 20, yPosition);
    yPosition += 10;

    const analisisIngresos = [
      ['Certificados Emitidos', datosAnalisis.reportAnalysis.revenueAnalysis.totalIssued.toString()],
      ['Certificados Pagados', datosAnalisis.reportAnalysis.revenueAnalysis.totalPaid.toString()],
      ['Certificados Activos', datosAnalisis.reportAnalysis.revenueAnalysis.totalActive.toString()],
      ['Certificados Anulados', datosAnalisis.reportAnalysis.revenueAnalysis.totalCancelled.toString()],
      ['Tasa de Pago', this.formatearPorcentaje(datosAnalisis.reportAnalysis.revenueAnalysis.paymentRate)],
      ['Ingresos Totales', this.formatearMoneda(datosAnalisis.reportAnalysis.revenueAnalysis.totalRevenue)]
    ];

    autoTable(doc, {
      head: [['Concepto', 'Valor']],
      body: analisisIngresos,
      startY: yPosition,
      margin: { left: 20, right: 20 },
      styles: { halign: 'center', valign: 'middle', fontSize: 10 },
      headStyles: { fillColor: '#FF9800', fontStyle: 'bold' },
      didDrawPage: this.crearEncabezadoYPie(doc, titulo, parametros)
    });

    yPosition = (doc as any).lastAutoTable.finalY + 20;

    // ======== ANÁLISIS DE TENDENCIAS ========
    if (yPosition > 220) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(14);
    doc.setFont('bold');
    doc.text('ANÁLISIS DE TENDENCIAS', 20, yPosition);
    yPosition += 10;

    const tendencias = [
      ['Certificados Mes Actual', datosAnalisis.reportAnalysis.trends.monthOverMonth.current.toString()],
      ['Certificados Mes Anterior', datosAnalisis.reportAnalysis.trends.monthOverMonth.previous.toString()],
      ['Variación Mensual (%)', this.formatearPorcentaje(datosAnalisis.reportAnalysis.trends.monthOverMonth.change)],
      ['Ingresos Mes Actual', this.formatearMoneda(datosAnalisis.reportAnalysis.trends.monthOverMonth.revenue.current)],
      ['Ingresos Mes Anterior', this.formatearMoneda(datosAnalisis.reportAnalysis.trends.monthOverMonth.revenue.previous)],
      ['Variación Interanual (%)', this.formatearPorcentaje(datosAnalisis.reportAnalysis.trends.yearOverYear.change)]
    ];

    autoTable(doc, {
      head: [['Indicador', 'Valor']],
      body: tendencias,
      startY: yPosition,
      margin: { left: 20, right: 20 },
      styles: { halign: 'center', valign: 'middle', fontSize: 10 },
      headStyles: { fillColor: '#2196F3', fontStyle: 'bold' },
      didDrawPage: this.crearEncabezadoYPie(doc, titulo, parametros)
    });

    yPosition = (doc as any).lastAutoTable.finalY + 20;

    // ======== TOP BENEFICIARIOS ========
    if (yPosition > 180 || datosAnalisis.reportAnalysis.topBeneficiaries.length > 5) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(14);
    doc.setFont('bold');
    doc.text('TOP 10 EMPRESAS BENEFICIARIAS', 20, yPosition);
    yPosition += 10;

    const topBeneficiarios = datosAnalisis.reportAnalysis.topBeneficiaries.slice(0, 10).map((beneficiary: any) => [
      beneficiary.companyName,
      beneficiary.rtn,
      beneficiary.certificateCount.toString(),
      this.formatearMoneda(beneficiary.totalAmount)
    ]);

    autoTable(doc, {
      head: [['Empresa', 'RTN', 'Certificados', 'Monto Total']],
      body: topBeneficiarios,
      startY: yPosition,
      margin: { left: 20, right: 20 },
      styles: { halign: 'center', valign: 'middle', fontSize: 9 },
      headStyles: { fillColor: '#4CAF50', fontStyle: 'bold' },
      didDrawPage: this.crearEncabezadoYPie(doc, titulo, parametros)
    });

    yPosition = (doc as any).lastAutoTable.finalY + 20;

    // ======== ANÁLISIS POR MODALIDAD ========
    if (yPosition > 180 || datosAnalisis.reportAnalysis.modalityAnalysis.length > 5) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(14);
    doc.setFont('bold');
    doc.text('ANÁLISIS POR MODALIDAD DE TRANSPORTE', 20, yPosition);
    yPosition += 10;

    const modalidades = datosAnalisis.reportAnalysis.modalityAnalysis.map((ma: any) => [
      ma.modality,
      ma.count.toString(),
      this.formatearMoneda(ma.totalAmount),
      this.formatearPorcentaje(ma.percentage)
    ]);

    autoTable(doc, {
      head: [['Modalidad', 'Cantidad', 'Monto Total', '% del Total']],
      body: modalidades,
      startY: yPosition,
      margin: { left: 20, right: 20 },
      styles: { halign: 'center', valign: 'middle', fontSize: 9 },
      headStyles: { fillColor: '#9C27B0', fontStyle: 'bold' },
      didDrawPage: this.crearEncabezadoYPie(doc, titulo, parametros)
    });

    yPosition = (doc as any).lastAutoTable.finalY + 20;

    // ======== ANÁLISIS DE VENCIMIENTOS ========
    if (yPosition > 180) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(14);
    doc.setFont('bold');
    doc.text('ANÁLISIS DE VENCIMIENTOS', 20, yPosition);
    yPosition += 10;

    const vencimientos = [
      ['Certificados Vigentes', datosAnalisis.reportAnalysis.expirationAnalysis.validCertificates.count.toString(), this.formatearMoneda(datosAnalisis.reportAnalysis.expirationAnalysis.validCertificates.amount)],
      ['Vencen en 30 días', datosAnalisis.reportAnalysis.expirationAnalysis.expiringSoon.count.toString(), '-'],
      ['Vencidos (últimos 90 días)', datosAnalisis.reportAnalysis.expirationAnalysis.expiredRecently.count.toString(), this.formatearMoneda(datosAnalisis.reportAnalysis.expirationAnalysis.expiredRecently.amount)]
    ];

    autoTable(doc, {
      head: [['Estado', 'Cantidad', 'Monto']],
      body: vencimientos,
      startY: yPosition,
      margin: { left: 20, right: 20 },
      styles: { halign: 'center', valign: 'middle', fontSize: 10 },
      headStyles: { fillColor: '#FF5722', fontStyle: 'bold' },
      didDrawPage: this.crearEncabezadoYPie(doc, titulo, parametros)
    });

    yPosition = (doc as any).lastAutoTable.finalY + 20;

    // ======== CERTIFICADOS POR VENCER (TABLA DETALLADA) ========
    if (datosAnalisis.reportAnalysis.expirationAnalysis.expiringSoon.certificates.length > 0) {
      if (yPosition > 150) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(12);
      doc.setFont('bold');
      doc.text('CERTIFICADOS QUE VENCEN EN 30 DÍAS', 20, yPosition);
      yPosition += 10;

      const certificadosVencimiento = datosAnalisis.reportAnalysis.expirationAnalysis.expiringSoon.certificates.map((cert: any) => [
        cert.certificateNumber || 'N/A',
        cert.companyName?.substring(0, 20) || 'N/A',
        this.obtenerFecha(cert.expirationDate),
        cert.daysToExpire.toString() + ' días'
      ]);

      autoTable(doc, {
        head: [['Número Certificado', 'Empresa', 'Fecha Vencimiento', 'Días Restantes']],
        body: certificadosVencimiento,
        startY: yPosition,
        margin: { left: 20, right: 20 },
        styles: { halign: 'center', valign: 'middle', fontSize: 8 },
        headStyles: { fillColor: '#FFC107', fontStyle: 'bold' },
        didDrawPage: this.crearEncabezadoYPie(doc, titulo, parametros)
      });

      yPosition = (doc as any).lastAutoTable.finalY + 20;
    }

    // ======== RENDIMIENTO POR DEPARTAMENTO ========
    if (yPosition > 180 || datosAnalisis.reportAnalysis.departmentPerformance.length > 5) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(14);
    doc.setFont('bold');
    doc.text('RENDIMIENTO POR DEPARTAMENTO', 20, yPosition);
    yPosition += 10;

    const rendimientoDepartamentos = datosAnalisis.reportAnalysis.departmentPerformance.map((dept: any) => [
      dept.department,
      dept.areaName?.substring(0, 20) || 'N/A',
      dept.certificatesIssued.toString(),
      this.formatearMoneda(dept.totalAmount)
    ]);

    autoTable(doc, {
      head: [['Departamento', 'Área', 'Certificados', 'Monto Total']],
      body: rendimientoDepartamentos,
      startY: yPosition,
      margin: { left: 20, right: 20 },
      styles: { halign: 'center', valign: 'middle', fontSize: 9 },
      headStyles: { fillColor: '#607D8B', fontStyle: 'bold' },
      didDrawPage: this.crearEncabezadoYPie(doc, titulo, parametros)
    });

    yPosition = (doc as any).lastAutoTable.finalY + 20;

    // ======== INSIGHTS Y RECOMENDACIONES ========
    if (yPosition > 200) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(14);
    doc.setFont('bold');
    doc.text('INSIGHTS CLAVE', 20, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    doc.setFont('normal');

    if (datosAnalisis.reportAnalysis.insights.length > 0) {
      datosAnalisis.reportAnalysis.insights.forEach((insight: string, index: number) => {
        const textLines = doc.splitTextToSize(`• ${insight}`, 250);
        doc.text(textLines, 25, yPosition);
        yPosition += textLines.length * 5 + 3;
      });
    } else {
      doc.text('• No se identificaron insights significativos para el período analizado.', 25, yPosition);
      yPosition += 8;
    }

    yPosition += 10;

    doc.setFontSize(14);
    doc.setFont('bold');
    doc.text('RECOMENDACIONES ESTRATÉGICAS', 20, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    doc.setFont('normal');

    if (datosAnalisis.reportAnalysis.recommendations.length > 0) {
      datosAnalisis.reportAnalysis.recommendations.forEach((recomendacion: string, index: number) => {
        const textLines = doc.splitTextToSize(`• ${recomendacion}`, 250);
        doc.text(textLines, 25, yPosition);
        yPosition += textLines.length * 5 + 3;
      });
    } else {
      doc.text('• Las métricas actuales se encuentran dentro de parámetros aceptables.', 25, yPosition);
      yPosition += 8;
    }

    // ======== DATOS DE SOPORTE (MUESTRA) ========
    if (datosAnalisis.reportAnalysis.sampleCertificates && datosAnalisis.reportAnalysis.sampleCertificates.length > 0) {
      doc.addPage();
      yPosition = 20;

      doc.setFontSize(14);
      doc.setFont('bold');
      doc.text('DATOS DE SOPORTE - MUESTRA DE CERTIFICADOS', 20, yPosition);
      yPosition += 10;

      const certificadosMuestra = datosAnalisis.reportAnalysis.sampleCertificates.slice(0, 20).map((cert: any) => [
        cert.certificateNumber || 'N/A',
        this.obtenerFecha(cert.deliveryDate),
        cert.modality?.substring(0, 15) || 'N/A',
        cert.concessionaireName?.substring(0, 15) || 'N/A',
        cert.noticeStatusDescription || 'N/A',
        this.formatearMoneda(cert.totalNoticeAmount)
      ]);

      autoTable(doc, {
        head: [['Número', 'Fecha Emisión', 'Modalidad', 'Empresa', 'Estado', 'Monto']],
        body: certificadosMuestra,
        startY: yPosition,
        margin: { left: 20, right: 20 },
        styles: { halign: 'center', valign: 'middle', fontSize: 8 },
        headStyles: { fillColor: '#78909C', fontStyle: 'bold' },
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

  // 4b. Reporte de Multas - Análisis Ejecutivo
  public generarReporteMultasAnalisis(
    datosAnalisis: any,
    parametros: ReporteParametros
  ): void {
    const doc = this.configurarDocumento();
    const titulo = 'Reporte Ejecutivo de Multas - Análisis Integral';

    let yPosition = 50;

    // ======== RESUMEN EJECUTIVO ========
    doc.setFontSize(16);
    doc.setFont('bold');
    doc.text('RESUMEN EJECUTIVO', 20, yPosition);
    yPosition += 15;

    const resumenEjecutivo = [
      ['Total de Multas Procesadas', datosAnalisis.reportAnalysis.executiveSummary.totalFines.toString()],
      ['Ingresos por Multas Cobradas', this.formatearMoneda(datosAnalisis.reportAnalysis.executiveSummary.totalRevenue)],
      ['Deuda Pendiente', this.formatearMoneda(datosAnalisis.reportAnalysis.executiveSummary.outstandingDebt)],
      ['Tasa de Cobro', this.formatearPorcentaje(datosAnalisis.reportAnalysis.executiveSummary.collectionRate)],
      ['Período Analizado', `${this.obtenerFecha(datosAnalisis.reportAnalysis.executiveSummary.periodCovered.startDate)} - ${this.obtenerFecha(datosAnalisis.reportAnalysis.executiveSummary.periodCovered.endDate)}`]
    ];

    autoTable(doc, {
      body: resumenEjecutivo,
      startY: yPosition,
      margin: { left: 20, right: 20 },
      styles: { halign: 'left', valign: 'middle', fontSize: 11 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 80 },
        1: { fontStyle: 'normal', cellWidth: 60 }
      },
      theme: 'grid',
      headStyles: { fillColor: '#4CAF50' },
      didDrawPage: this.crearEncabezadoYPie(doc, titulo, parametros)
    });

    yPosition = (doc as any).lastAutoTable.finalY + 20;

    // ======== ANÁLISIS DE EFICIENCIA DE COBRO ========
    if (yPosition > 230) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(14);
    doc.setFont('bold');
    doc.text('ANÁLISIS DE EFICIENCIA DE COBRO', 20, yPosition);
    yPosition += 10;

    const analisisCobro = [
      ['Multas Emitidas', datosAnalisis.reportAnalysis.collectionAnalysis.totalIssued.toString()],
      ['Multas Cobradas', datosAnalisis.reportAnalysis.collectionAnalysis.totalCollected.toString()],
      ['Multas Pendientes', datosAnalisis.reportAnalysis.collectionAnalysis.totalPending.toString()],
      ['Multas Anuladas', datosAnalisis.reportAnalysis.collectionAnalysis.totalCancelled.toString()],
      ['Eficiencia de Cobro', this.formatearPorcentaje(datosAnalisis.reportAnalysis.collectionAnalysis.collectionRate)]
    ];

    autoTable(doc, {
      head: [['Concepto', 'Cantidad']],
      body: analisisCobro,
      startY: yPosition,
      margin: { left: 20, right: 20 },
      styles: { halign: 'center', valign: 'middle', fontSize: 10 },
      headStyles: { fillColor: '#FF9800', fontStyle: 'bold' },
      didDrawPage: this.crearEncabezadoYPie(doc, titulo, parametros)
    });

    yPosition = (doc as any).lastAutoTable.finalY + 20;

    // ======== ANÁLISIS DE TENDENCIAS ========
    if (yPosition > 220) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(14);
    doc.setFont('bold');
    doc.text('ANÁLISIS DE TENDENCIAS', 20, yPosition);
    yPosition += 10;

    const tendencias = [
      ['Multas Mes Actual', datosAnalisis.reportAnalysis.trends.monthOverMonth.current.toString()],
      ['Multas Mes Anterior', datosAnalisis.reportAnalysis.trends.monthOverMonth.previous.toString()],
      ['Variación Mensual (%)', this.formatearPorcentaje(datosAnalisis.reportAnalysis.trends.monthOverMonth.change)],
      ['Ingresos Mes Actual', this.formatearMoneda(datosAnalisis.reportAnalysis.trends.monthOverMonth.revenue.current)],
      ['Ingresos Mes Anterior', this.formatearMoneda(datosAnalisis.reportAnalysis.trends.monthOverMonth.revenue.previous)],
      ['Variación Interanual (%)', this.formatearPorcentaje(datosAnalisis.reportAnalysis.trends.yearOverYear.change)]
    ];

    autoTable(doc, {
      head: [['Indicador', 'Valor']],
      body: tendencias,
      startY: yPosition,
      margin: { left: 20, right: 20 },
      styles: { halign: 'center', valign: 'middle', fontSize: 10 },
      headStyles: { fillColor: '#2196F3', fontStyle: 'bold' },
      didDrawPage: this.crearEncabezadoYPie(doc, titulo, parametros)
    });

    yPosition = (doc as any).lastAutoTable.finalY + 20;

    // ======== TOP INFRACTORES ========
    if (yPosition > 180 || datosAnalisis.reportAnalysis.topViolators.length > 5) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(14);
    doc.setFont('bold');
    doc.text('TOP 10 EMPRESAS INFRACTORAS', 20, yPosition);
    yPosition += 10;

    const topInfractores = datosAnalisis.reportAnalysis.topViolators.slice(0, 10).map((violator: any) => [
      violator.companyName,
      violator.dniRtn,
      violator.violationCount.toString(),
      this.formatearMoneda(violator.totalAmount)
    ]);

    autoTable(doc, {
      head: [['Empresa', 'RTN', 'Multas', 'Monto Total']],
      body: topInfractores,
      startY: yPosition,
      margin: { left: 20, right: 20 },
      styles: { halign: 'center', valign: 'middle', fontSize: 9 },
      headStyles: { fillColor: '#F44336', fontStyle: 'bold' },
      didDrawPage: this.crearEncabezadoYPie(doc, titulo, parametros)
    });

    yPosition = (doc as any).lastAutoTable.finalY + 20;

    // ======== ANÁLISIS POR TIPO DE INFRACCIÓN ========
    if (yPosition > 180 || datosAnalisis.reportAnalysis.violationTypes.length > 5) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(14);
    doc.setFont('bold');
    doc.text('ANÁLISIS POR TIPO DE INFRACCIÓN', 20, yPosition);
    yPosition += 10;

    const tiposInfraccion = datosAnalisis.reportAnalysis.violationTypes.map((vt: any) => [
      vt.type,
      vt.count.toString(),
      this.formatearMoneda(vt.totalAmount),
      this.formatearPorcentaje((vt.count / datosAnalisis.reportAnalysis.executiveSummary.totalFines) * 100)
    ]);

    autoTable(doc, {
      head: [['Tipo de Infracción', 'Cantidad', 'Monto Total', '% del Total']],
      body: tiposInfraccion,
      startY: yPosition,
      margin: { left: 20, right: 20 },
      styles: { halign: 'center', valign: 'middle', fontSize: 9 },
      headStyles: { fillColor: '#9C27B0', fontStyle: 'bold' },
      didDrawPage: this.crearEncabezadoYPie(doc, titulo, parametros)
    });

    yPosition = (doc as any).lastAutoTable.finalY + 20;

    // ======== ANÁLISIS DE ANTIGÜEDAD DE DEUDA ========
    if (yPosition > 220) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(14);
    doc.setFont('bold');
    doc.text('ANÁLISIS DE ANTIGÜEDAD DE DEUDA', 20, yPosition);
    yPosition += 10;

    const antiguedadDeuda = [
      ['0-30 días', datosAnalisis.reportAnalysis.debtAging.current.count.toString(), this.formatearMoneda(datosAnalisis.reportAnalysis.debtAging.current.amount)],
      ['31-60 días', datosAnalisis.reportAnalysis.debtAging.thirtyDays.count.toString(), this.formatearMoneda(datosAnalisis.reportAnalysis.debtAging.thirtyDays.amount)],
      ['61-90 días', datosAnalisis.reportAnalysis.debtAging.sixtyDays.count.toString(), this.formatearMoneda(datosAnalisis.reportAnalysis.debtAging.sixtyDays.amount)],
      ['Más de 90 días', datosAnalisis.reportAnalysis.debtAging.ninetyDaysPlus.count.toString(), this.formatearMoneda(datosAnalisis.reportAnalysis.debtAging.ninetyDaysPlus.amount)]
    ];

    autoTable(doc, {
      head: [['Rango de Antigüedad', 'Cantidad', 'Monto']],
      body: antiguedadDeuda,
      startY: yPosition,
      margin: { left: 20, right: 20 },
      styles: { halign: 'center', valign: 'middle', fontSize: 10 },
      headStyles: { fillColor: '#FF5722', fontStyle: 'bold' },
      didDrawPage: this.crearEncabezadoYPie(doc, titulo, parametros)
    });

    yPosition = (doc as any).lastAutoTable.finalY + 20;

    // ======== RENDIMIENTO POR EMPLEADO ========
    if (yPosition > 180 || datosAnalisis.reportAnalysis.employeePerformance.length > 5) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(14);
    doc.setFont('bold');
    doc.text('TOP 10 EMPLEADOS POR RENDIMIENTO', 20, yPosition);
    yPosition += 10;

    const rendimientoEmpleados = datosAnalisis.reportAnalysis.employeePerformance.map((emp: any) => [
      emp.employeeId,
      emp.employeeName,
      emp.finesIssued.toString(),
      this.formatearMoneda(emp.totalAmount)
    ]);

    autoTable(doc, {
      head: [['ID Empleado', 'Nombre', 'Multas Emitidas', 'Monto Total']],
      body: rendimientoEmpleados,
      startY: yPosition,
      margin: { left: 20, right: 20 },
      styles: { halign: 'center', valign: 'middle', fontSize: 9 },
      headStyles: { fillColor: '#607D8B', fontStyle: 'bold' },
      didDrawPage: this.crearEncabezadoYPie(doc, titulo, parametros)
    });

    yPosition = (doc as any).lastAutoTable.finalY + 20;

    // ======== INSIGHTS Y RECOMENDACIONES ========
    if (yPosition > 200) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(14);
    doc.setFont('bold');
    doc.text('INSIGHTS CLAVE', 20, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    doc.setFont('normal');

    if (datosAnalisis.reportAnalysis.insights.length > 0) {
      datosAnalisis.reportAnalysis.insights.forEach((insight: string, index: number) => {
        const textLines = doc.splitTextToSize(`• ${insight}`, 250);
        doc.text(textLines, 25, yPosition);
        yPosition += textLines.length * 5 + 3;
      });
    } else {
      doc.text('• No se identificaron insights significativos para el período analizado.', 25, yPosition);
      yPosition += 8;
    }

    yPosition += 10;

    doc.setFontSize(14);
    doc.setFont('bold');
    doc.text('RECOMENDACIONES ESTRATÉGICAS', 20, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    doc.setFont('normal');

    if (datosAnalisis.reportAnalysis.recommendations.length > 0) {
      datosAnalisis.reportAnalysis.recommendations.forEach((recomendacion: string, index: number) => {
        const textLines = doc.splitTextToSize(`• ${recomendacion}`, 250);
        doc.text(textLines, 25, yPosition);
        yPosition += textLines.length * 5 + 3;
      });
    } else {
      doc.text('• Las métricas actuales se encuentran dentro de parámetros aceptables.', 25, yPosition);
      yPosition += 8;
    }

    // ======== DATOS DE SOPORTE (MUESTRA) ========
    if (datosAnalisis.reportAnalysis.sampleFines && datosAnalisis.reportAnalysis.sampleFines.length > 0) {
      doc.addPage();
      yPosition = 20;

      doc.setFontSize(14);
      doc.setFont('bold');
      doc.text('DATOS DE SOPORTE - MUESTRA DE MULTAS', 20, yPosition);
      yPosition += 10;

      const multasMuestra = datosAnalisis.reportAnalysis.sampleFines.slice(0, 20).map((multa: any) => [
        this.obtenerFecha(multa.startDate),
        multa.plate || 'N/A',
        multa.origin || 'N/A',
        multa.companyName?.substring(0, 15) || 'N/A',
        multa.fineStatus || 'N/A',
        this.formatearMoneda(multa.totalAmount)
      ]);

      autoTable(doc, {
        head: [['Fecha', 'Placa', 'Infracción', 'Empresa', 'Estado', 'Monto']],
        body: multasMuestra,
        startY: yPosition,
        margin: { left: 20, right: 20 },
        styles: { halign: 'center', valign: 'middle', fontSize: 8 },
        headStyles: { fillColor: '#78909C', fontStyle: 'bold' },
        didDrawPage: this.crearEncabezadoYPie(doc, titulo, parametros)
      });
    }

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

  public generateEventualPermitsPDF(
    permits: any[],
    parametros: any
  ): void {
    const doc = this.configurarDocumento();
    const titulo = 'Reporte Detallado de Permisos Eventuales';

    const permitsUnicos = this.deduplicarEventualPermits(permits);

    const columnas = [
      'Fecha Sistema',
      'Código Permiso',
      'Solicitante',
      'RTN',
      'Tipo Servicio',
      'Estado',
      'Oficina Regional',
      'Monto',
      'Código Aviso'
    ];

    const datosFormateados = permitsUnicos.map(permit => [
      this.obtenerFecha(permit.systemDate),
      permit.permitCode || 'N/A',
      permit.applicantName || 'N/A',
      permit.rtn || 'N/A',
      permit.serviceTypeDescription || 'N/A',
      permit.permitStatus || 'N/A',
      permit.regionalOffice || 'N/A',
      this.formatearMoneda(permit.amount),
      permit.noticeCode || 'N/A'
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

  // 5b. Reporte de Permisos Eventuales - Análisis Ejecutivo
  public generarReportePermisosEventualesAnalisis(
    datosAnalisis: any,
    parametros: any
  ): void {
    const doc = this.configurarDocumento();
    const titulo = 'Reporte Ejecutivo de Permisos Eventuales - Análisis Integral';

    let yPosition = 50;

    // ======== RESUMEN EJECUTIVO ========
    doc.setFontSize(16);
    doc.setFont('bold');
    doc.text('RESUMEN EJECUTIVO', 20, yPosition);
    yPosition += 15;

    const resumenEjecutivo = [
      ['Total de Permisos Procesados', datosAnalisis.reportAnalysis.executiveSummary.totalPermits.toString()],
      ['Ingresos por Permisos', this.formatearMoneda(datosAnalisis.reportAnalysis.executiveSummary.totalRevenue)],
      ['Tasa de Procesamiento', this.formatearPorcentaje(datosAnalisis.reportAnalysis.executiveSummary.processingRate)],
      ['Permisos Activos', datosAnalisis.reportAnalysis.executiveSummary.activePermits.toString()],
      ['Permisos Procesados', datosAnalisis.reportAnalysis.executiveSummary.processedPermits.toString()],
      ['Período Analizado', `${this.obtenerFecha(datosAnalisis.reportAnalysis.executiveSummary.periodCovered.startDate)} - ${this.obtenerFecha(datosAnalisis.reportAnalysis.executiveSummary.periodCovered.endDate)}`]
    ];

    autoTable(doc, {
      body: resumenEjecutivo,
      startY: yPosition,
      margin: { left: 20, right: 20 },
      styles: { halign: 'left', valign: 'middle', fontSize: 11 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 80 },
        1: { fontStyle: 'normal', cellWidth: 60 }
      },
      theme: 'grid',
      headStyles: { fillColor: '#9C27B0' },
      didDrawPage: this.crearEncabezadoYPie(doc, titulo, parametros)
    });

    yPosition = (doc as any).lastAutoTable.finalY + 20;

    // ======== ANÁLISIS DE EFICIENCIA DE PROCESAMIENTO ========
    if (yPosition > 230) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(14);
    doc.setFont('bold');
    doc.text('ANÁLISIS DE EFICIENCIA DE PROCESAMIENTO', 20, yPosition);
    yPosition += 10;

    const analisisProcesamiento = [
      ['Permisos Solicitados', datosAnalisis.reportAnalysis.processingAnalysis.totalSubmitted.toString()],
      ['Permisos Procesados', datosAnalisis.reportAnalysis.processingAnalysis.totalProcessed.toString()],
      ['Permisos Activos', datosAnalisis.reportAnalysis.processingAnalysis.totalActive.toString()],
      ['Permisos Anulados', datosAnalisis.reportAnalysis.processingAnalysis.totalCancelled.toString()],
      ['Eficiencia de Procesamiento', this.formatearPorcentaje(datosAnalisis.reportAnalysis.processingAnalysis.processingRate)]
    ];

    autoTable(doc, {
      head: [['Concepto', 'Cantidad']],
      body: analisisProcesamiento,
      startY: yPosition,
      margin: { left: 20, right: 20 },
      styles: { halign: 'center', valign: 'middle', fontSize: 10 },
      headStyles: { fillColor: '#9C27B0', fontStyle: 'bold' },
      didDrawPage: this.crearEncabezadoYPie(doc, titulo, parametros)
    });

    yPosition = (doc as any).lastAutoTable.finalY + 20;

    // ======== ANÁLISIS DE TENDENCIAS ========
    if (yPosition > 220) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(14);
    doc.setFont('bold');
    doc.text('ANÁLISIS DE TENDENCIAS', 20, yPosition);
    yPosition += 10;

    const tendencias = [
      ['Permisos Mes Actual', datosAnalisis.reportAnalysis.trends.monthOverMonth.current.toString()],
      ['Permisos Mes Anterior', datosAnalisis.reportAnalysis.trends.monthOverMonth.previous.toString()],
      ['Variación Mensual (%)', this.formatearPorcentaje(datosAnalisis.reportAnalysis.trends.monthOverMonth.change)],
      ['Ingresos Mes Actual', this.formatearMoneda(datosAnalisis.reportAnalysis.trends.monthOverMonth.revenue.current)],
      ['Ingresos Mes Anterior', this.formatearMoneda(datosAnalisis.reportAnalysis.trends.monthOverMonth.revenue.previous)],
      ['Variación Interanual (%)', this.formatearPorcentaje(datosAnalisis.reportAnalysis.trends.yearOverYear.change)]
    ];

    autoTable(doc, {
      head: [['Indicador', 'Valor']],
      body: tendencias,
      startY: yPosition,
      margin: { left: 20, right: 20 },
      styles: { halign: 'center', valign: 'middle', fontSize: 10 },
      headStyles: { fillColor: '#2196F3', fontStyle: 'bold' },
      didDrawPage: this.crearEncabezadoYPie(doc, titulo, parametros)
    });

    yPosition = (doc as any).lastAutoTable.finalY + 20;

    // ======== TOP SOLICITANTES ========
    if (yPosition > 180 || datosAnalisis.reportAnalysis.topApplicants.length > 5) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(14);
    doc.setFont('bold');
    doc.text('TOP 10 SOLICITANTES DE PERMISOS', 20, yPosition);
    yPosition += 10;

    const topSolicitantes = datosAnalisis.reportAnalysis.topApplicants.slice(0, 10).map((applicant: any) => [
      applicant.applicantName,
      applicant.rtn,
      applicant.permitCount.toString(),
      this.formatearMoneda(applicant.totalAmount)
    ]);

    autoTable(doc, {
      head: [['Solicitante', 'RTN', 'Permisos', 'Monto Total']],
      body: topSolicitantes,
      startY: yPosition,
      margin: { left: 20, right: 20 },
      styles: { halign: 'center', valign: 'middle', fontSize: 9 },
      headStyles: { fillColor: '#FF5722', fontStyle: 'bold' },
      didDrawPage: this.crearEncabezadoYPie(doc, titulo, parametros)
    });

    yPosition = (doc as any).lastAutoTable.finalY + 20;

    // ======== ANÁLISIS POR TIPO DE SERVICIO ========
    if (yPosition > 180 || datosAnalisis.reportAnalysis.serviceTypeAnalysis.length > 5) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(14);
    doc.setFont('bold');
    doc.text('ANÁLISIS POR TIPO DE SERVICIO', 20, yPosition);
    yPosition += 10;

    const tiposServicio = datosAnalisis.reportAnalysis.serviceTypeAnalysis.map((sta: any) => [
      sta.serviceType,
      sta.count.toString(),
      this.formatearPorcentaje(sta.percentage),
      this.formatearMoneda(sta.totalAmount)
    ]);

    autoTable(doc, {
      head: [['Tipo de Servicio', 'Cantidad', 'Porcentaje', 'Monto Total']],
      body: tiposServicio,
      startY: yPosition,
      margin: { left: 20, right: 20 },
      styles: { halign: 'center', valign: 'middle', fontSize: 10 },
      headStyles: { fillColor: '#795548', fontStyle: 'bold' },
      didDrawPage: this.crearEncabezadoYPie(doc, titulo, parametros)
    });

    yPosition = (doc as any).lastAutoTable.finalY + 20;

    // ======== RENDIMIENTO POR OFICINA REGIONAL ========
    if (yPosition > 180 || datosAnalisis.reportAnalysis.regionalOfficePerformance.length > 5) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(14);
    doc.setFont('bold');
    doc.text('RENDIMIENTO POR OFICINA REGIONAL', 20, yPosition);
    yPosition += 10;

    const oficinasRegionales = datosAnalisis.reportAnalysis.regionalOfficePerformance.map((rop: any) => [
      rop.regionalOffice,
      rop.permitsProcessed.toString(),
      this.formatearPorcentaje(rop.percentage),
      this.formatearMoneda(rop.totalAmount)
    ]);

    autoTable(doc, {
      head: [['Oficina Regional', 'Permisos', 'Porcentaje', 'Monto Total']],
      body: oficinasRegionales,
      startY: yPosition,
      margin: { left: 20, right: 20 },
      styles: { halign: 'center', valign: 'middle', fontSize: 9 },
      headStyles: { fillColor: '#607D8B', fontStyle: 'bold' },
      didDrawPage: this.crearEncabezadoYPie(doc, titulo, parametros)
    });

    yPosition = (doc as any).lastAutoTable.finalY + 20;

    // ======== INSIGHTS Y RECOMENDACIONES ========
    if (yPosition > 200) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(14);
    doc.setFont('bold');
    doc.text('INSIGHTS Y RECOMENDACIONES ESTRATÉGICAS', 20, yPosition);
    yPosition += 15;

    // Insights
    if (datosAnalisis.reportAnalysis.insights.length > 0) {
      doc.setFontSize(12);
      doc.setFont('bold');
      doc.text('📊 OBSERVACIONES CLAVE:', 20, yPosition);
      yPosition += 10;

      doc.setFontSize(10);
      doc.setFont('normal');
      datosAnalisis.reportAnalysis.insights.forEach((insight: string, index: number) => {
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }
        const textoWrapped = doc.splitTextToSize(`• ${insight}`, 250);
        doc.text(textoWrapped, 25, yPosition);
        yPosition += textoWrapped.length * 5 + 5;
      });

      yPosition += 10;
    }

    // Recomendaciones
    if (datosAnalisis.reportAnalysis.recommendations.length > 0) {
      if (yPosition > 220) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(12);
      doc.setFont('bold');
      doc.text('💡 RECOMENDACIONES ESTRATÉGICAS:', 20, yPosition);
      yPosition += 10;

      doc.setFontSize(10);
      doc.setFont('normal');
      datosAnalisis.reportAnalysis.recommendations.forEach((recommendation: string, index: number) => {
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }
        const textoWrapped = doc.splitTextToSize(`• ${recommendation}`, 250);
        doc.text(textoWrapped, 25, yPosition);
        yPosition += textoWrapped.length * 5 + 5;
      });
    }

    // ======== DATOS DE SOPORTE ========
    if (datosAnalisis.reportAnalysis.samplePermits.length > 0) {
      doc.addPage();
      yPosition = 20;

      doc.setFontSize(14);
      doc.setFont('bold');
      doc.text('MUESTRA DE DATOS DE SOPORTE (PRIMEROS 50 REGISTROS)', 20, yPosition);
      yPosition += 15;

      const datosSoporte = datosAnalisis.reportAnalysis.samplePermits.slice(0, 50).map((permit: any) => [
        this.obtenerFecha(permit.systemDate),
        permit.applicantName || 'N/A',
        permit.rtn || 'N/A',
        permit.serviceTypeDescription || 'N/A',
        permit.permitStatus || 'N/A',
        this.formatearMoneda(permit.amount)
      ]);

      autoTable(doc, {
        head: [['Fecha Sistema', 'Solicitante', 'RTN', 'Tipo Servicio', 'Estado', 'Monto']],
        body: datosSoporte,
        startY: yPosition,
        margin: { left: 20, right: 20 },
        styles: { halign: 'center', valign: 'middle', fontSize: 8 },
        headStyles: { fillColor: '#9E9E9E', fontStyle: 'bold' },
        didDrawPage: this.crearEncabezadoYPie(doc, titulo, parametros)
      });
    }

    this.agregarPiesDePagina(doc, parametros);
    doc.output('dataurlnewwindow');
  }

  // 6. Reporte de Solicitudes
  public generarReporteSolicitudes(
    solicitudes: Application[],
    parametros: ReporteParametros
  ): void {
    const doc = this.configurarDocumento();
    const titulo = 'Reporte Detallado de Solicitudes';

    // DEDUPLICAR POR APPLICATIONID PARA EVITAR DOBLE CONTEO
    const solicitudesUnicas = this.deduplicarSolicitudes(solicitudes);

    const columnas = [
      'Fecha Recepción',
      'Código Solicitud',
      'Solicitante',
      'Empresa',
      'Tipo Procedimiento',
      'Categoría',
      'Estado',
      'Renovación Automática'
    ];

    const datosFormateados = solicitudesUnicas.map(solicitud => [
      this.obtenerFecha(solicitud.receivedDate),
      solicitud.applicationCode || 'N/A',
      solicitud.applicantName || 'N/A',
      solicitud.companyName || 'N/A',
      solicitud.procedureTypeDescription || 'N/A',
      solicitud.categoryDescription || 'N/A',
      solicitud.fileStatus || 'N/A',
      solicitud.isAutomaticRenewal ? 'Sí' : 'No'
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

  // 6b. Reporte de Solicitudes - Análisis Ejecutivo
  public generarReporteSolicitudesAnalisis(
    datosAnalisis: any,
    parametros: ReporteParametros
  ): void {
    const doc = this.configurarDocumento();
    const titulo = 'Reporte Ejecutivo de Solicitudes - Análisis Integral';

    let yPosition = 50;

    // ======== RESUMEN EJECUTIVO ========
    doc.setFontSize(16);
    doc.setFont('bold');
    doc.text('RESUMEN EJECUTIVO', 20, yPosition);
    yPosition += 15;

    const resumenEjecutivo = [
      ['Total de Solicitudes', datosAnalisis.reportAnalysis.executiveSummary.totalApplications.toString()],
      ['Tasa de Aprobación', this.formatearPorcentaje(datosAnalisis.reportAnalysis.executiveSummary.approvalRate)],
      ['Tasa de Rechazo', this.formatearPorcentaje(datosAnalisis.reportAnalysis.executiveSummary.rejectionRate)],
      ['Solicitudes Pendientes', datosAnalisis.reportAnalysis.executiveSummary.pendingApplications.toString()],
      ['Renovaciones Automáticas', this.formatearPorcentaje(datosAnalisis.reportAnalysis.executiveSummary.automaticRenewalRate)],
      ['Período Analizado', `${this.obtenerFecha(datosAnalisis.reportAnalysis.executiveSummary.periodCovered.startDate)} - ${this.obtenerFecha(datosAnalisis.reportAnalysis.executiveSummary.periodCovered.endDate)}`]
    ];

    autoTable(doc, {
      body: resumenEjecutivo,
      startY: yPosition,
      margin: { left: 20, right: 20 },
      styles: { halign: 'left', valign: 'middle', fontSize: 11 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 80 },
        1: { fontStyle: 'normal', cellWidth: 60 }
      },
      theme: 'grid',
      headStyles: { fillColor: '#4CAF50' },
      didDrawPage: this.crearEncabezadoYPie(doc, titulo, parametros)
    });

    yPosition = (doc as any).lastAutoTable.finalY + 20;

    // ======== ANÁLISIS DE PROCESAMIENTO ========
    if (yPosition > 230) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(14);
    doc.setFont('bold');
    doc.text('ANÁLISIS DE PROCESAMIENTO', 20, yPosition);
    yPosition += 10;

    const analisisProcesamiento = [
      ['Solicitudes Totales', datosAnalisis.reportAnalysis.processingAnalysis.totalApplications.toString()],
      ['Solicitudes Pendientes', datosAnalisis.reportAnalysis.processingAnalysis.pendingApplications.toString()],
      ['Solicitudes Aprobadas', datosAnalisis.reportAnalysis.processingAnalysis.approvedApplications.toString()],
      ['Solicitudes Rechazadas', datosAnalisis.reportAnalysis.processingAnalysis.rejectedApplications.toString()],
      ['Solicitudes en Proceso', datosAnalisis.reportAnalysis.processingAnalysis.inProcessApplications.toString()],
      ['Tasa de Aprobación', this.formatearPorcentaje(datosAnalisis.reportAnalysis.processingAnalysis.approvalRate)],
      ['Tasa de Rechazo', this.formatearPorcentaje(datosAnalisis.reportAnalysis.processingAnalysis.rejectionRate)]
    ];

    autoTable(doc, {
      head: [['Concepto', 'Valor']],
      body: analisisProcesamiento,
      startY: yPosition,
      margin: { left: 20, right: 20 },
      styles: { halign: 'center', valign: 'middle', fontSize: 10 },
      headStyles: { fillColor: '#FF9800', fontStyle: 'bold' },
      didDrawPage: this.crearEncabezadoYPie(doc, titulo, parametros)
    });

    yPosition = (doc as any).lastAutoTable.finalY + 20;

    // ======== ANÁLISIS DE TENDENCIAS ========
    if (yPosition > 220) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(14);
    doc.setFont('bold');
    doc.text('ANÁLISIS DE TENDENCIAS', 20, yPosition);
    yPosition += 10;

    const tendencias = [
      ['Solicitudes Mes Actual', datosAnalisis.reportAnalysis.trends.monthOverMonth.current.toString()],
      ['Solicitudes Mes Anterior', datosAnalisis.reportAnalysis.trends.monthOverMonth.previous.toString()],
      ['Variación Mensual (%)', this.formatearPorcentaje(datosAnalisis.reportAnalysis.trends.monthOverMonth.change)],
      ['Solicitudes Año Actual', datosAnalisis.reportAnalysis.trends.yearOverYear.current.toString()],
      ['Solicitudes Año Anterior', datosAnalisis.reportAnalysis.trends.yearOverYear.previous.toString()],
      ['Variación Interanual (%)', this.formatearPorcentaje(datosAnalisis.reportAnalysis.trends.yearOverYear.change)]
    ];

    autoTable(doc, {
      head: [['Indicador', 'Valor']],
      body: tendencias,
      startY: yPosition,
      margin: { left: 20, right: 20 },
      styles: { halign: 'center', valign: 'middle', fontSize: 10 },
      headStyles: { fillColor: '#2196F3', fontStyle: 'bold' },
      didDrawPage: this.crearEncabezadoYPie(doc, titulo, parametros)
    });

    yPosition = (doc as any).lastAutoTable.finalY + 20;

    // ======== ANÁLISIS DE RENOVACIONES ========
    if (yPosition > 220) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(14);
    doc.setFont('bold');
    doc.text('ANÁLISIS DE RENOVACIONES', 20, yPosition);
    yPosition += 10;

    const analisisRenovaciones = [
      ['Renovaciones Automáticas', datosAnalisis.reportAnalysis.renewalAnalysis.automaticRenewals.toString()],
      ['Solicitudes Manuales', datosAnalisis.reportAnalysis.renewalAnalysis.manualApplications.toString()],
      ['Tasa de Renovación Automática', this.formatearPorcentaje(datosAnalisis.reportAnalysis.renewalAnalysis.automaticRenewalRate)]
    ];

    autoTable(doc, {
      head: [['Concepto', 'Valor']],
      body: analisisRenovaciones,
      startY: yPosition,
      margin: { left: 20, right: 20 },
      styles: { halign: 'center', valign: 'middle', fontSize: 10 },
      headStyles: { fillColor: '#9C27B0', fontStyle: 'bold' },
      didDrawPage: this.crearEncabezadoYPie(doc, titulo, parametros)
    });

    yPosition = (doc as any).lastAutoTable.finalY + 20;

    // ======== TOP SOLICITANTES ========
    if (yPosition > 180 || datosAnalisis.reportAnalysis.topApplicants.length > 5) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(14);
    doc.setFont('bold');
    doc.text('TOP 10 SOLICITANTES', 20, yPosition);
    yPosition += 10;

    const topSolicitantes = datosAnalisis.reportAnalysis.topApplicants.slice(0, 10).map((applicant: any) => [
      applicant.applicantName,
      applicant.companyName || 'N/A',
      applicant.applicationCount.toString()
    ]);

    autoTable(doc, {
      head: [['Solicitante', 'Empresa', 'Solicitudes']],
      body: topSolicitantes,
      startY: yPosition,
      margin: { left: 20, right: 20 },
      styles: { halign: 'center', valign: 'middle', fontSize: 9 },
      headStyles: { fillColor: '#4CAF50', fontStyle: 'bold' },
      didDrawPage: this.crearEncabezadoYPie(doc, titulo, parametros)
    });

    yPosition = (doc as any).lastAutoTable.finalY + 20;

    // ======== ANÁLISIS POR TIPO DE PROCEDIMIENTO ========
    if (yPosition > 180 || datosAnalisis.reportAnalysis.procedureTypeAnalysis.length > 5) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(14);
    doc.setFont('bold');
    doc.text('ANÁLISIS POR TIPO DE PROCEDIMIENTO', 20, yPosition);
    yPosition += 10;

    const tiposProcedimiento = datosAnalisis.reportAnalysis.procedureTypeAnalysis.map((pt: any) => [
      pt.procedureType,
      pt.count.toString(),
      this.formatearPorcentaje(pt.percentage)
    ]);

    autoTable(doc, {
      head: [['Tipo de Procedimiento', 'Cantidad', '% del Total']],
      body: tiposProcedimiento,
      startY: yPosition,
      margin: { left: 20, right: 20 },
      styles: { halign: 'center', valign: 'middle', fontSize: 9 },
      headStyles: { fillColor: '#FF5722', fontStyle: 'bold' },
      didDrawPage: this.crearEncabezadoYPie(doc, titulo, parametros)
    });

    yPosition = (doc as any).lastAutoTable.finalY + 20;

    // ======== RENDIMIENTO POR CIUDAD ========
    if (yPosition > 180 || datosAnalisis.reportAnalysis.cityPerformance.length > 5) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(14);
    doc.setFont('bold');
    doc.text('RENDIMIENTO POR CIUDAD', 20, yPosition);
    yPosition += 10;

    const rendimientoCiudades = datosAnalisis.reportAnalysis.cityPerformance.map((city: any) => [
      city.cityCode,
      city.applicationsCount.toString(),
      this.formatearPorcentaje(city.percentage)
    ]);

    autoTable(doc, {
      head: [['Ciudad', 'Solicitudes', '% del Total']],
      body: rendimientoCiudades,
      startY: yPosition,
      margin: { left: 20, right: 20 },
      styles: { halign: 'center', valign: 'middle', fontSize: 9 },
      headStyles: { fillColor: '#607D8B', fontStyle: 'bold' },
      didDrawPage: this.crearEncabezadoYPie(doc, titulo, parametros)
    });

    yPosition = (doc as any).lastAutoTable.finalY + 20;

    // ======== INSIGHTS Y RECOMENDACIONES ========
    if (yPosition > 200) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(14);
    doc.setFont('bold');
    doc.text('INSIGHTS CLAVE', 20, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    doc.setFont('normal');

    if (datosAnalisis.reportAnalysis.insights.length > 0) {
      datosAnalisis.reportAnalysis.insights.forEach((insight: string, index: number) => {
        const textLines = doc.splitTextToSize(`• ${insight}`, 250);
        doc.text(textLines, 25, yPosition);
        yPosition += textLines.length * 5 + 3;
      });
    } else {
      doc.text('• No se identificaron insights significativos para el período analizado.', 25, yPosition);
      yPosition += 8;
    }

    yPosition += 10;

    doc.setFontSize(14);
    doc.setFont('bold');
    doc.text('RECOMENDACIONES ESTRATÉGICAS', 20, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    doc.setFont('normal');

    if (datosAnalisis.reportAnalysis.recommendations.length > 0) {
      datosAnalisis.reportAnalysis.recommendations.forEach((recomendacion: string, index: number) => {
        const textLines = doc.splitTextToSize(`• ${recomendacion}`, 250);
        doc.text(textLines, 25, yPosition);
        yPosition += textLines.length * 5 + 3;
      });
    } else {
      doc.text('• Las métricas actuales se encuentran dentro de parámetros aceptables.', 25, yPosition);
      yPosition += 8;
    }

    // ======== DATOS DE SOPORTE (MUESTRA) ========
    if (datosAnalisis.reportAnalysis.sampleApplications && datosAnalisis.reportAnalysis.sampleApplications.length > 0) {
      doc.addPage();
      yPosition = 20;

      doc.setFontSize(14);
      doc.setFont('bold');
      doc.text('DATOS DE SOPORTE - MUESTRA DE SOLICITUDES', 20, yPosition);
      yPosition += 10;

      const solicitudesMuestra = datosAnalisis.reportAnalysis.sampleApplications.slice(0, 20).map((solicitud: any) => [
        solicitud.applicationCode || 'N/A',
        this.obtenerFecha(solicitud.receivedDate),
        solicitud.applicantName?.substring(0, 15) || 'N/A',
        solicitud.companyName?.substring(0, 15) || 'N/A',
        solicitud.procedureTypeDescription?.substring(0, 15) || 'N/A',
        solicitud.fileStatus || 'N/A'
      ]);

      autoTable(doc, {
        head: [['Código', 'Fecha', 'Solicitante', 'Empresa', 'Tipo', 'Estado']],
        body: solicitudesMuestra,
        startY: yPosition,
        margin: { left: 20, right: 20 },
        styles: { halign: 'center', valign: 'middle', fontSize: 8 },
        headStyles: { fillColor: '#78909C', fontStyle: 'bold' },
        didDrawPage: this.crearEncabezadoYPie(doc, titulo, parametros)
      });
    }

    this.agregarPiesDePagina(doc, parametros);
    doc.output('dataurlnewwindow');
  }

  // School Certificates Reports
  public generarReporteEscuelasLista(
    certificados: any[],
    parametros: ReporteParametros
  ): void {
    const doc = this.configurarDocumento();
    const titulo = 'Lista Detallada de Certificados Escolares';

    // Deduplication not needed for school certificates (unique notice codes)
    const certificadosUnicos = certificados;

    if (certificadosUnicos.length === 0) {
      doc.text('No se encontraron certificados escolares para los parámetros seleccionados.', 20, 60);
      this.agregarPiesDePagina(doc, parametros);
      doc.output('dataurlnewwindow');
      return;
    }

    // Summary section
    const totalCertificados = certificadosUnicos.length;
    const totalPagados = certificadosUnicos.filter(cert => cert.noticeStatus === 'PAGADO').length;
    const totalIngresos = certificadosUnicos
      .filter(cert => cert.noticeStatus === 'PAGADO')
      .reduce((sum, cert) => sum + (cert.amount || 0), 0);
    const tasaPago = totalCertificados > 0 ? (totalPagados / totalCertificados * 100) : 0;

    let yPosition = 60;

    // Summary table
    const resumen = [
      ['Total Certificados Escolares', totalCertificados.toString()],
      ['Certificados Pagados', totalPagados.toString()],
      ['Certificados Pendientes', (totalCertificados - totalPagados).toString()],
      ['Ingresos Totales', this.formatearMoneda(totalIngresos)],
      ['Tasa de Pago', this.formatearPorcentaje(tasaPago)]
    ];

    autoTable(doc, {
      head: [['Concepto', 'Valor']],
      body: resumen,
      startY: yPosition,
      margin: { left: 20, right: 20 },
      styles: { halign: 'center', valign: 'middle', fontSize: 10 },
      headStyles: { fillColor: '#88CFE0', fontStyle: 'bold' },
      didDrawPage: this.crearEncabezadoYPie(doc, titulo, parametros)
    });

    yPosition = (doc as any).lastAutoTable.finalY + 20;

    // Main data table
    const datosCertificados = certificadosUnicos.map(cert => [
      cert.preRegistrationCode || 'N/A',
      cert.dealerName?.substring(0, 20) || 'N/A',
      cert.dealerRtn || 'N/A',
      this.formatearMoneda(cert.amount),
      cert.noticeStatus || 'N/A',
      this.obtenerFecha(cert.issueDate),
      cert.categoryDescription?.substring(0, 15) || 'N/A',
      cert.transportType || 'N/A'
    ]);

    autoTable(doc, {
      head: [['Código Pre-reg.', 'Distribuidor', 'RTN', 'Monto', 'Estado', 'F. Emisión', 'Categoría', 'Tipo Transp.']],
      body: datosCertificados,
      startY: yPosition,
      margin: { left: 14, right: 14 },
      styles: { halign: 'center', valign: 'middle', fontSize: 8 },
      headStyles: { fillColor: '#81C784', fontStyle: 'bold' },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 35 },
        2: { cellWidth: 25 },
        3: { cellWidth: 25 },
        4: { cellWidth: 20 },
        5: { cellWidth: 25 },
        6: { cellWidth: 30 },
        7: { cellWidth: 25 }
      },
      didDrawPage: this.crearEncabezadoYPie(doc, titulo, parametros)
    });

    this.agregarPiesDePagina(doc, parametros);
    doc.output('dataurlnewwindow');
  }

  public generarReporteEscuelasAnalisisEjecutivo(
    datosAnalisis: any,
    parametros: ReporteParametros
  ): void {
    const doc = this.configurarDocumento();
    const titulo = 'Reporte Ejecutivo - Análisis de Certificados Escolares';

    let yPosition = 60;

    // ======== RESUMEN EJECUTIVO ========
    doc.setFontSize(16);
    doc.setFont('bold');
    doc.text('RESUMEN EJECUTIVO', 20, yPosition);
    yPosition += 15;

    const resumenEjecutivo = [
      ['Total de Certificados Escolares', datosAnalisis.reportAnalysis.executiveSummary.totalCertificates.toString()],
      ['Ingresos Totales del Período', this.formatearMoneda(datosAnalisis.reportAnalysis.executiveSummary.totalRevenue)],
      ['Tasa de Pago Actual', this.formatearPorcentaje(datosAnalisis.reportAnalysis.executiveSummary.paymentRate)],
      ['Cumplimiento de Meta (70%)', datosAnalisis.reportAnalysis.executiveSummary.targetAchievement]
    ];

    autoTable(doc, {
      head: [['Indicador Clave', 'Valor']],
      body: resumenEjecutivo,
      startY: yPosition,
      margin: { left: 20, right: 20 },
      styles: { halign: 'center', valign: 'middle', fontSize: 10 },
      headStyles: { fillColor: '#4FC3F7', fontStyle: 'bold' },
      didDrawPage: this.crearEncabezadoYPie(doc, titulo, parametros)
    });

    yPosition = (doc as any).lastAutoTable.finalY + 20;

    // ======== ANÁLISIS DE TENDENCIAS ========
    doc.setFontSize(14);
    doc.setFont('bold');
    doc.text('ANÁLISIS DE TENDENCIAS', 20, yPosition);
    yPosition += 10;

    if (datosAnalisis.reportAnalysis.trends) {
      const tendencias = [
        ['Certificados Mes Actual', datosAnalisis.reportAnalysis.trends.monthOverMonth.current.toString()],
        ['Certificados Mes Anterior', datosAnalisis.reportAnalysis.trends.monthOverMonth.previous.toString()],
        ['Variación Mensual (%)', this.formatearPorcentaje(datosAnalisis.reportAnalysis.trends.monthOverMonth.change)],
        ['Variación Anual (%)', this.formatearPorcentaje(datosAnalisis.reportAnalysis.trends.yearOverYear.change)]
      ];

      autoTable(doc, {
        head: [['Métrica', 'Valor']],
        body: tendencias,
        startY: yPosition,
        margin: { left: 20, right: 20 },
        styles: { halign: 'center', valign: 'middle', fontSize: 9 },
        headStyles: { fillColor: '#FFB74D', fontStyle: 'bold' },
        didDrawPage: this.crearEncabezadoYPie(doc, titulo, parametros)
      });

      yPosition = (doc as any).lastAutoTable.finalY + 20;
    }

    // ======== TOP CATEGORÍAS DE VEHÍCULOS ESCOLARES ========
    if (datosAnalisis.reportAnalysis.topCategories && datosAnalisis.reportAnalysis.topCategories.length > 0) {
      doc.setFontSize(14);
      doc.setFont('bold');
      doc.text('TOP CATEGORÍAS DE VEHÍCULOS ESCOLARES', 20, yPosition);
      yPosition += 10;

      const topCategorias = datosAnalisis.reportAnalysis.topCategories.slice(0, 8).map((cat: any) => [
        cat.category?.substring(0, 25) || 'N/A',
        cat.count.toString(),
        this.formatearPorcentaje(cat.percentage),
        this.formatearMoneda(cat.totalAmount)
      ]);

      autoTable(doc, {
        head: [['Categoría de Vehículo', 'Cantidad', 'Porcentaje (%)', 'Ingresos']],
        body: topCategorias,
        startY: yPosition,
        margin: { left: 20, right: 20 },
        styles: { halign: 'center', valign: 'middle', fontSize: 9 },
        headStyles: { fillColor: '#81C784', fontStyle: 'bold' },
        didDrawPage: this.crearEncabezadoYPie(doc, titulo, parametros)
      });

      yPosition = (doc as any).lastAutoTable.finalY + 20;
    }

    // ======== ANÁLISIS POR TIPO DE TRANSPORTE ESCOLAR ========
    if (datosAnalisis.reportAnalysis.transportAnalysis && datosAnalisis.reportAnalysis.transportAnalysis.length > 0) {
      // Check if we need a new page
      if (yPosition > 200) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(14);
      doc.setFont('bold');
      doc.text('ANÁLISIS POR TIPO DE TRANSPORTE ESCOLAR', 20, yPosition);
      yPosition += 10;

      const transporteAnalisis = datosAnalisis.reportAnalysis.transportAnalysis.map((transport: any) => [
        transport.transportType || 'N/A',
        transport.count.toString(),
        this.formatearPorcentaje(transport.percentage),
        this.formatearMoneda(transport.totalAmount)
      ]);

      autoTable(doc, {
        head: [['Tipo de Transporte', 'Cantidad', 'Porcentaje (%)', 'Ingresos']],
        body: transporteAnalisis,
        startY: yPosition,
        margin: { left: 20, right: 20 },
        styles: { halign: 'center', valign: 'middle', fontSize: 9 },
        headStyles: { fillColor: '#9575CD', fontStyle: 'bold' },
        didDrawPage: this.crearEncabezadoYPie(doc, titulo, parametros)
      });

      yPosition = (doc as any).lastAutoTable.finalY + 20;
    }

    // ======== ANÁLISIS DE INGRESOS Y EFICIENCIA ========
    if (datosAnalisis.reportAnalysis.revenueAnalysis) {
      // Check if we need a new page
      if (yPosition > 200) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(14);
      doc.setFont('bold');
      doc.text('ANÁLISIS DE INGRESOS Y EFICIENCIA', 20, yPosition);
      yPosition += 10;

      const analisisIngresos = [
        ['Total Emitidos', datosAnalisis.reportAnalysis.revenueAnalysis.totalIssued.toString()],
        ['Total Pagados', datosAnalisis.reportAnalysis.revenueAnalysis.totalPaid.toString()],
        ['Total Activos', datosAnalisis.reportAnalysis.revenueAnalysis.totalActive.toString()],
        ['Total Anulados', datosAnalisis.reportAnalysis.revenueAnalysis.totalCancelled.toString()],
        ['Ingresos Realizados', this.formatearMoneda(datosAnalisis.reportAnalysis.revenueAnalysis.totalRevenue)],
        ['Eficiencia de Pago', this.formatearPorcentaje(datosAnalisis.reportAnalysis.revenueAnalysis.paymentRate)]
      ];

      autoTable(doc, {
        head: [['Métrica', 'Valor']],
        body: analisisIngresos,
        startY: yPosition,
        margin: { left: 20, right: 20 },
        styles: { halign: 'center', valign: 'middle', fontSize: 10 },
        headStyles: { fillColor: '#E57373', fontStyle: 'bold' },
        didDrawPage: this.crearEncabezadoYPie(doc, titulo, parametros)
      });

      yPosition = (doc as any).lastAutoTable.finalY + 20;
    }

    // ======== INSIGHTS ESTRATÉGICOS ========
    if (datosAnalisis.reportAnalysis.insights && datosAnalisis.reportAnalysis.insights.length > 0) {
      // Check if we need a new page
      if (yPosition > 220) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(14);
      doc.setFont('bold');
      doc.text('INSIGHTS ESTRATÉGICOS', 20, yPosition);
      yPosition += 10;

      doc.setFontSize(10);
      doc.setFont('normal');

      datosAnalisis.reportAnalysis.insights.forEach((insight: string, index: number) => {
        const textLines = doc.splitTextToSize(`• ${insight}`, 250);
        doc.text(textLines, 25, yPosition);
        yPosition += textLines.length * 5 + 3;
      });

      yPosition += 10;
    }

    // ======== RECOMENDACIONES ESTRATÉGICAS ========
    if (datosAnalisis.reportAnalysis.recommendations && datosAnalisis.reportAnalysis.recommendations.length > 0) {
      // Check if we need a new page
      if (yPosition > 220) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(14);
      doc.setFont('bold');
      doc.text('RECOMENDACIONES PARA EL SECTOR ESCOLAR', 20, yPosition);
      yPosition += 10;

      doc.setFontSize(10);
      doc.setFont('normal');

      datosAnalisis.reportAnalysis.recommendations.forEach((recomendacion: string, index: number) => {
        const textLines = doc.splitTextToSize(`• ${recomendacion}`, 250);
        doc.text(textLines, 25, yPosition);
        yPosition += textLines.length * 5 + 3;
      });
    }

    // ======== DATOS DE SOPORTE (MUESTRA) ========
    if (datosAnalisis.reportAnalysis.sampleData && datosAnalisis.reportAnalysis.sampleData.length > 0) {
      doc.addPage();
      yPosition = 20;

      doc.setFontSize(14);
      doc.setFont('bold');
      doc.text('DATOS DE SOPORTE - MUESTRA DE CERTIFICADOS ESCOLARES', 20, yPosition);
      yPosition += 10;

      const certificadosMuestra = datosAnalisis.reportAnalysis.sampleData.slice(0, 20).map((cert: any) => [
        cert.preRegistrationCode || 'N/A',
        this.obtenerFecha(cert.issueDate),
        cert.dealerName?.substring(0, 15) || 'N/A',
        cert.categoryDescription?.substring(0, 12) || 'N/A',
        cert.transportType || 'N/A',
        cert.noticeStatus || 'N/A',
        this.formatearMoneda(cert.amount)
      ]);

      autoTable(doc, {
        head: [['Código', 'F. Emisión', 'Distribuidor', 'Categoría', 'Transporte', 'Estado', 'Monto']],
        body: certificadosMuestra,
        startY: yPosition,
        margin: { left: 14, right: 14 },
        styles: { halign: 'center', valign: 'middle', fontSize: 8 },
        headStyles: { fillColor: '#78909C', fontStyle: 'bold' },
        didDrawPage: this.crearEncabezadoYPie(doc, titulo, parametros)
      });
    }

    this.agregarPiesDePagina(doc, parametros);
    doc.output('dataurlnewwindow');
  }
}