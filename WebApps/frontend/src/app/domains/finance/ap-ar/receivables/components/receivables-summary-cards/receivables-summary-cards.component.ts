import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ReceivablesTotals } from '../../ui/receivables.types';

@Component({
  selector: 'app-receivables-summary-cards',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './receivables-summary-cards.component.html',
  styleUrl: './receivables-summary-cards.component.scss'
})
export class ReceivablesSummaryCardsComponent {
  @Input({ required: true }) totals!: ReceivablesTotals;
  @Input({ required: true }) formatMoney!: (value?: number | null, currencyCode?: string | null) => string;
}
