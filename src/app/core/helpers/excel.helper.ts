import { Injectable } from '@angular/core';
import * as ExcelJS from 'exceljs';
import * as FileSaver from 'file-saver';
import moment from 'moment';
import { Certificate, Fine } from 'src/app/admin/interfaces';
@Injectable({
  providedIn: 'root'
})
export class ExcelHelper {
  public exportFinesToExcel(fines: Fine[], name: string): void {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Fines');

    // Define headers for all the fields in the Fine object
    const headers = [
      'ID',
      'ID de Operación',
      'Estado de la Multa',
      'Placa del Vehículo',
      'Fecha de Multa',
      'Nombre Concesionario',
      'DNI/RTN',
      'Teléfono',
      'Email',
      'Certificado',
      'Regional',
      'Codigo Aviso de Cobro',
      'Monto Total',
      'Departamento',
      'Municipio',
      'Lugar',
      'Número de empleado',
      'Nombre del Empleado'
    ];

    // Add headers to the worksheet
    worksheet.addRow(headers);

    // Add rows of data
    fines.forEach(fine => {
      worksheet.addRow([
        fine.fineId || 'N/A', // ID,
        fine.operationId || 'N/A', // ID de Operación
        fine.fineStatus || 'N/A', // Estado de la Multa
        fine.plate || 'N/A', // Placa del Vehículo
        this.getDate(fine.startDate), // Fecha de Multa
        fine.companyName || 'N/A', // Nombre del Infractor
        fine.dniRtn || 'N/A', // DNI/RTN
        fine.phone || 'N/A', // Teléfono
        fine.email || 'N/A', // Email
        fine.certificate || 'N/A', // Certificado
        fine.region || 'N/A', // Regional
        fine.noticeCode || 'N/A', // Codigo Aviso de Cobro
        fine.totalAmount || 0, // Monto Total
        fine.department || 'N/A', // Departamento
        fine.municipality || 'N/A', // Municipio
        fine.place || 'N/A', // Lugar
        fine.employeeId || 'N/A', //ID de Empleado
        fine.employeeName || 'N/A' // Nombre del Empleado
      ]);
    });

    // Auto-fit columns
    worksheet.columns.forEach(column => {
      let maxLength = 0;
      if (!column.eachCell) {
        return;
      }
      column.eachCell({ includeEmpty: true }, cell => {
        if (cell.value) {
          const cellValue = cell.value.toString();
          maxLength = Math.max(maxLength, cellValue.length);
        }
      });
      column.width = maxLength + 2;
    });

    // Generate and save the Excel file
    workbook.xlsx.writeBuffer().then(buffer => {
      const blob = new Blob([buffer], { type: 'application/octet-stream' });
      FileSaver.saveAs(blob, name);
    });
  }

  public exportCertificatesToExcel(certificates: Certificate[], name: string): void {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Certificates');

    // Define headers for all the fields in the Certificate object
    const headers = [
      'Fecha Exp. Certificado',
      'Fecha Exp. Permiso',
      'Fecha de Pago',
      'Monto Total',
      'Estado del Aviso',
      'Departamento',
      'DNI/RTN',
      'Nombre Empresa',
      'Teléfono',
      'Aviso de Cobro (Código)',
      'Número de Certificado',
      'Placa',
      'Modalidad',
      'Estado del Documento',
      'Estado del Certificado',
      'Fecha de Entrega',
      'Número de Estante',
      'Número de Fila',
      'Número de Anillo',
      'Número de Permiso de Explotación',
      'Nombre del Concesionario',
      'Teléfono del Concesionario',
      'Email del Concesionario',
      'Nombre del Representante Legal',
      'Teléfono del Representante Legal',
      'Email del Representante Legal',
    ];

    // Add headers to the worksheet
    worksheet.addRow(headers);

    // Add rows of data
    certificates.forEach(certificate => {
      worksheet.addRow([
        this.getDate(certificate.certificateExpirationDate), // Fecha Expiración Certificado
        this.getDate(certificate.permissionExpirationDate), // Fecha Expiración Permiso
        this.getDate(certificate.paymentDate), // Fecha de Pago
        certificate.totalNoticeAmount || 0, // Monto Total
        certificate.noticeStatusDescription || 'N/A', // Estado del Aviso
        certificate.department || 'N/A', // Departamento
        certificate.concessionaireRtn || 'N/A', // DNI/RTN
        certificate.concessionaireName || 'N/A', // Nombre Empresa
        certificate.concessionairePhone || 'N/A', // Teléfono
        certificate.noticeCode || 'N/A', // Aviso de Cobro
        certificate.certificateNumber || 'N/A', // Número de Certificado
        certificate.plateId || 'N/A', // Placa
        certificate.modality || 'N/A', // Modalidad
        certificate.documentStatus || 'N/A', // Estado del Documento
        certificate.coStatus || 'N/A', // Estado del Certificado
        this.getDate(certificate.deliveryDate), // Fecha de Entrega
        certificate.shelfNumber || 'N/A', // Número de Estante
        certificate.rowNumber || 'N/A', // Número de Fila
        certificate.ringNumber || 'N/A', // Número de Anillo
        certificate.exploitationPermissionNumber || 'N/A', // Número de Permiso de Explotación
        certificate.concessionaireName || 'N/A', // Nombre del Concesionario
        certificate.concessionairePhone || 'N/A', // Teléfono del Concesionario
        certificate.concessionaireEmail || 'N/A', // Email del Concesionario
        certificate.legalRepresentativeName || 'N/A', // Nombre del Representante Legal
        certificate.legalRepresentativePhone || 'N/A', // Teléfono del Representante Legal
        certificate.legalRepresentativeEmail || 'N/A', // Email del Representante Legal
      ]);
    });

    // Auto-fit columns
    worksheet.columns.forEach(column => {
      let maxLength = 0;
      if (!column.eachCell) {
        return;
      }
      column.eachCell({ includeEmpty: true }, cell => {
        if (cell.value) {
          const cellValue = cell.value.toString();
          maxLength = Math.max(maxLength, cellValue.length);
        }
      });
      column.width = maxLength + 2;
    });

    // Generate and save the Excel file
    workbook.xlsx.writeBuffer().then(buffer => {
      const blob = new Blob([buffer], { type: 'application/octet-stream' });
      FileSaver.saveAs(blob, name);
    });
  }

  public exportEventualPermitsToExcel(permits: any[], name: string): void {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Permisos Eventuales');

    const headers = [
      'Fecha del Sistema',
      'Código de Permiso',
      'RTN',
      'Nombre del Solicitante',
      'Placa',
      'Estado del Permiso',
      'Tipo de Servicio',
      'Oficina Regional',
      'Monto',
      'Código de Aviso'
    ];

    worksheet.addRow(headers);

    permits.forEach(permit => {
      worksheet.addRow([
        this.getDate(permit.systemDate),
        permit.permitCode || 'N/A',
        permit.rtn || 'N/A',
        permit.applicantName || 'N/A',
        permit.plate || 'N/A',
        permit.permitStatus || 'N/A',
        permit.serviceTypeDescription || 'N/A',
        permit.regionalOffice || 'N/A',
        permit.amount || 0,
        permit.noticeCode || 'N/A'
      ]);
    });

    worksheet.columns.forEach(column => {
      let maxLength = 0;
      if (!column.eachCell) {
        return;
      }
      column.eachCell({ includeEmpty: true }, cell => {
        if (cell.value) {
          const cellValue = cell.value.toString();
          maxLength = Math.max(maxLength, cellValue.length);
        }
      });
      column.width = maxLength + 2;
    });

    workbook.xlsx.writeBuffer().then(buffer => {
      const blob = new Blob([buffer], { type: 'application/octet-stream' });
      FileSaver.saveAs(blob, name);
    });
  }

  private getDate(date: Date | null | undefined | string): Date | null {
    if (!date) {
      return null; // Si la fecha es null o undefined, retorna null (celda vacía en Excel)
    }

    if (typeof date === 'string') {
      // Convierte la cadena de fecha ISO a un objeto Date
      const parsedDate = new Date(date);
      if (!isNaN(parsedDate.getTime())) {
        return parsedDate; // Retorna el objeto Date válido
      }
    }

    // Si es un objeto Date o no se puede parsear, lo retorna como está
    return date instanceof Date ? date : null;
  }
}
