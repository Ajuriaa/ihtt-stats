import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environments';
import { CertificateResponse } from '../interfaces';

@Injectable({
  providedIn: 'root'
})
export class DashboardQueries {
  constructor(private http: HttpClient) {}

  public getCertificates(params: Object): Observable<CertificateResponse> {
    const queryString = new URLSearchParams(params as any).toString(); // Convierte los parámetros a query string
    return this.http.get<CertificateResponse>(`${environment.apiUrl}/certificates?${queryString}`);
  }
}
