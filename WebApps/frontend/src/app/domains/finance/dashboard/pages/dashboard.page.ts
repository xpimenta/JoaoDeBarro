import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [CommonModule, TableModule, TranslateModule],
  templateUrl: './dashboard.page.html',
  styleUrl: './dashboard.page.scss'
})
export class DashboardPage {
  receivables = [
    { customer: 'Sidone', amount: 725, status: 'Pago' },
    { customer: 'ACME', amount: 420, status: 'Aberto' },
    { customer: 'Barros', amount: 980, status: 'Em atraso' },
    { customer: 'Norte Sul', amount: 310, status: 'Aberto' }
  ];

  payables = [
    { vendor: 'Fornecedor A', amount: 300, status: 'Aberto' },
    { vendor: 'Fornecedor B', amount: 1500, status: 'Pago' },
    { vendor: 'Fornecedor C', amount: 260, status: 'Em atraso' },
    { vendor: 'Fornecedor D', amount: 640, status: 'Aberto' }
  ];

  chipClass(status: string): string {
    switch (status) {
      case 'Pago':
        return 'status-chip status-chip--settled';
      case 'Em atraso':
        return 'status-chip status-chip--overdue';
      default:
        return 'status-chip status-chip--open';
    }
  }
}
