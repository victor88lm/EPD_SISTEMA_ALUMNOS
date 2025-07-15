// src/app/auth/login/login.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { AuthService, LoginResponse } from '../../core/services/auth.service';
import { Plantel, isValidPlantel, getPlantelDisplayName } from '../../core/models/student';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit, OnDestroy {
  // Datos del formulario
  refEsc: string = '';
  password: string = '';
  plantel: string = '';
  
  // Estado del componente
  showPassword: boolean = false;
  isLoading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
  showDebugInfo: boolean = false;
  
  // Datos para el select de planteles
  planteles = [
    { value: Plantel.CENTRO, label: 'Centro' },
    { value: Plantel.ECATEPEC, label: 'Ecatepec' },
    { value: Plantel.HUIPULCO, label: 'Huipulco' },
    { value: Plantel.IZCALLI, label: 'Izcalli' }
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Si ya está logueado, redirigir al dashboard
    if (this.authService.isAuthenticated() && !this.authService.isTokenExpired()) {
      this.router.navigate(['/dashboard']);
    }

    // Opcional: Cargar planteles dinámicamente desde la API
    this.loadPlanteles();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Cargar planteles desde la API (opcional)
   */
  loadPlanteles(): void {
    this.authService.getPlanteles()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            // Actualizar lista de planteles si viene de la API
            this.planteles = response.data.map((p: any) => ({
              value: p.id,
              label: p.nombre
            }));
          }
        },
        error: (error) => {
          // Si falla, usar planteles por defecto
          // console.warn('No se pudieron cargar planteles desde API, usando valores por defecto');
        }
      });
  }

  /**
   * Toggle visibilidad de contraseña
   */
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  /**
   * Limpiar mensajes de error
   */
  clearError(): void {
    this.errorMessage = '';
  }

  /**
   * Validar formulario
   */
  validateForm(): boolean {
    this.clearError();

    if (!this.refEsc.trim()) {
      this.errorMessage = 'La referencia escolar es requerida';
      return false;
    }

    if (!this.isValidRefEsc()) {
      this.errorMessage = 'La referencia escolar debe contener solo números';
      return false;
    }

    if (!this.password.trim()) {
      this.errorMessage = 'La contraseña es requerida';
      return false;
    }

    if (!this.plantel) {
      this.errorMessage = 'Por favor selecciona un plantel';
      return false;
    }

    if (!isValidPlantel(this.plantel)) {
      this.errorMessage = 'Plantel no válido';
      return false;
    }

    return true;
  }

  /**
   * Validar que refEsc solo contenga números
   */
  isValidRefEsc(): boolean {
    return /^\d+$/.test(this.refEsc.trim());
  }

  /**
   * Enviar formulario de login
   */
  onSubmit(): void {
    if (!this.validateForm()) {
      return;
    }

    this.isLoading = true;
    this.clearError();

    // console.log('Iniciando login:', {
    //   refEsc: this.refEsc,
    //   plantel: this.plantel,
    // });

    this.authService.login(this.refEsc.trim(), this.password, this.plantel)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: LoginResponse) => {
          this.isLoading = false;
          
          // console.log('Login exitoso:', {
          //   user: response.data.user.nombre,
          //   plantel: response.data.user.plantel
          // });

          // Redirigir al dashboard
          setTimeout(() => {
            this.router.navigate(['/dashboard']);
          }, 1000);
        },
        error: (error) => {
          this.isLoading = false;
          
          console.error('Error en login:', error);

          // Manejar diferentes tipos de error
          if (error.userMessage) {
            this.errorMessage = error.userMessage;
          } else if (error.status === 401) {
            this.errorMessage = 'Credenciales incorrectas. Verifica tu referencia, contraseña y plantel.';
          } else if (error.status === 400) {
            this.errorMessage = 'Datos incorrectos. Verifica todos los campos.';
          } else if (error.status === 0) {
            this.errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión a internet.';
          } else if (error.status >= 500) {
            this.errorMessage = 'Error en el servidor. Intenta nuevamente en unos minutos.';
          } else {
            this.errorMessage = 'Ocurrió un error inesperado. Intenta nuevamente.';
          }
        }
      });
  }

  /**
   * Mostrar mensaje de éxito
   */
  private showSuccessMessage(userName: string): void {
    // Podrías usar un toast o notification service aquí
    // console.log(`¡Bienvenido ${userName}!`);
  }

  /**
   * Generar contraseña de ejemplo
   */
  showPasswordHint(): void {
    if (this.refEsc.trim()) {
      const hint = `Tu contraseña es: ${this.refEsc}TuApellidoPaterno`;
      alert(`Ejemplo de contraseña:\n${hint}\n\nDonde "TuApellidoPaterno" es tu apellido paterno real.`);
    } else {
      alert('Ingresa tu referencia escolar primero para ver el ejemplo.');
    }
  }

  /**
   * Ir a página de recuperación (si existe)
   */
  goToRecovery(): void {
    // Implementar si tienes página de recuperación de contraseña
    // console.log('Redirigir a recuperación de contraseña');
  }

  /**
   * Obtener nombre del plantel seleccionado
   */
  getPlantelName(plantel: string): string {
    return getPlantelDisplayName(plantel);
  }
}