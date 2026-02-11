import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TranslateModule } from '@ngx-translate/core';
import { QuickFilterCounts, ReceivableQuickFilter } from '../../ui/receivables.types';

@Component({
  selector: 'app-receivables-filters',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, TranslateModule],
  templateUrl: './receivables-filters.component.html',
  styleUrl: './receivables-filters.component.scss'
})
export class ReceivablesFiltersComponent {
  @Input({ required: true }) quickFilterOptions: Array<{ value: ReceivableQuickFilter; labelKey: string }> = [];
  @Input({ required: true }) quickFilter: ReceivableQuickFilter = 'all';
  @Input({ required: true }) quickCounts!: QuickFilterCounts;
  @Input({ required: true }) monthRef = '';
  @Input({ required: true }) monthLabel = '';
  @Input({ required: true }) searchTerm = '';
  @Input({ required: true }) hasAnyFilters = false;
  @Input({ required: true }) visibleRows = 0;
  @Input({ required: true }) totalRows = 0;

  @Output() previousMonth = new EventEmitter<void>();
  @Output() nextMonth = new EventEmitter<void>();
  @Output() currentMonth = new EventEmitter<void>();
  @Output() monthRefChange = new EventEmitter<string>();
  @Output() quickFilterChange = new EventEmitter<ReceivableQuickFilter>();
  @Output() searchTermChange = new EventEmitter<string>();
  @Output() clearFilters = new EventEmitter<void>();

  quickCount(filter: ReceivableQuickFilter): number {
    return this.quickCounts[filter] ?? 0;
  }

  quickFilterToneClass(filter: ReceivableQuickFilter): string {
    switch (filter) {
      case 'overdue':
        return 'quick-filter--overdue';
      case 'due':
        return 'quick-filter--due';
      case 'open':
        return 'quick-filter--open';
      case 'next7':
        return 'quick-filter--next';
      case 'settled':
        return 'quick-filter--settled';
      default:
        return 'quick-filter--neutral';
    }
  }

  openMonthPicker(input: HTMLInputElement): void {
    input.focus();
    if (typeof input.showPicker === 'function') {
      input.showPicker();
      return;
    }

    input.click();
  }
}
