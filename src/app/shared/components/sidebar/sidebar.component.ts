// Actualización optimizada para tu AuthService existente - sidebar.component.ts

import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { Student } from '../../../core/models/student';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http'; // ← AGREGAR ESTA IMPORTACIÓN

interface MenuItem {
  title: string;
  icon: string;
  route: string;
  active?: boolean;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent implements OnInit {
  @Input() isCollapsed = false;
  @Output() toggleCollapse = new EventEmitter<void>();

  currentUser: Student | null = null;
  photoUrl: SafeUrl = '/images/default-avatar.png';
  
  // ← AGREGAR ESTA PROPIEDAD
  private apiUrl = 'https://api.epd.edu.mx'; 

  menuItems: MenuItem[] = [
    {
      title: 'Inicio',
      icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z',
      route: '/dashboard',
      active: true
    },
    {
      title: 'Asistencias',
      icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      route: '/Asistencias'
    },
    {
      title: 'Calificaciones',
      icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01',
      route: '/Calificaciones'
    },
    {
      title: 'Historial de Pagos',
      icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1',
      route: '/Pagos'
    }
  ];

  constructor(
    private authService: AuthService,
    private router: Router,
    private sanitizer: DomSanitizer,
    private http: HttpClient // ← AGREGAR ESTA DEPENDENCIA
  ) {}

  ngOnInit() {
    window.scrollTo(0, 0); // Asegurarse de que la página esté en la parte superior al cargar
    this.authService.currentUser.subscribe(user => {
      this.currentUser = user;
      if (user) {
        // console.log('Usuario cargado:', user); // Debug
        this.loadPhoto();
      }
    });

    this.setActiveMenuItem();
  }

  private setActiveMenuItem(): void {
    const currentRoute = this.router.url;
    this.menuItems.forEach(item => {
      item.active = item.route === currentRoute;
    });
  }

  get isMobile(): boolean {
    return window.innerWidth < 1024;
  }

  logout() {
    this.authService.logout().subscribe({
      next: () => this.router.navigate(['/login']),
      error: () => this.router.navigate(['/login'])
    });
  }

  selectMenuItem(item: MenuItem) {
    this.menuItems.forEach(menuItem => menuItem.active = false);
    item.active = true;
    this.router.navigate([item.route]);

    if (this.isMobile) {
      this.toggleCollapse.emit();
    }
  }

  getCurrentPageTitle(): string {
    const activeItem = this.menuItems.find(item => item.active);
    return activeItem ? activeItem.title : 'Dashboard';
  }

  getUserDisplayName(): string {
    if (this.currentUser?.nombre && this.currentUser?.apellidoPaterno) {
      return `${this.currentUser.nombre} ${this.currentUser.apellidoPaterno}`;
    }
    return 'Usuario';
  }

  getPlantelDisplayName(): string {
    if (this.currentUser?.plantel) {
      return this.currentUser.plantel.charAt(0).toUpperCase() + this.currentUser.plantel.slice(1);
    }
    return 'Centro';
  }

  getIconSize(): string {
    return this.isMobile ? 'h-4 w-4' : 'h-5 w-5';
  }

  getContainerSize(): string {
    if (this.isCollapsed && !this.isMobile) {
      return 'w-9 h-9';
    } else if (this.isMobile) {
      return 'w-8 h-8';
    } else {
      return 'w-10 h-10';
    }
  }

  getLogoutContainerClasses(): string {
    const baseClasses = 'bg-blue-800/40 group-hover:bg-red-600/40 group-hover:scale-110 group-hover:shadow-xl border-2 border-blue-700/30 group-hover:border-red-400/50';

    if (this.isCollapsed && !this.isMobile) {
      return `w-9 h-9 ${baseClasses}`;
    } else if (this.isMobile) {
      return `w-8 h-8 mr-2 ${baseClasses}`;
    } else {
      return `w-10 h-10 mr-3 ${baseClasses}`;
    }
  }

  // ← REEMPLAZAR ESTA FUNCIÓN COMPLETA
  loadPhoto(): void {
    if (!this.currentUser) {
      // console.log('No hay usuario actual');
      this.setDefaultPhoto();
      return;
    }

    // console.log('Cargando foto para usuario:', this.currentUser); // Debug

    // Verificar que el usuario esté autenticado
    if (!this.authService.isAuthenticated()) {
      // console.log('Usuario no autenticado');
      this.setDefaultPhoto();
      return;
    }

    // OPCIÓN 1: Usar endpoint protegido /auth/me/photo (RECOMENDADO)
    this.loadPhotoWithToken();

    // OPCIÓN 2: Usar endpoint público (descomenta si prefieres esta opción)
    // this.loadPhotoPublic();
  }

  // ← MÉTODO PRINCIPAL USANDO TU AUTHSERVICE
  private loadPhotoWithToken(): void {
    // Usar el método getAuthHeaders() de tu AuthService
    const headers = this.authService.getAuthHeaders();
    
    // console.log('Cargando foto con token...'); // Debug
    // console.log('Headers usados para foto:', headers.get('Authorization'));

    this.http.get(`${this.apiUrl}/auth/me/photo`, { 
      headers, 
      responseType: 'blob' 
    }).subscribe({
      next: (blob: Blob) => {
        // console.log('Foto cargada exitosamente'); // Debug
        const imageUrl = URL.createObjectURL(blob);
        this.photoUrl = this.sanitizer.bypassSecurityTrustUrl(imageUrl);
      },
      error: (error) => {
        console.error('Error cargando foto del usuario:', error);
        // Si es 404, la foto no existe - usar por defecto
        if (error.status === 404) {
          // console.log('Foto no encontrada, usando imagen por defecto');
        }
        this.setDefaultPhoto();
      }
    });
  }

  // ← MÉTODO ALTERNATIVO USANDO ENDPOINT PÚBLICO
  private loadPhotoPublic(): void {
    if (this.currentUser?.plantel && this.currentUser?.refSEP) {
      // console.log(`Intentando cargar foto: ${this.currentUser.plantel}/${this.currentUser.refSEP}`); // Debug
      
      // Primero verificar si existe la foto
      this.http.get(`${this.apiUrl}/photos/${this.currentUser.plantel}/${this.currentUser.refSEP}/info`)
        .subscribe({
          next: (response: any) => {
            // console.log('Info de foto:', response); // Debug
            if (response.success && response.data.exists) {
              // Si existe, cargar la imagen
              const photoUrl = `${this.apiUrl}/photos/${this.currentUser!.plantel}/${this.currentUser!.refSEP}`;
              this.photoUrl = this.sanitizer.bypassSecurityTrustUrl(photoUrl);
              // console.log('Foto pública cargada:', photoUrl);
            } else {
              // console.log('Foto no existe en servidor');
              this.setDefaultPhoto();
            }
          },
          error: (error) => {
            console.error('Error verificando foto:', error);
            this.setDefaultPhoto();
          }
        });
    } else {
      // console.log('Faltan datos del usuario:', { 
      //   plantel: this.currentUser?.plantel, 
      //   refSEP: this.currentUser?.refSEP 
      // });
      this.setDefaultPhoto();
    }
  }

  // ← MÉTODO PARA IMAGEN POR DEFECTO
  private setDefaultPhoto(): void {
    this.photoUrl = this.sanitizer.bypassSecurityTrustUrl('/images/default-avatar.png');
    // console.log('Usando foto por defecto');
  }

  // ← MANEJO DE ERRORES DE IMAGEN
  onImageError(event: Event): void {
    // console.log('Error cargando imagen, usando foto por defecto');
    (event.target as HTMLImageElement).src = '/images/default-avatar.png';
    this.setDefaultPhoto();
  }

  // ← MÉTODO PARA RECARGAR FOTO MANUALMENTE (OPCIONAL)
  reloadPhoto(): void {
    // console.log('Recargando foto manualmente...');
    this.loadPhoto();
  }
}