import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environments';
import { 
  ApplicationResponse, 
  ApplicationAnalytics, 
  ApplicationAnalyticsReport, 
  ApplicationDashboard,
  ApplicationFilters 
} from '../interfaces/applications.interfaces';

@Injectable({
  providedIn: 'root'
})
export class ApplicationsQueries {
  constructor(private http: HttpClient) {}

  private cleanParams(params: ApplicationFilters): Record<string, string> {
    const cleaned: Record<string, string> = {};
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        cleaned[key] = String(value);
      }
    });
    
    return cleaned;
  }

  public getApplications(params: ApplicationFilters): Observable<ApplicationResponse> {
    const cleanedParams = this.cleanParams(params);
    const queryString = new URLSearchParams(cleanedParams).toString();
    return this.http.get<ApplicationResponse>(`${environment.apiUrl}/applications?${queryString}`);
  }

  public getApplicationsAnalytics(params: ApplicationFilters): Observable<ApplicationAnalytics> {
    const cleanedParams = this.cleanParams(params);
    const queryString = new URLSearchParams(cleanedParams).toString();
    return this.http.get<ApplicationAnalytics>(`${environment.apiUrl}/applications-analytics?${queryString}`);
  }

  public getApplicationsAnalyticsReport(params: ApplicationFilters): Observable<ApplicationAnalyticsReport> {
    const cleanedParams = this.cleanParams(params);
    const queryString = new URLSearchParams(cleanedParams).toString();
    return this.http.get<ApplicationAnalyticsReport>(`${environment.apiUrl}/applications-analytics-report?${queryString}`);
  }

  public getApplicationsDashboard(params: ApplicationFilters = {}): Observable<ApplicationDashboard> {
    const cleanedParams = this.cleanParams(params);
    const queryString = new URLSearchParams(cleanedParams).toString();
    return this.http.get<ApplicationDashboard>(`${environment.apiUrl}/applications-dashboard?${queryString}`);
  }
}