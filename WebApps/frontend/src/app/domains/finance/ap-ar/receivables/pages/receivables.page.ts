import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { RouterModule } from '@angular/router';
import { ReceivableApi } from '../data-access/receivables.api';
import { ReceivableDto } from "../models/receivable.dto";
import { Observable, delay } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
@Component({
  selector: 'app-receivables-page',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, RouterModule, TranslateModule],
  templateUrl: './receivables.page.html',
  styleUrl: './receivables.page.scss'
})
export class ReceivablesPage {

  private api = inject(ReceivableApi);
  rows$: Observable<ReceivableDto[]> = this.api.getAll().pipe(delay(0));

  statusKey(status?: string): string {
    if (!status) {
      return 'status.open';
    }

    switch (status) {
      case 'Open':
        return 'status.open';
      case 'DueToday':
        return 'status.dueToday';
      case 'Overdue':
        return 'status.overdue';
      case 'Settled':
        return 'status.settled';
      default:
        return 'status.open';
    }
  }

  // rows = [
  //   { customer: 'Sidone', amount: 725, status: 'Pago' },
  //   { customer: 'ACME', amount: 420, status: 'Aberto' },
  //   { customer: 'Barros', amount: 980, status: 'Em atraso' }
  // ];



  


}
