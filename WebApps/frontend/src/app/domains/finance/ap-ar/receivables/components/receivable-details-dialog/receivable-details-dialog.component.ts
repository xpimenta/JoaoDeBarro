import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { ReceivableDto } from '../../models/receivable.dto';

@Component({
  selector: 'app-receivable-details-dialog',
  standalone: true,
  imports: [CommonModule, DialogModule, ButtonModule, TranslateModule],
  templateUrl: './receivable-details-dialog.component.html',
  styleUrl: './receivable-details-dialog.component.scss'
})
export class ReceivableDetailsDialogComponent {
  @Input({ required: true }) visible = false;
  @Input() row: ReceivableDto | null = null;
  @Input({ required: true }) formatDate!: (value?: string | null) => string;
  @Input({ required: true }) formatMoney!: (value?: number | null, currencyCode?: string | null) => string;
  @Input({ required: true }) paymentMethodLabel!: (value?: string | null) => string;
  @Input({ required: true }) netAmountValue!: (row: ReceivableDto) => number;
  @Input({ required: true }) outstandingAmountValue!: (row: ReceivableDto) => number;
  @Input({ required: true }) paidClass!: (row: ReceivableDto) => string;
  @Input({ required: true }) isPaid!: (row: ReceivableDto) => boolean;
  @Input({ required: true }) statusClass!: (status?: string) => string;
  @Input({ required: true }) statusKey!: (status?: string) => string;
  @Input({ required: true }) canEdit!: (row: ReceivableDto) => boolean;

  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() edit = new EventEmitter<ReceivableDto>();

  close(): void {
    this.visibleChange.emit(false);
  }
}
