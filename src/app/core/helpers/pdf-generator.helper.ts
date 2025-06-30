import { Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import moment from 'moment';
import { Fine, Certificate } from 'src/app/admin/interfaces';

@Injectable({
  providedIn: 'root'
})
export class PDFHelper {
  private isFirstPageDrawn = false;
  private finalY = 0;

  constructor() {}

  public generatePDF(formattedData: any[], columns: string[], title: string, params: {}): void {
    this.isFirstPageDrawn = false;
    const doc = new jsPDF('landscape');
    doc.setTextColor(40);
    const blue = '#88CFE0';

    autoTable(doc, {
      head: [columns],
      body: formattedData,
      margin: { top: 45, right: 10, bottom: 20, left: 20 },
      styles: { halign: 'center', valign: 'middle'},
      headStyles: { fillColor: blue },
      didDrawPage: (data) => {
        doc.setFontSize(20);
        const pageSize = doc.internal.pageSize;

        // Header
        if (!this.isFirstPageDrawn) {
          data.settings.margin.top = 4;
          const centerX = pageSize.width / 2;
          doc.text(title, centerX - (doc.getTextWidth(title) / 2), 25);

          doc.addImage('assets/pdf.jpg', 'JPEG', 20, 5, 40, 40);
          doc.addImage('assets/pdf2.jpg', 'JPEG', pageSize.width-50, 2, 40, 40);
          this.isFirstPageDrawn = true;
        }

        // Left stripe
        const margin = 4;
        doc.setFillColor(blue);
        doc.rect(margin, margin, 10, pageSize.height-2*margin, 'F');
        this.finalY = data.cursor?.y || 95;
      },
    });
    const pageCount = (doc as any).internal.getNumberOfPages();
    const footerHeight = doc.internal.pageSize.height - 7;

    doc.setFontSize(12);

    // Footer
    for(let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.text('Página ' + i + ' de ' + pageCount, doc.internal.pageSize.width - 35, footerHeight);
      doc.text('Lista generada el ' + moment.utc().format('DD/MM/YYYY'), 25, footerHeight);
      const paramsText = Object.values(params).slice(2).join(', ');
      doc.text('Parámetros de búsqueda:' + paramsText, 80, footerHeight);
    }

    doc.output('dataurlnewwindow');
  }

  public generateEventualPermitsPDF(permits: any[], params: {}): void {
    const columns = [
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
    const formattedPermits = permits.map(permit => [
      this.getDate(permit.systemDate),
      permit.permitCode || 'N/A',
      permit.applicantName || 'N/A',
      permit.rtn || 'N/A',
      permit.serviceTypeDescription || 'N/A',
      permit.permitStatus || 'N/A',
      permit.regionalOffice || 'N/A',
      permit.amount || 0,
      permit.noticeCode || 'N/A'
    ]);
    this.generatePDF(formattedPermits, columns, 'Listado de Permisos Eventuales', params);
  }

  public generateCertificatePDF(certificates: Certificate[], params: {}): void {
    const columns = [
      'Fecha Exp. Certificado', // certificateExpirationDate
      'Monto Total', // totalNoticeAmount
      'Estado del Aviso', // noticeStatusDescription
      'Departamento', // department
      'Aviso de Cobro (Código)', // noticeCode
      'Modalidad', // modality
      'Estado del Documento', // documentStatus
    ];
    const formattedFine = this.formatCertificateForPDF(certificates);
    this.generatePDF(formattedFine, columns, 'Listado de Certificados', params);
  }

  private formatCertificateForPDF(certificates: Certificate[]) {
    return certificates.map(certificate => {
      return [
        this.getDate(certificate.certificateExpirationDate), // Fecha Expiración Certificado
        certificate.totalNoticeAmount || 0, // Monto Total
        certificate.noticeStatusDescription || 'N/A', // Estado del Aviso
        certificate.department || 'N/A', // Departamento
        certificate.noticeCode || 'N/A', // Aviso de Cobro
        certificate.modality || 'N/A', // Modalidad
        certificate.documentStatus || 'N/A', // Estado del Documento
      ];
    });
  }


  public generateFinePDF(fines: Fine[], params: {}): void {
    const columns = ['Fecha', 'Monto', 'Estado', 'Departamento', 'DNI/RTN', 'Nombre Empresa', 'Teléfono', 'Aviso de Cobro'];
    const formattedFine = this.formatFineForPDF(fines);
    this.generatePDF(formattedFine, columns, 'Listado de Multas', params);
  }

  private formatFineForPDF(fines: Fine[]) {
    return fines.map(fine => {
      return [
        this.getDate(fine.startDate),
        fine.totalAmount,
        fine.fineStatus,
        fine.department,
        fine.dniRtn ? fine.dniRtn : 'N/A',
        fine.companyName ? fine.companyName : 'N/A',
        fine.phone ? fine.phone : 'N/A',
        fine.noticeCode ? fine.noticeCode : 'N/A',
      ];
    });

  }

  private getDate(date: Date | null | undefined | string): string {
    if (!date ) {
      return 'NO DISPONIBLE';
    }
    return moment.utc(date).format('DD/MM/YYYY');
  }
}

