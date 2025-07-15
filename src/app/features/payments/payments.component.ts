import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaymentsService } from '../../core/services/payments.service';

@Component({
  selector: 'app-payments',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './payments.component.html',
  styleUrls: ['./payments.component.css'] 
})
export class PaymentsComponent implements OnInit {
  loading = false;
  paymentsData: any = null;
  currentPage = 1;

  constructor(private paymentsService: PaymentsService) {}

  ngOnInit(): void {
    this.loadPayments();
    // Asegura scroll al tope una vez Angular haya renderizado la vista
    setTimeout(() => window.scrollTo(0, 0), 0);
  }

  loadPayments(): void {
    this.loading = true;

    this.paymentsService.getPayments(this.currentPage).subscribe({
      next: (res) => {
        // console.log('Pagos recibidos:', res);
        if (res?.success && res?.data) {
          this.paymentsData = res.data;
        } else {
          this.paymentsData = null;
          // console.warn('Respuesta inesperada de pagos:', res);
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar pagos:', err);
        this.paymentsData = null;
        this.loading = false;
      }
    });
  }

  nextPage(): void {
    if (this.paymentsData?.pagination?.has_next) {
      this.currentPage++;
      this.loadPayments();
    }
  }

  prevPage(): void {
    if (this.paymentsData?.pagination?.has_prev && this.currentPage > 1) {
      this.currentPage--;
      this.loadPayments();
    }
  }

  trackByPayment(index: number, pago: any): any {
    return pago.idpago || index;
  }
}