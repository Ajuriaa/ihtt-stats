import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environments';
import { IExpedientByModalityAndProcedureQuery, IExpedientByProcedureAndCategoryQuery, IExpedientRenovationQuery } from '../interfaces';

@Injectable({
  providedIn: 'root'
})
export class OperationsQueries {
  constructor(private http: HttpClient) {}

  public getExpedientsByType(start: string, end: string): Observable<IExpedientRenovationQuery[]> {
    return this.http.get<IExpedientRenovationQuery[]>(`${environment.apiUrl}/expedients-by-type/${start}/${end}`);
  }

  public getExpedientsByProcedure(start: string, end: string): Observable<IExpedientByProcedureAndCategoryQuery[]> {
    return this.http.get<IExpedientByProcedureAndCategoryQuery[]>(`${environment.apiUrl}/expedients-by-procedure/${start}/${end}`);
  }

  public getExpedientsByModality(start: string, end: string): Observable<IExpedientByModalityAndProcedureQuery[]> {
    return this.http.get<IExpedientByModalityAndProcedureQuery[]>(`${environment.apiUrl}/expedients-by-modality/${start}/${end}`);
  }
}
