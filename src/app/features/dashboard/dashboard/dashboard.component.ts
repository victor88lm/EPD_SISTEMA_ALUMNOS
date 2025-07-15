import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../../../core/services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  data: any = {};
  loading = true;
  error = '';
  
  // Exponer Math para el template
  Math = Math;

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.loadDashboard();
    window.scrollTo(0, 0);
  }

  loadDashboard(): void {
    this.loading = true;
    this.error = '';
    
    this.dashboardService.getDashboard().subscribe({
      next: (res) => {
        if (res.success) {
          this.data = res.data || {};
          this.loading = false;
          // console.log('Dashboard data:', this.data);
        } else {
          this.error = res.message || 'Error al cargar dashboard';
          this.loading = false;
        }
      },
      error: (err) => {
        console.error('Error dashboard:', err);
        
        // Manejar diferentes tipos de errores
        if (err.status === 401) {
          this.error = 'Sesión expirada. Por favor, inicia sesión nuevamente.';
        } else if (err.status === 403) {
          this.error = 'No tienes permisos para acceder a esta información.';
        } else if (err.status === 500) {
          this.error = 'Error interno del servidor. Intenta más tarde.';
        } else if (err.status === 0) {
          this.error = 'No se puede conectar al servidor. Verifica tu conexión.';
        } else {
          this.error = err.error?.message || 'Error al cargar dashboard';
        }
        
        this.loading = false;
      }
    });
  }

  /**
   * Obtener primer nombre para el saludo
   */
  getFirstName(fullName: string): string {
    if (!fullName) return '';
    return fullName.split(' ')[0];
  }

  /**
   * Verificar si hay alertas críticas
   */
  hasCriticalAlerts(): boolean {
    if (!this.data.alerts || !Array.isArray(this.data.alerts)) {
      return false;
    }
    
    return this.data.alerts.some((alert: any) => alert.nivel === 'danger');
  }

  /**
   * Obtener clases CSS para estado financiero
   */
  getFinancialStatusClass(status: string): string {
    switch (status) {
      case 'al_corriente': return 'text-green-600';
      case 'por_vencer': return 'text-yellow-600';
      case 'adeudo':
      case 'atrasado': return 'text-red-600';
      default: return 'text-gray-600';
    }
  }

  getFinancialStatusBg(status: string): string {
    switch (status) {
      case 'al_corriente': return 'bg-gradient-to-br from-green-500 to-emerald-600';
      case 'por_vencer': return 'bg-gradient-to-br from-yellow-500 to-orange-600';
      case 'adeudo':
      case 'atrasado': return 'bg-gradient-to-br from-red-500 to-red-600';
      default: return 'bg-gradient-to-br from-gray-500 to-gray-600';
    }
  }

  getFinancialStatusBadge(status: string): string {
    switch (status) {
      case 'al_corriente': return 'bg-green-100 text-green-800 border border-green-200';
      case 'por_vencer': return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'adeudo':
      case 'atrasado': return 'bg-red-100 text-red-800 border border-red-200';
      default: return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  }

  getFinancialStatusDot(status: string): string {
    switch (status) {
      case 'al_corriente': return 'bg-green-400';
      case 'por_vencer': return 'bg-yellow-400';
      case 'adeudo':
      case 'atrasado': return 'bg-red-400';
      default: return 'bg-gray-400';
    }
  }

  getFinancialProgressWidth(status: string): number {
    switch (status) {
      case 'al_corriente': return 100;
      case 'por_vencer': return 75;
      case 'adeudo': return 25;
      case 'atrasado': return 10;
      default: return 50;
    }
  }

  /**
   * Obtener clases CSS para asistencia
   */
  getAttendanceClass(percentage: number): string {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 80) return 'text-yellow-600';
    return 'text-red-600';
  }

  getAttendanceBg(percentage: number): string {
    if (percentage >= 90) return 'bg-gradient-to-br from-green-500 to-emerald-600';
    if (percentage >= 80) return 'bg-gradient-to-br from-yellow-500 to-orange-600';
    return 'bg-gradient-to-br from-red-500 to-red-600';
  }

  getAttendanceStrokeClass(percentage: number): string {
    if (percentage >= 90) return 'text-green-500';
    if (percentage >= 80) return 'text-yellow-500';
    return 'text-red-500';
  }

  /**
   * Obtener clases CSS para alertas
   */
  getAlertsClass(count: number, hasCritical: boolean): string {
    if (!count) return 'text-green-600';
    if (hasCritical) return 'text-red-600';
    return 'text-yellow-600';
  }

  getAlertsBg(count: number, hasCritical: boolean): string {
    if (!count) return 'bg-gradient-to-br from-green-500 to-emerald-600';
    if (hasCritical) return 'bg-gradient-to-br from-red-500 to-red-600';
    return 'bg-gradient-to-br from-yellow-500 to-orange-600';
  }

  getAlertsMessage(count: number, hasCritical: boolean): string {
    if (!count) return 'Todo perfecto';
    if (hasCritical) return 'Requieren atención';
    return 'Informativas';
  }

  /**
   * Obtener clases CSS específicas para cards de alertas
   */
  getAlertCardClass(level: string): string {
    switch (level) {
      case 'info': return 'bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200 hover:shadow-blue-200/50';
      case 'warning': return 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200 hover:shadow-yellow-200/50';
      case 'danger': return 'bg-gradient-to-br from-red-50 to-pink-50 border-red-200 hover:shadow-red-200/50';
      default: return 'bg-gradient-to-br from-gray-50 to-slate-50 border-gray-200 hover:shadow-gray-200/50';
    }
  }

  getAlertIconClass(level: string): string {
    switch (level) {
      case 'info': return 'bg-blue-100 border border-blue-200';
      case 'warning': return 'bg-yellow-100 border border-yellow-200';
      case 'danger': return 'bg-red-100 border border-red-200';
      default: return 'bg-gray-100 border border-gray-200';
    }
  }

  getAlertIconColor(level: string): string {
    switch (level) {
      case 'info': return 'text-blue-600';
      case 'warning': return 'text-yellow-600';
      case 'danger': return 'text-red-600';
      default: return 'text-gray-600';
    }
  }

  getAlertButtonClass(level: string): string {
    switch (level) {
      case 'info': return 'text-blue-600 hover:text-blue-700';
      case 'warning': return 'text-yellow-600 hover:text-yellow-700';
      case 'danger': return 'text-red-600 hover:text-red-700';
      default: return 'text-gray-600 hover:text-gray-700';
    }
  }

  getAlertGradient(level: string): string {
    switch (level) {
      case 'info': return 'from-blue-500 to-cyan-500';
      case 'warning': return 'from-yellow-500 to-orange-500';
      case 'danger': return 'from-red-500 to-pink-500';
      default: return 'from-gray-500 to-slate-500';
    }
  }

  /**
   * Obtener el color de calificación
   */
  getGradeColor(grade: number): string {
    if (grade >= 8) return 'text-green-600';
    if (grade >= 7) return 'text-yellow-600';
    return 'text-red-600';
  }

  /**
   * Formatear estado financiero para mostrar
   */
  formatFinancialStatus(status: string): string {
    if (!status) return '';
    
    const statusMap: { [key: string]: string } = {
      'al_corriente': 'Al Corriente',
      'por_vencer': 'Por Vencer',
      'adeudo': 'Con Adeudo',
      'atrasado': 'Atrasado'
    };
    
    return statusMap[status] || status;
  }

  /**
   * Obtener background para iconos de actividad
   */
  getActivityIconBg(activityType: string): string {
    switch (activityType) {
      case 'pago': return 'bg-gradient-to-br from-green-500 to-emerald-600';
      case 'calificacion': return 'bg-gradient-to-br from-blue-500 to-indigo-600';
      case 'asistencia': return 'bg-gradient-to-br from-purple-500 to-pink-600';
      case 'inscripcion': return 'bg-gradient-to-br from-orange-500 to-red-600';
      default: return 'bg-gradient-to-br from-gray-500 to-slate-600';
    }
  }

  /**
   * Cargar información específica de pagos
   */
  loadPaymentSummary(): void {
    this.dashboardService.getPaymentSummary().subscribe({
      next: (res) => {
        if (res.success) {
          this.data.payment_summary = res.data;
        }
      },
      error: (err) => console.error('Error cargando pagos:', err)
    });
  }

  /**
   * Cargar información específica de asistencias
   */
  loadAttendanceSummary(): void {
    this.dashboardService.getAttendanceSummary().subscribe({
      next: (res) => {
        if (res.success) {
          this.data.attendance_summary = res.data;
        }
      },
      error: (err) => console.error('Error cargando asistencias:', err)
    });
  }

  /**
   * Cargar información académica
   */
  loadAcademicProgress(): void {
    this.dashboardService.getAcademicProgress().subscribe({
      next: (res) => {
        if (res.success) {
          this.data.academic_progress = res.data.academic_progress;
          this.data.schedule_info = res.data.schedule_info;
        }
      },
      error: (err) => console.error('Error cargando progreso académico:', err)
    });
  }

  /**
   * Cargar alertas
   */
  loadAlerts(): void {
    this.dashboardService.getAlerts().subscribe({
      next: (res) => {
        if (res.success) {
          this.data.alerts = res.data.alerts;
        }
      },
      error: (err) => console.error('Error cargando alertas:', err)
    });
  }

  /**
   * Cargar actividad reciente
   */
  loadRecentActivity(): void {
    this.dashboardService.getRecentActivity().subscribe({
      next: (res) => {
        if (res.success) {
          this.data.recent_activity = res.data.recent_activity;
        }
      },
      error: (err) => console.error('Error cargando actividad:', err)
    });
  }

  /**
   * Obtener resumen rápido
   */
  loadQuickSummary(): void {
    this.dashboardService.getQuickSummary().subscribe({
      next: (res) => {
        if (res.success) {
          // console.log('Resumen rápido:', res.data);
        }
      },
      error: (err) => console.error('Error cargando resumen:', err)
    });
  }

  /**
   * Refrescar sección específica
   */
  refreshSection(section: string): void {
    switch (section) {
      case 'payments':
        this.loadPaymentSummary();
        break;
      case 'attendance':
        this.loadAttendanceSummary();
        break;
      case 'academic':
        this.loadAcademicProgress();
        break;
      case 'alerts':
        this.loadAlerts();
        break;
      case 'activity':
        this.loadRecentActivity();
        break;
      default:
        this.loadDashboard();
    }
  }

  /**
   * Manejar acción de alerta
   */
  handleAlertAction(alert: any): void {
    // console.log('Acción de alerta:', alert);
    
    // Aquí podrías implementar acciones específicas según el tipo de alerta
    switch (alert.tipo) {
      case 'financiero':
        // Redirigir a pagos o mostrar modal de pago
        // console.log('Acción financiera:', alert.accion);
        // Ejemplo: this.router.navigate(['/payments']);
        break;
      case 'academico':
        // Mostrar información académica detallada
        // console.log('Acción académica:', alert.accion);
        // Ejemplo: this.router.navigate(['/grades']);
        break;
      default:
        // console.log('Acción general:', alert.accion);
    }
  }

  /**
   * Obtener icono según el tipo de actividad
   */
  getActivityIcon(activityType: string): string {
    const icons: { [key: string]: string } = {
      'pago': 'credit-card',
      'calificacion': 'academic-cap',
      'asistencia': 'calendar',
      'inscripcion': 'user-plus'
    };
    
    return icons[activityType] || 'information-circle';
  }

  /**
   * Trackear elementos para mejor rendimiento en ngFor
   */
  trackByIndex(index: number, item: any): number {
    return index;
  }

  trackByAlertId(index: number, alert: any): string {
    return alert.titulo + alert.nivel;
  }

  trackByActivityDate(index: number, activity: any): string {
    return activity.fecha + activity.tipo;
  }
}