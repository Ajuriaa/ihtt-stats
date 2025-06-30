// Parámetros comunes para todos los reportes
export interface ReporteParametros {
  fechaInicio?: string;
  fechaFin?: string;
  departamento?: string;
  region?: string;
  modalidad?: string;
  estadoAviso?: string;
  rtn?: string;
  tipoFecha?: string;
  estado?: string;  // Para compatibility con fines
  empleadoId?: string;
  isAutomaticRenewal?: string; // Para certificados
  empleadoNombre?: string;
}

// Interfaces para Dashboard General
export interface DashboardGeneralData {
  // Totales mensuales y acumulados
  certificadosEmitidos: number;
  certificadosAcumulados: number;
  permisosOtorgados: number;
  permisosAcumulados: number;
  multasAplicadas: number;
  multasAcumuladas: number;
  ingresosMensuales: number;
  ingresosAcumulados: number;

  // Variaciones porcentuales mensuales
  variacionCertificados: number;
  variacionPermisos: number;
  variacionMultas: number;
  variacionIngresos: number;

  // Comparación por categoría de ingresos
  ingresosCertificados: number;
  ingresosPermisos: number;
  ingresosMultas: number;
  ingresosOtros: number;

  // Desglose por departamento
  departamentos: DepartamentoData[];

  // Alertas condicionales
  alertas: AlertaData[];
}

export interface DepartamentoData {
  nombre: string;
  certificados: number;
  permisos: number;
  multas: number;
  ingresos: number;
}

export interface AlertaData {
  concepto: string;
  valorActual: number;
  umbral: number;
  estado: 'NORMAL' | 'ADVERTENCIA' | 'CRÍTICO';
}

// Interfaces para Permisos de Operación
export interface PermisosOperacionData {
  // Clasificación por tipo de transporte
  tiposTransporte: TipoTransporteData[];

  // Segmentación opcional por región
  regiones?: RegionData[];

  // Análisis de variación mensual
  totalPermisosActual: number;
  totalPermisosAnterior: number;
  variacionTotal: number;
}

export interface TipoTransporteData {
  nombre: string;
  permisos: number;
  variacionMensual: number;
}

export interface RegionData {
  nombre: string;
  permisos: number;
  variacionMensual: number;
}

// Interfaces para Ingresos Institucionales
export interface IngresosInstitucionalData {
  // Ingresos consolidados por fuente
  fuentesIngreso: FuenteIngresoData[];

  // Comparación presupuesto vs ingresos reales
  presupuestoTotal: number;
  ingresosRealesTotal: number;
  porcentajeCumplimientoTotal: number;

  // KPIs por fuente
  kpisPorFuente: KPIData[];
}

export interface FuenteIngresoData {
  nombre: string;
  ingresosReales: number;
  ingresosProyectados: number;
  porcentajeCumplimiento: number;
}

export interface KPIData {
  fuente: string;
  objetivo: number;
  real: number;
  porcentajeCumplimiento: number;
  estado: 'CUMPLIDO' | 'ADVERTENCIA' | 'CRÍTICO';
}

// Interfaces para el análisis de multas
export interface MultasAnalisisData {
  // Agrupación por tipo de infracción
  tiposInfraccion: InfraccionData[];

  // Conteo de reincidencias
  reincidencias: ReincidenciaData[];

  // Ingresos recaudados vs proyectados
  ingresosRecaudados: number;
  ingresosProyectados: number;
  porcentajeRecaudacion: number;
}

export interface InfraccionData {
  tipo: string;
  cantidad: number;
  montoTotal: number;
  porcentajeDelTotal: number;
}

export interface ReincidenciaData {
  empresa: string;
  dniRtn: string;
  totalInfracciones: number;
  montoAcumulado: number;
  ultimaInfraccion: string;
}

// Interfaces para el análisis de certificados
export interface CertificadosAnalisisData {
  // Desglose mensual de emisión
  desglosexMensual: CertificadoMensualData[];

  // Clasificación por tipo
  tiposCertificado: TipoCertificadoData[];

  // Segmentación por departamento
  departamentos: DepartamentoCertificadoData[];

  // Observaciones técnicas
  observaciones: ObservacionData[];
}

export interface CertificadoMensualData {
  mes: string;
  cantidad: number;
  variacion: number;
}

export interface TipoCertificadoData {
  tipo: string;
  cantidad: number;
  porcentaje: number;
}

export interface DepartamentoCertificadoData {
  departamento: string;
  cantidad: number;
  ingresos: number;
}

export interface ObservacionData {
  fecha: string;
  observacion: string;
  categoria: 'MANUAL' | 'AUTOMATICA';
  prioridad: 'BAJA' | 'MEDIA' | 'ALTA';
}

// Tipos de reporte disponibles
export enum TipoReporte {
  DASHBOARD_GENERAL = 'dashboard-general',
  CERTIFICADOS = 'certificados',
  PERMISOS_OPERACION = 'permisos-operacion',
  MULTAS = 'multas',
  INGRESOS_INSTITUCIONALES = 'ingresos-institucionales'
}

// Configuración de reporte
export interface ConfiguracionReporte {
  tipo: TipoReporte;
  titulo: string;
  parametros: ReporteParametros;
  incluirGraficos?: boolean;
  formato?: 'PDF' | 'EXCEL';
  orientacion?: 'portrait' | 'landscape';
}
