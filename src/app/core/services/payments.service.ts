import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PaymentsService {
  private apiUrl = 'https://api.epd.edu.mx/payments';

  constructor(private http: HttpClient) {}

  getPayments(page = 1, limit = 30): Observable<any> {
    return this.http.get(`${this.apiUrl}?page=${page}&limit=${limit}`);
  }
}
