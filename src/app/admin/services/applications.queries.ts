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

  public getApplications(params: ApplicationFilters): Observable<ApplicationResponse> {
    const queryString = new URLSearchParams(params as any).toString();
    return this.http.get<ApplicationResponse>(`${environment.apiUrl}/applications?${queryString}`);
  }

  public getApplicationsAnalytics(params: ApplicationFilters): Observable<ApplicationAnalytics> {
    const queryString = new URLSearchParams(params as any).toString();
    return this.http.get<ApplicationAnalytics>(`${environment.apiUrl}/applications-analytics?${queryString}`);
  }

  public getApplicationsAnalyticsReport(params: ApplicationFilters): Observable<ApplicationAnalyticsReport> {
    const queryString = new URLSearchParams(params as any).toString();
    return this.http.get<ApplicationAnalyticsReport>(`${environment.apiUrl}/applications-analytics-report?${queryString}`);
  }

  public getApplicationsDashboard(params: ApplicationFilters = {}): Observable<ApplicationDashboard> {
    const queryString = new URLSearchParams(params as any).toString();
    return this.http.get<ApplicationDashboard>(`${environment.apiUrl}/applications-dashboard?${queryString}`);
  }
}