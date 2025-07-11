export interface Application {
  id: number;
  applicationCode: string | null;
  applicationId: string;
  applicantId: string | null;
  fileId: string | null;
  currentFile: string | null;
  applicantName: string | null;
  companyName: string | null;
  folio: number | null;
  receivedDate: string | null;
  preform: string | null;
  plateId: string | null;
  enteredPlate: string | null;
  multiplePlatesFile: string | null;
  effectivePlate: string | null;
  operationPermit: string | null;
  operationCertificate: string | null;
  observation: string | null;
  legalRepresentativeId: number | null;
  legalRepresentativeName: string | null;
  phone: string | null;
  email: string | null;
  procedureId: string | null;
  categoryId: string | null;
  categoryDescription: string | null;
  procedureClassDescription: string | null;
  procedureTypeDescription: string | null;
  modalityDescription: string | null;
  systemUser: string | null;
  cityCode: string | null;
  systemDate: string | null;
  source: string | null;
  geaId: string | null;
  censusUnit: string | null;
  vin: string | null;
  serviceClassId: string | null;
  serviceClassDescription: string | null;
  fileStatus: string | null;
  isAutomaticRenewal: boolean;
  village: string | null;
}

export interface ApplicationResponse {
  data: Application[];
  total: number;
  page?: number;
  pages?: number;
}

export interface ApplicationAnalytics {
  kpis: {
    totalApplications: number;
    pendingApplications: number;
    approvedApplications: number;
    rejectedApplications: number;
    inProcessApplications: number;
    automaticRenewals: number;
    manualApplications: number;
  };
  chartData: {
    statusDistribution: { [key: string]: number };
    procedureTypeDistribution: { [key: string]: number };
    categoryDistribution: { [key: string]: number };
    monthlyApplications: { [key: string]: number };
    renewalTypeDistribution: { [key: string]: number };
    cityDistribution: { [key: string]: number };
    serviceClassDistribution: { [key: string]: number };
  };
  total: number;
}

export interface ApplicationDashboard {
  dashboardKpis: {
    totalApplications: number;
    recentApplications: number;
    pendingApplications: number;
    approvedApplications: number;
    rejectedApplications: number;
    stalledApplications: number;
    automaticRenewals: number;
    averageProcessingTime: number;
  };
  quickStats: {
    statusBreakdown: { [key: string]: number };
    recentTrend: { [key: string]: number };
    topProcedureTypes: { [key: string]: number };
  };
  recentApplications: Application[];
  stalledApplications: Application[];
  total: number;
}

export interface ApplicationReportAnalysis {
  executiveSummary: {
    totalApplications: number;
    approvalRate: number;
    rejectionRate: number;
    pendingApplications: number;
    automaticRenewalRate: number;
    periodCovered: {
      startDate?: string;
      endDate?: string;
    };
  };
  processingAnalysis: {
    totalApplications: number;
    pendingApplications: number;
    approvedApplications: number;
    rejectedApplications: number;
    inProcessApplications: number;
    approvalRate: number;
    rejectionRate: number;
  };
  trends: {
    monthOverMonth: {
      current: number;
      previous: number;
      change: number;
    };
    yearOverYear: {
      current: number;
      previous: number;
      change: number;
    };
  };
  renewalAnalysis: {
    automaticRenewals: number;
    manualApplications: number;
    automaticRenewalRate: number;
  };
  topApplicants: Array<{
    applicantName: string;
    companyName: string;
    applicationCount: number;
  }>;
  procedureTypeAnalysis: Array<{
    procedureType: string;
    count: number;
    percentage: number;
  }>;
  cityPerformance: Array<{
    cityCode: string;
    applicationsCount: number;
    percentage: number;
  }>;
  insights: string[];
  recommendations: string[];
  sampleApplications: Application[];
}

export interface ApplicationAnalyticsReport extends ApplicationAnalytics {
  reportAnalysis: ApplicationReportAnalysis;
}

export interface ApplicationFilters {
  applicationId?: string;
  applicantName?: string;
  companyName?: string;
  startDate?: string;
  endDate?: string;
  fileStatus?: string;
  procedureType?: string;
  categoryId?: string;
  plateId?: string;
  isAutomaticRenewal?: boolean;
  cityCode?: string;
  tipoReporte?: 'lista' | 'analisis';
  paginated?: boolean;
  page?: number;
  limit?: number;
}

export interface ReporteParametros extends ApplicationFilters {
  // Alias for consistency with other modules
}