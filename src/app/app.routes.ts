// app.routes.ts
import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { 
        path: 'dashboard', 
        loadComponent: () => import('./features/dashboard/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      { 
        path: 'Asistencias', 
        loadComponent: () => import('./features/attendance/attendance.component').then(m => m.AttendanceComponent)
      },
      { 
        path: 'Calificaciones',
        loadComponent: () => import('./features/grades/grades.component').then(m => m.GradesComponent) 
      },
      { 
        path: 'Pagos',
        loadComponent: () => import('./features/payments/payments.component').then(m => m.PaymentsComponent) 
      },

    ]
  },
  // Ruta de fallback
  { path: '**', redirectTo: '/login' }
];