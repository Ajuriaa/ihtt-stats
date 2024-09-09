import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SharedDataService {
  private role: number = 0;

  public getRole(): number {
    return this.role;
  }

  public setRole(role: number): void {
    this.role = role;
  }
}
