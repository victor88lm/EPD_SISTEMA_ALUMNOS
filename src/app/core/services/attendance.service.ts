import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AttendanceService {
  private apiUrl = 'https://api.epd.edu.mx/attendance';

  constructor(private http: HttpClient) {}

  getAttendance(page: number = 1, limit: number = 30): Observable<any> {
    const params = new HttpParams()
      .set('page', page)
      .set('limit', limit);

    return this.http.get<any>(this.apiUrl, { params });
  }
}
