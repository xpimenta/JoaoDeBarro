import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { ListboxModule } from 'primeng/listbox';
import { Table, TableModule } from 'primeng/table';
import { ReceivableDto } from '../../models/receivable.dto';
import { FilterOption, ReceivableTableRow } from '../../ui/receivables.types';

@Component({
  selector: 'app-receivables-table',
  standalone: true,
  imports: [CommonModule, FormsModule, TableModule, ButtonModule, ListboxModule, TranslateModule],
  templateUrl: './receivables-table.component.html',
  styleUrl: './receivables-table.component.scss'
})
export class ReceivablesTableComponent {
  @ViewChild(Table) private table?: Table;

  @Input({ required: true }) rows: ReceivableTableRow[] = [];
  @Input({ required: true }) pageSize = 10;
  @Input({ required: true }) serviceOptions: FilterOption[] = [];
  @Input({ required: true }) dueDateOptions: FilterOption[] = [];
  @Input({ required: true }) paymentMethodOptions: FilterOption[] = [];
  @Input({ required: true }) statusOptions: FilterOption[] = [];
  @Input({ required: true }) hasAnyFilters = false;

  @Input({ required: true }) hasPagination!: (totalRows: number) => boolean;
  @Input({ required: true }) formatDate!: (value?: string | null) => string;
  @Input({ required: true }) formatMoney!: (value?: number | null, currencyCode?: string | null) => string;
  @Input({ required: true }) paymentMethodLabel!: (value?: string | null) => string;
  @Input({ required: true }) outstandingAmountValue!: (row: ReceivableDto) => number;
  @Input({ required: true }) statusClass!: (status?: string) => string;
  @Input({ required: true }) statusKey!: (status?: string) => string;
  @Input({ required: true }) canEdit!: (row: ReceivableDto) => boolean;

  @Output() tableFilterChange = new EventEmitter<{ filters?: Record<string, unknown>; filteredValue?: unknown[] | null }>();
  @Output() openDetails = new EventEmitter<ReceivableDto>();
  @Output() editRow = new EventEmitter<ReceivableDto>();

  activeSortField: string | null = 'dueDate';
  activeSortOrder: number = 1;
  private activeFilters: Record<string, unknown> = {};

  clearFilters(): void {
    this.table?.clear();
  }

  onTableSort(event: { field?: string; order?: number }): void {
    this.activeSortField = event.field ?? null;
    this.activeSortOrder = event.order ?? 0;
  }

  onTableFilter(event: { filters?: Record<string, unknown>; filteredValue?: unknown[] | null }): void {
    this.activeFilters = event.filters ?? {};
    this.tableFilterChange.emit(event);
  }

  headerClass(sortField: string, filterField?: string): Record<string, boolean> {
    const targetFilterField = filterField ?? sortField;
    const isFiltered = this.isColumnFiltered(targetFilterField);

    return {
      'is-filtered-col': isFiltered
    };
  }

  sortIconClass(field: string): Record<string, boolean> {
    const isSorted = this.isSorted(field);
    return {
      'sort-indicator': true,
      'sort-indicator--active': isSorted,
      'sort-indicator--asc': isSorted && this.activeSortOrder > 0,
      'sort-indicator--desc': isSorted && this.activeSortOrder < 0
    };
  }

  activeFilterCount(field: string): number {
    const meta = this.activeFilters[field];
    if (Array.isArray(meta)) {
      return meta.reduce((total, item) => total + this.filterValueCount((item as { value?: unknown })?.value), 0);
    }

    return this.filterValueCount((meta as { value?: unknown })?.value);
  }

  private isSorted(field: string): boolean {
    return this.activeSortField === field && this.activeSortOrder !== 0;
  }

  private isColumnFiltered(field: string): boolean {
    return this.activeFilterCount(field) > 0;
  }

  private filterValueCount(value: unknown): number {
    if (Array.isArray(value)) {
      return value.length;
    }

    if (value === null || value === undefined || value === '') {
      return 0;
    }

    return 1;
  }

  emptyStateTitleKey(): string {
    return this.hasAnyFilters ? 'receivables.states.emptyFilteredTitle' : 'receivables.states.emptyTitle';
  }

  emptyStateSubtitleKey(): string {
    return this.hasAnyFilters ? 'receivables.states.emptyFilteredSubtitle' : 'receivables.states.emptySubtitle';
  }
}
