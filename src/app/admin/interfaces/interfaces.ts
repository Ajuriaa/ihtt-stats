export interface Certificate {
  id: number;                    // ID único del certificado
  areaName: string | null;       // Nombre del área
  documentStatus: string | null; // Estado del documento
  coStatus: string | null;       // Estado del certificado
  deliveryDate: string | null;   // Fecha de entrega (en formato ISO)
  shelfNumber: string | null;    // Número de estante
  rowNumber: string | null;      // Número de fila
  ringNumber: string | null;     // Número de anillo
  certificateNumber: string | null; // Número del certificado
  plateId: string | null;        // ID de la placa
  exploitationPermissionNumber: string | null; // Número de permiso de explotación
  modality: string | null;       // Modalidad
  documentType: string | null;   // Tipo de documento
  department: string | null;     // Departamento
  requestId: string | null;      // ID de la solicitud
  fileId: string | null;         // ID del expediente
  isAutomaticRenewal: boolean;   // Indicador de renovación automática
  preform: string | null;        // Tipo de preforma
  concessionaireRtn: string | null; // RTN del concesionario
  concessionaireName: string | null; // Nombre del concesionario
  concessionairePhone: string | null; // Teléfono del concesionario
  concessionaireEmail: string | null; // Email del concesionario
  legalRepresentativeName: string | null; // Nombre del representante legal
  legalRepresentativeEmail: string | null; // Email del representante legal
  legalRepresentativePhone: string | null; // Teléfono del representante legal
  unifiedRequirement: string | null; // Requisito unificado
  noticeCode: number | null;         // Código de aviso de cobro
  noticeStatusDescription: string | null; // Estado del aviso de cobro
  totalNoticeAmount: number | null;  // Monto total del aviso de cobro
  systemUser: string | null;         // Usuario del sistema
  inventoryDate: string | null;      // Fecha de inventario (en formato ISO)
  certificateExpirationDate: string | null; // Fecha de expiración del certificado
  paymentDate: string | null;    // Fecha de pago (en formato ISO)
  permissionExpirationDate: string | null;  // Fecha de expiración del permiso
  bankCode: string | null;       // Código del banco
  bankDescription: string | null; // Descripción del banco
}

export interface CertificateResponse {
  data: Certificate[]; // Lista de certificados
  total: number;       // Total de registros encontrados
  page?: number;       // Página actual (si la paginación está habilitada)
  pages?: number;      // Total de páginas (si la paginación está habilitada)
}

export interface Fine {
  id: number;
  fineId?: string;
  operationId?: string;
  fineStatus?: string;
  origin?: string;
  plate?: string;
  startDate?: string;
  companyName?: string;
  dniRtn?: string;
  phone?: string;
  email?: string;
  certificate?: string;
  region?: string;
  systemDate?: string;
  noticeCode?: number;
  totalAmount?: number;
  department?: string;
  municipality?: string;
  place?: string;
  employeeId?: string;
  employeeName?: string;
  bankCode?: string;
  bankDescription?: string;
}

export interface FineResponse {
  data: Fine[];
  total: number;
  page?: number;
  pages?: number;
}

export interface EventualPermit {
  id: number;
  permitCode?: string;
  permitTypeCode?: string;
  driverCode?: string;
  permitStatusCode?: string;
  permitStatus?: string;
  censusCode?: string;
  rtn?: string;
  applicantName?: string;
  plate?: string;
  validationCode?: string;
  systemUser?: string;
  employeeName?: string;
  regionalOffice?: string;
  systemDate?: string;
  creationYear?: number;
  creationMonth?: number;
  creationMonthName?: string;
  serviceTypeCode?: string;
  serviceTypeDescription?: string;
  signatureType?: string;
  petiType?: string;
  noticeCode?: string;
  amount?: number;
  creationOrigin?: string;
  bankCode?: string;
  bankDescription?: string;
}

export interface EventualPermitResponse {
  data: EventualPermit[];
  total: number;
  page?: number;
  pages?: number;
}
