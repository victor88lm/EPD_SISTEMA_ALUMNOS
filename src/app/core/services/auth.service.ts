// src/app/core/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError, throwError } from 'rxjs';
import { Student } from '../models/student';

export interface LoginResponse {
  success: boolean;
  status: number;
  message: string;
  data: {
    token: string;
    user: {
      id: number;
      refEsc: number;
      nombre: string;
      apellidoPaterno: string;
      apellidoMaterno: string;
      nombreCompleto: string;
      correo: string;
      plantel: string;
      tipoUsuario: number;
      status: number;
      curso: number;
      nivel: number;
      fechaInicio: string;
      fechaTermino: string;
    };
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  status: number;
  message: string;
  data?: T;
  timestamp: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'https://api.epd.edu.mx'; // Tu nueva API
  
  private _currentUser = new BehaviorSubject<Student | null>(this.getUser());
  public currentUser = this._currentUser.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Login con JWT
   */
  login(refEsc: string, password: string, plantel: string): Observable<LoginResponse> {
    const loginData = {
      refEsc: parseInt(refEsc), // Convertir a número
      password: password,
      plantel: plantel.toLowerCase()
    };

    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, loginData)
      .pipe(
        tap((response: LoginResponse) => {
          if (response.success && response.data) {
            // Guardar token JWT
            this.setToken(response.data.token);
            
            // Convertir usuario de API a modelo Student
            const student: Student = this.mapApiUserToStudent(response.data.user);
            
            // Guardar usuario y notificar
            this.setUser(student);
            this._currentUser.next(student);
          }
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Logout
   */
  logout(): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.apiUrl}/auth/logout`, {})
      .pipe(
        tap(() => {
          this.clearSession();
          this._currentUser.next(null);
        }),
        catchError((error) => {
          // Limpiar sesión incluso si falla la petición
          this.clearSession();
          this._currentUser.next(null);
          return this.handleError(error);
        })
      );
  }

  /**
   * Obtener información del usuario actual desde la API
   */
  me(): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(`${this.apiUrl}/auth/me`)
      .pipe(
        tap((response: ApiResponse) => {
          if (response.success && response.data) {
            const student: Student = this.mapApiUserToStudent(response.data);
            this.setUser(student);
            this._currentUser.next(student);
          }
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Verificar si el token es válido
   */
  verifyToken(): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(`${this.apiUrl}/auth/verify`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Obtener planteles disponibles
   */
  getPlanteles(): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(`${this.apiUrl}/auth/planteles`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Verificar si está autenticado
   */
  isAuthenticated(): boolean {
    const token = this.getToken();
    const user = this.getUser();
    return !!(token && user);
  }

  /**
   * Verificar si el token ha expirado (básico)
   */
  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) return true;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = payload.exp * 1000; // Convertir a milisegundos
      return Date.now() >= exp;
    } catch (error) {
      return true;
    }
  }

  /**
   * Gestión del token JWT
   */
  setToken(token: string): void {
    localStorage.setItem('jwt_token', token);
  }

  getToken(): string | null {
    return localStorage.getItem('jwt_token');
  }

  getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    });
  }

  /**
   * Gestión del usuario
   */
  setUser(user: Student): void {
    localStorage.setItem('user', JSON.stringify(user));
  }

  getUser(): Student | null {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  /**
   * Limpiar sesión completa
   */
  clearSession(): void {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user');
  }

  /**
   * Mapear usuario de API a modelo Student
   */
  private mapApiUserToStudent(apiUser: any): Student {
    return {
      id: apiUser.id,
      nombre: apiUser.nombre,
      apellidoPaterno: apiUser.apellidoPaterno,
      apellidoMaterno: apiUser.apellidoMaterno,
      refSEP: apiUser.refEsc?.toString() || '', // Convertir refEsc a refSEP
      plantel: apiUser.plantel,
      nombreCompleto: apiUser.nombreCompleto || `${apiUser.nombre} ${apiUser.apellidoPaterno} ${apiUser.apellidoMaterno}`.trim(),
      correo: apiUser.correo,
      tipoUsuario: apiUser.tipoUsuario,
      status: apiUser.status,
      curso: apiUser.curso,
      nivel: apiUser.nivel,
      fechaInicio: apiUser.fechaInicio,
      fechaTermino: apiUser.fechaTermino
    };
  }

  /**
   * Manejo de errores
   */
  private handleError(error: any): Observable<never> {
    console.error('Error en AuthService:', error);
    
    let errorMessage = 'Error desconocido';
    
    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.status === 0) {
      errorMessage = 'No se pudo conectar con el servidor';
    } else if (error.status === 401) {
      errorMessage = 'Credenciales incorrectas';
      // Limpiar sesión en caso de 401
      this.clearSession();
      this._currentUser.next(null);
    } else if (error.status === 422) {
      errorMessage = 'Datos de entrada inválidos';
    } else if (error.status >= 500) {
      errorMessage = 'Error interno del servidor';
    }

    return throwError(() => ({
      ...error,
      userMessage: errorMessage
    }));
  }

  /**
   * Refrescar datos del usuario
   */
  refreshUser(): void {
    if (this.isAuthenticated() && !this.isTokenExpired()) {
      this.me().subscribe({
        next: () => console.log('Usuario actualizado'),
        error: (error) => console.error('Error actualizando usuario:', error)
      });
    }
  }
}