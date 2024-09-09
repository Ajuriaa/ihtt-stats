import { Injectable } from '@angular/core';
import moment from 'moment';
import { Model } from '../enums';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  constructor() {}

  public filterData(data: any[], term: string, dataModel: string): any[] {
    return data;
  }
}
