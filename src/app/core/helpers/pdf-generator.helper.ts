import { Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export class PDFHelper {
  private isFirstPageDrawn = false;
  constructor() {}

  public generatePDF(formattedData: any[], columns: string[], title: string): void {
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
      },
    });
    const pageCount = (doc as any).internal.getNumberOfPages();
    const footerHeight = doc.internal.pageSize.height - 7;

    // Footer
    for(let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.text('Página ' + i + ' de ' + pageCount, doc.internal.pageSize.width - 35, footerHeight);
      doc.text('Lista generada el ' + moment().format('DD/MM/YYYY'), 25, footerHeight);
    }

    doc.output('dataurlnewwindow');
  }
}

