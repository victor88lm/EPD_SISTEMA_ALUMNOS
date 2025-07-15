import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';

export interface DashboardResponse {
  success: boolean;
  status: number;
  message: string;
  timestamp: string;
  data?: any;
}

export interface PaymentSummary {
  saldo_actual: number;
  estado_financiero: 'al_corriente' | 'por_vencer' | 'adeudo' | 'atrasado';
  pagado_hasta: string;
  dias_sin_pagar: number;
  total_pagos_realizados: number;
  monto_total_pagado: number;
  ultimo_pago: string;
  promedio_pago: number;
  precio_colegiatura: {
    semanal: number;
    mensual: number;
  };
}

export interface AttendanceSummary {
  periodo: string;
  total_dias_registrados: number;
  dias_asistidos: number;
  faltas: number;
  retardos: number;
  porcentaje_asistencia: number;
  porcentaje_faltas: number;
  porcentaje_retardos: number;
  promedio_minutos_tarde: number;
  estado_asistencia: 'excelente' | 'buena' | 'regular' | 'deficiente';
  ultimas_asistencias: any[];
}

export interface AcademicProgress {
  porcentaje_progreso_curso: number;
  dias_transcurridos: number;
  dias_restantes: number;
  duracion_total_dias: number;
  calificaciones: {
    promedio_general: number;
    total_evaluaciones: number;
    mejor_calificacion: number;
    calificacion_minima: number;
  };
}

export interface Alert {
  tipo: 'financiero' | 'academico' | 'general';
  nivel: 'info' | 'warning' | 'danger';
  titulo: string;
  mensaje: string;
  accion: string;
}

export interface RecentActivity {
  tipo: 'pago' | 'calificacion' | 'asistencia' | 'inscripcion';
  fecha: string;
  descripcion: string;
  detalle: string;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private baseUrl = 'https://api.epd.edu.mx/dashboard';
  
  constructor(private http: HttpClient) {}

  /**
   * Obtener headers con token de autenticación
   */
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
    
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  /**
   * Manejar errores HTTP
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Error desconocido';
    
    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del lado del servidor
      switch (error.status) {
        case 401:
          errorMessage = 'Sesión expirada. Por favor, inicia sesión nuevamente.';
          // Aquí podrías redirigir al login
          break;
        case 403:
          errorMessage = 'No tienes permisos para acceder a esta información.';
          break;
        case 404:
          errorMessage = 'Recurso no encontrado.';
          break;
        case 500:
          errorMessage = 'Error interno del servidor. Intenta más tarde.';
          break;
        case 0:
          errorMessage = 'No se puede conectar al servidor. Verifica tu conexión.';
          break;
        default:
          errorMessage = error.error?.message || `Error ${error.status}: ${error.statusText}`;
      }
    }
    
    console.error('Error en DashboardService:', error);
    return throwError(() => ({ 
      status: error.status, 
      message: errorMessage,
      error: error.error 
    }));
  }

  /**
   * Dashboard completo del estudiante
   */
  getDashboard(): Observable<DashboardResponse> {
    return this.http.get<DashboardResponse>(this.baseUrl, { 
      headers: this.getHeaders() 
    }).pipe(
      retry(2), // Reintentar hasta 2 veces en caso de error
      catchError(this.handleError)
    );
  }

  /**
   * Resumen financiero del estudiante
   */
  getPaymentSummary(): Observable<DashboardResponse> {
    return this.http.get<DashboardResponse>(`${this.baseUrl}/payments`, { 
      headers: this.getHeaders() 
    }).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  /**
   * Resumen de asistencias del estudiante
   */
  getAttendanceSummary(): Observable<DashboardResponse> {
    return this.http.get<DashboardResponse>(`${this.baseUrl}/attendance`, { 
      headers: this.getHeaders() 
    }).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  /**
   * Progreso académico del estudiante
   */
  getAcademicProgress(): Observable<DashboardResponse> {
    return this.http.get<DashboardResponse>(`${this.baseUrl}/academic`, { 
      headers: this.getHeaders() 
    }).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  /**
   * Alertas y notificaciones del estudiante
   */
  getAlerts(): Observable<DashboardResponse> {
    return this.http.get<DashboardResponse>(`${this.baseUrl}/alerts`, { 
      headers: this.getHeaders() 
    }).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  /**
   * Actividad reciente del estudiante
   */
  getRecentActivity(): Observable<DashboardResponse> {
    return this.http.get<DashboardResponse>(`${this.baseUrl}/activity`, { 
      headers: this.getHeaders() 
    }).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  /**
   * Resumen rápido para widgets
   */
  getQuickSummary(): Observable<DashboardResponse> {
    return this.http.get<DashboardResponse>(`${this.baseUrl}/summary`, { 
      headers: this.getHeaders() 
    }).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  /**
   * Estadísticas del dashboard
   */
  getDashboardStats(): Observable<DashboardResponse> {
    return this.http.get<DashboardResponse>(`${this.baseUrl}/stats`, { 
      headers: this.getHeaders() 
    }).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  // Métodos de utilidad para el frontend

  /**
   * Verificar si el token está presente
   */
  hasValidToken(): boolean {
    const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
    return !!token;
  }

  /**
   * Formatear estado financiero
   */
  formatFinancialStatus(status: string): string {
    const statusMap: { [key: string]: string } = {
      'al_corriente': 'Al Corriente',
      'por_vencer': 'Por Vencer',
      'adeudo': 'Con Adeudo',
      'atrasado': 'Atrasado'
    };
    
    return statusMap[status] || status;
  }

  /**
   * Obtener color para estado financiero
   */
  getFinancialStatusColor(status: string): string {
    const colorMap: { [key: string]: string } = {
      'al_corriente': 'green',
      'por_vencer': 'yellow',
      'adeudo': 'red',
      'atrasado': 'red'
    };
    
    return colorMap[status] || 'gray';
  }

  /**
   * Formatear estado de asistencia
   */
  formatAttendanceStatus(status: string): string {
    const statusMap: { [key: string]: string } = {
      'excelente': 'Excelente',
      'buena': 'Buena',
      'regular': 'Regular',
      'deficiente': 'Deficiente'
    };
    
    return statusMap[status] || status;
  }

  /**
   * Obtener color para asistencia
   */
  getAttendanceColor(percentage: number): string {
    if (percentage >= 90) return 'green';
    if (percentage >= 80) return 'yellow';
    return 'red';
  }

  /**
   * Obtener color para nivel de alerta
   */
  getAlertColor(level: string): string {
    const colorMap: { [key: string]: string } = {
      'info': 'blue',
      'warning': 'yellow',
      'danger': 'red'
    };
    
    return colorMap[level] || 'gray';
  }

  /**
   * Formatear moneda
   */
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  }

  /**
   * Formatear fecha
   */
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  }

  /**
   * Calcular días entre fechas
   */
  daysBetween(date1: string, date2: string): number {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}