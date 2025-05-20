// login.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  referencia: string = '';
  password: string = '';
  plantel: string = '';
  showPassword: boolean = false;

  constructor(private router: Router) {}

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    // Aquí implementarás la lógica de autenticación cuando la necesites
    console.log('Intento de login:', {
      referencia: this.referencia,
      plantel: this.plantel
    });
    
    // Ejemplo básico de redirección (ajustar según necesidades)
    // this.router.navigate(['/dashboard']);
  }
}