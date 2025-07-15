import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class GradesService {
  private baseUrl = 'https://api.epd.edu.mx/grades';

  constructor(private http: HttpClient) {}

  getGrades(page: number = 1, limit: number = 20): Observable<any> {
    return this.http.get(`${this.baseUrl}?page=${page}&limit=${limit}`);
  }

  getGradesBySubject(subjectId: number, page: number = 1, limit: number = 20): Observable<any> {
    return this.http.get(`${this.baseUrl}/materia/${subjectId}?page=${page}&limit=${limit}`);
  }
}
