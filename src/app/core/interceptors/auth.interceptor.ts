// src/app/core/interceptors/auth.interceptor.ts

import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  const token = getJwtToken();

  // Clonar request base
  let authReq = req.clone({
    setHeaders: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  });

  // Si hay token y no ha expirado, agregarlo al header Authorization
  if (token && !isTokenExpired(token)) {
    authReq = authReq.clone({
      setHeaders: {
        'Authorization': `Bearer ${token}`
      }
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      const isExemptFromRedirect = req.url.includes('/auth/login') || req.url.includes('/auth/me/photo');

      // Si es error 401 y no es una URL exenta, entonces limpiar sesión
      if (error.status === 401 && !isExemptFromRedirect) {
        console.warn('Token expirado o inválido. Cerrando sesión.');

        clearAuthData();

        if (!router.url.includes('/login')) {
          router.navigate(['/login']);
        }
      }

      // Otros errores (no 401) para debugging
      if (error.status !== 401) {
        console.error('HTTP Error:', {
          status: error.status,
          message: error.message,
          url: error.url,
          error: error.error
        });
      }

      return throwError(() => error);
    })
  );
};

/** Obtener JWT del localStorage */
function getJwtToken(): string | null {
  try {
    return localStorage.getItem('jwt_token');
  } catch (error) {
    console.error('Error obteniendo token:', error);
    return null;
  }
}

/** Verificar si el token JWT ha expirado */
function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp * 1000; // en ms
    return Date.now() >= exp;
  } catch (error) {
    console.error('Error al verificar expiración del token:', error);
    return true;
  }
}

/** Limpiar sesión local */
function clearAuthData(): void {
  try {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user');
  } catch (error) {
    console.error('Error limpiando datos del usuario:', error);
  }
}
