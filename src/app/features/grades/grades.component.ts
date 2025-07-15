import { Component, OnInit } from '@angular/core';
import { GradesService } from '../../core/services/grades.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-grades',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './grades.component.html',
  styleUrl: './grades.component.css'
})
export class GradesComponent implements OnInit {
  loading = false;
  gradesData: any;
  currentPage = 1;

  constructor(private gradesService: GradesService) { }

  ngOnInit(): void {
    this.loadGrades();
  }

  loadGrades(): void {
    this.loading = true;
    this.gradesService.getGrades(this.currentPage).subscribe({
      next: (data) => {
        this.gradesData = data.data;
        this.loading = false;

        // Esperar un ciclo de render para asegurarse que el DOM esté listo
        setTimeout(() => window.scrollTo(0, 0), 0);
      },
      error: (err) => {
        console.error('Error al cargar calificaciones:', err);
        this.loading = false;
      }
    });
  }

  nextPage() {
    if (this.gradesData?.pagination?.has_next) {
      this.currentPage++;
      this.loadGrades();
    }
  }

  prevPage() {
    if (this.gradesData?.pagination?.has_prev) {
      this.currentPage--;
      this.loadGrades();
    }
  }
  
  trackByGrade(index: number, grade: any): any {
    return grade.id_calificacion || index;
  }
}