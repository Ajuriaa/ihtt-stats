import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environments';
import { CertificateResponse, FineResponse } from '../interfaces';

@Injectable({
  providedIn: 'root'
})
export class DashboardQueries {
  constructor(private http: HttpClient) {}

  public getCertificates(params: Object): Observable<CertificateResponse> {
    const queryString = new URLSearchParams(params as any).toString(); // Convierte los parámetros a query string
    return this.http.get<CertificateResponse>(`${environment.apiUrl}/certificates?${queryString}`);
  }

  public getFines(params: Object): Observable<FineResponse> {
    const queryString = new URLSearchParams(params as any).toString();
    return this.http.get<FineResponse>(`${environment.apiUrl}/fines?${queryString}`);
  }

  public getDashboardAnalytics(params: Object): Observable<any> {
    const queryString = new URLSearchParams(params as any).toString();
    return this.http.get<any>(`${environment.apiUrl}/dashboard-analytics?${queryString}`);
  }

  public getFinesAnalytics(params: Object): Observable<any> {
    const queryString = new URLSearchParams(params as any).toString();
    return this.http.get<any>(`${environment.apiUrl}/fines-analytics?${queryString}`);
  }
}
