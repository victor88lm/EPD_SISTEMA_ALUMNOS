import { Component, OnInit } from '@angular/core';
import { AttendanceService } from '../../core/services/attendance.service'; // Ajusta la ruta según tu estructura
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './attendance.component.html',
  styleUrl: './attendance.component.css'
})
export class AttendanceComponent implements OnInit {
  attendanceData: any;
  loading = false;
  currentPage = 1;

  constructor(private attendanceService: AttendanceService) {}

  ngOnInit(): void {
    this.loadAttendance(this.currentPage);
  }

  loadAttendance(page: number): void {
    this.loading = true;
    this.attendanceService.getAttendance(page).subscribe({
      next: (data) => {
        // console.log('Datos recibidos de asistencia:', data);
        this.attendanceData = data.data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar asistencias:', err);
        this.loading = false;
      }
    });
  }

  nextPage(): void {
    if (this.attendanceData?.pagination?.has_next) {
      this.currentPage++;
      this.loadAttendance(this.currentPage);
    }
  }

  prevPage(): void {
    if (this.attendanceData?.pagination?.has_prev && this.currentPage > 1) {
      this.currentPage--;
      this.loadAttendance(this.currentPage);
    }
  }

  getDayInSpanish(englishDay: string): string {
    const dayMap: { [key: string]: string } = {
      'monday': 'Lunes',
      'tuesday': 'Martes', 
      'wednesday': 'Miércoles',
      'thursday': 'Jueves',
      'friday': 'Viernes',
      'saturday': 'Sábado',
      'sunday': 'Domingo',
      // Versiones abreviadas por si acaso
      'mon': 'Lunes',
      'tue': 'Martes',
      'wed': 'Miércoles', 
      'thu': 'Jueves',
      'fri': 'Viernes',
      'sat': 'Sábado',
      'sun': 'Domingo'
    };
    
    return dayMap[englishDay.toLowerCase()] || englishDay;
  }

  trackByAttendance(index: number, record: any): any {
    return record.id || record.fecha || index;
  }
}