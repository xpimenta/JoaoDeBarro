import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-payables-page',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, TranslateModule],
  templateUrl: './payables.page.html',
  styleUrl: './payables.page.scss'
})
export class PayablesPage {
  rows = [
    { vendor: 'Fornecedor A', amount: 300, status: 'Aberto' },
    { vendor: 'Fornecedor B', amount: 1500, status: 'Pago' },
    { vendor: 'Fornecedor C', amount: 260, status: 'Em atraso' }
  ];

  statusClass(status: string): string {
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
