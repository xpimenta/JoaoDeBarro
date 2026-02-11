import { Component, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
  catchError,
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  map,
  Observable,
  of,
  shareReplay,
  startWith,
  Subject,
  switchMap,
  tap
} from 'rxjs';
import { ReceivableApi } from '../../data-access/receivables.api';
import { ReceivableDto } from '../../models/receivable.dto';
import {
  FilterOption,
  QuickFilterCounts,
  ReceivableQuickFilter,
  ReceivableStatusNormalized,
  ReceivableTableRow,
  ReceivablesViewModel
} from '../../ui/receivables.types';
import { ReceivableDetailsDialogComponent } from '../../components/receivable-details-dialog/receivable-details-dialog.component';
import { ReceivablesFiltersComponent } from '../../components/receivables-filters/receivables-filters.component';
import { ReceivablesHeroComponent } from '../../components/receivables-hero/receivables-hero.component';
import { ReceivablesSummaryCardsComponent } from '../../components/receivables-summary-cards/receivables-summary-cards.component';
import { ReceivablesTableComponent } from '../../components/receivables-table/receivables-table.component';

type ReceivablesSourceState = {
  loading: boolean;
  error: boolean;
  rows: ReceivableDto[];
};

@Component({
  selector: 'app-receivables-page',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    TranslateModule,
    ReceivablesHeroComponent,
    ReceivablesSummaryCardsComponent,
    ReceivablesFiltersComponent,
    ReceivablesTableComponent,
    ReceivableDetailsDialogComponent
  ],
  templateUrl: './receivables-list.page.html',
  styleUrl: './receivables-list.page.scss'
})
export class ReceivablesPage {
  @ViewChild(ReceivablesTableComponent) private tableComponent?: ReceivablesTableComponent;

  private api = inject(ReceivableApi);
  private router = inject(Router);
  private translate = inject(TranslateService);
  private currencyFormatters = new Map<string, Intl.NumberFormat>();
  private reload$ = new Subject<void>();
  private quickFilterStorageKey = 'receivables.quickFilter';
  private monthStorageKey = 'receivables.monthRef';

  readonly pageSize = 10;
  readonly quickFilterOptions: Array<{ value: ReceivableQuickFilter; labelKey: string }> = [
    { value: 'all', labelKey: 'receivables.filters.quick.all' },
    { value: 'overdue', labelKey: 'receivables.filters.quick.overdue' },
    { value: 'due', labelKey: 'receivables.filters.quick.dueToday' },
    { value: 'open', labelKey: 'receivables.filters.quick.open' },
    { value: 'next7', labelKey: 'receivables.filters.quick.next7Days' },
    { value: 'settled', labelKey: 'receivables.filters.quick.settled' }
  ];

  readonly searchControl = new FormControl('', { nonNullable: true });
  readonly quickFilterControl = new FormControl<ReceivableQuickFilter>(this.loadQuickFilterFromStorage(), { nonNullable: true });
  readonly monthRefControl = new FormControl(this.loadMonthRefFromStorage(), { nonNullable: true });

  detailsVisible = false;
  selectedReceivable: ReceivableDto | null = null;
  tableHasActiveFilters = false;
  private tableFilteredRowsCount: number | null = null;

  readonly hasPaginationFn = (totalRows: number) => this.hasPagination(totalRows);
  readonly formatDateFn = (value?: string | null) => this.formatDate(value);
  readonly formatMoneyFn = (value?: number | null, currencyCode?: string | null) => this.formatMoney(value, currencyCode);
  readonly paymentMethodLabelFn = (value?: string | null) => this.paymentMethodLabel(value);
  readonly outstandingAmountValueFn = (row: ReceivableDto) => this.outstandingAmountValue(row);
  readonly statusClassFn = (status?: string) => this.statusClass(status);
  readonly statusKeyFn = (status?: string) => this.statusKey(status);
  readonly canEditFn = (row: ReceivableDto) => this.canEdit(row);
  readonly netAmountValueFn = (row: ReceivableDto) => this.netAmountValue(row);
  readonly paidClassFn = (row: ReceivableDto) => this.paidClass(row);
  readonly isPaidFn = (row: ReceivableDto) => this.isPaid(row);
  get monthLabel(): string {
    return this.formatMonthLabel(this.monthRefControl.value);
  }

  private sourceState$: Observable<ReceivablesSourceState> = combineLatest([
    this.reload$.pipe(startWith(void 0)),
    this.monthRefControl.valueChanges.pipe(
      startWith(this.monthRefControl.value),
      distinctUntilChanged(),
      tap((value) => this.persistMonthRef(value))
    )
  ]).pipe(
    switchMap(([, monthRef]) =>
      this.api.getAll(this.toMonthQuery(monthRef)).pipe(
        map((rows) => ({
          loading: false,
          error: false,
          rows: rows ?? []
        })),
        catchError(() =>
          of({
            loading: false,
            error: true,
            rows: [] as ReceivableDto[]
          })
        ),
        startWith({
          loading: true,
          error: false,
          rows: [] as ReceivableDto[]
        })
      )
    ),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  vm$: Observable<ReceivablesViewModel> = combineLatest([
    this.sourceState$,
    this.searchControl.valueChanges.pipe(
      startWith(this.searchControl.value),
      debounceTime(120),
      map((value) => value.trim()),
      distinctUntilChanged()
    ),
    this.quickFilterControl.valueChanges.pipe(
      startWith(this.quickFilterControl.value),
      distinctUntilChanged(),
      tap((value) => this.persistQuickFilter(value))
    )
  ]).pipe(
    map(([state, searchTerm, quickFilter]) => {
      const filteredRows = this.applyFilters(state.rows, searchTerm, quickFilter);
      const tableRows: ReceivableTableRow[] = filteredRows.map((row) => ({
        ...row,
        statusNormalized: this.normalizeStatus(row.status)
      }));
      const totals = this.calculateTotals(filteredRows);
      const quickCounts = this.calculateQuickFilterCounts(state.rows);
      const serviceOptions = this.buildFilterOptions(filteredRows.map((row) => row.serviceDescription));
      const dueDateOptions = this.buildDueDateOptions(filteredRows.map((row) => row.dueDate));
      const paymentMethodOptions = this.buildPaymentMethodFilterOptions(filteredRows.map((row) => row.paymentMethod));
      const statusOptions = this.buildStatusFilterOptions(filteredRows);

      return {
        loading: state.loading,
        error: state.error,
        totalRows: state.rows.length,
        hasActiveFilters: !!searchTerm || quickFilter !== 'all',
        quickFilter,
        quickCounts,
        serviceOptions,
        dueDateOptions,
        paymentMethodOptions,
        statusOptions,
        rows: tableRows,
        totals
      };
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  reload(): void {
    this.reload$.next();
  }

  onSearchTermChange(term: string): void {
    if (this.searchControl.value === term) {
      return;
    }

    this.searchControl.setValue(term);
  }

  clearFilters(): void {
    this.searchControl.setValue('');
    this.quickFilterControl.setValue('all');
    this.tableComponent?.clearFilters();
    this.tableHasActiveFilters = false;
    this.tableFilteredRowsCount = null;
  }

  setQuickFilter(filter: ReceivableQuickFilter): void {
    this.quickFilterControl.setValue(filter);
  }

  onMonthRefChange(value: string): void {
    this.applyMonthRef(this.normalizeMonthRef(value));
  }

  onPreviousMonth(): void {
    this.applyMonthRef(this.shiftMonth(this.monthRefControl.value, -1));
  }

  onNextMonth(): void {
    this.applyMonthRef(this.shiftMonth(this.monthRefControl.value, 1));
  }

  onCurrentMonth(): void {
    this.applyMonthRef(this.currentMonthRef());
  }

  hasAnyFilters(vm: ReceivablesViewModel): boolean {
    return vm.hasActiveFilters || this.tableHasActiveFilters;
  }

  visibleRowsCount(vm: ReceivablesViewModel): number {
    return this.tableFilteredRowsCount ?? vm.rows.length;
  }

  onTableFilter(event: { filters?: Record<string, unknown>; filteredValue?: unknown[] | null }): void {
    const hasFilters = this.hasTableActiveFilters(event.filters);
    this.tableHasActiveFilters = hasFilters;
    this.tableFilteredRowsCount = hasFilters && Array.isArray(event.filteredValue) ? event.filteredValue.length : null;
  }

  onDetailsVisibleChange(visible: boolean): void {
    this.detailsVisible = visible;
    if (!visible) {
      this.selectedReceivable = null;
    }
  }

  openDetails(row: ReceivableDto): void {
    this.selectedReceivable = { ...row };
    this.detailsVisible = true;
  }

  closeDetails(): void {
    this.detailsVisible = false;
    this.selectedReceivable = null;
  }

  formatDate(value?: string | null): string {
    if (!value) {
      return '-';
    }

    const plainDate = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    if (plainDate) {
      return `${plainDate[3]}/${plainDate[2]}/${plainDate[1]}`;
    }

    return value;
  }

  formatMoney(value?: number | null, currencyCode?: string | null): string {
    const amount = Number(value ?? 0);
    const currency = (currencyCode || 'BRL').toUpperCase();
    return this.moneyFormatter(currency).format(amount);
  }

  netAmountValue(row: ReceivableDto): number {
    if (row.netAmount !== undefined && row.netAmount !== null) {
      return Number(row.netAmount);
    }

    const gross = Number(row.grossAmount ?? 0);
    const iss = Number(row.issAmount ?? 0);
    const inss = Number(row.inssAmount ?? 0);
    return Math.max(gross - iss - inss, 0);
  }

  outstandingAmountValue(row: ReceivableDto): number {
    if (row.outstandingAmount !== undefined && row.outstandingAmount !== null) {
      return Number(row.outstandingAmount);
    }

    const net = this.netAmountValue(row);
    const received = Number(row.amountReceived ?? 0);
    return Math.max(net - received, 0);
  }

  isPaid(row: ReceivableDto): boolean {
    const status = this.normalizeStatus(row.status);
    if (status === 'settled') {
      return true;
    }

    return this.outstandingAmountValue(row) <= 0.005 && Number(row.amountReceived ?? 0) > 0;
  }

  paidClass(row: ReceivableDto): string {
    return this.isPaid(row) ? 'paid-chip paid-chip--yes' : 'paid-chip paid-chip--no';
  }

  canEdit(row: ReceivableDto): boolean {
    return !!row.id;
  }

  hasPagination(totalRows: number): boolean {
    return totalRows > this.pageSize;
  }

  editRow(row: ReceivableDto): void {
    if (!row.id) {
      return;
    }

    this.detailsVisible = false;
    this.router.navigate(['/finance/ap-ar/receivables', row.id, 'edit']);
  }

  statusKey(status?: string): string {
    switch (this.normalizeStatus(status)) {
      case 'due':
        return 'status.dueToday';
      case 'overdue':
        return 'status.overdue';
      case 'settled':
        return 'status.settled';
      default:
        return 'status.open';
    }
  }

  statusClass(status?: string): string {
    switch (this.normalizeStatus(status)) {
      case 'due':
        return 'status-chip status-chip--due';
      case 'overdue':
        return 'status-chip status-chip--overdue';
      case 'settled':
        return 'status-chip status-chip--settled';
      default:
        return 'status-chip status-chip--open';
    }
  }

  private applyFilters(rows: ReceivableDto[], searchTerm: string, quickFilter: ReceivableQuickFilter): ReceivableDto[] {
    if (!rows.length) {
      return rows;
    }

    const term = searchTerm.toLowerCase();
    return rows.filter((row) => {
      if (!this.matchesQuickFilter(row, quickFilter)) {
        return false;
      }

      if (!term) {
        return true;
      }

      const haystack = [
        row.customerName,
        row.serviceDescription,
        row.paymentMethod,
        row.invoiceNumber,
        row.serviceOrderNumber
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(term);
    });
  }

  private matchesQuickFilter(row: ReceivableDto, quickFilter: ReceivableQuickFilter): boolean {
    if (quickFilter === 'all') {
      return true;
    }

    const normalized = this.normalizeStatus(row.status);
    switch (quickFilter) {
      case 'due':
        return normalized === 'due';
      case 'overdue':
        return normalized === 'overdue';
      case 'settled':
        return normalized === 'settled' || this.isPaid(row);
      case 'open':
        return normalized === 'open' && !this.isPaid(row);
      case 'next7':
        return this.isDueInNextDays(row, 7);
      default:
        return true;
    }
  }

  private calculateQuickFilterCounts(rows: ReceivableDto[]): QuickFilterCounts {
    return {
      all: rows.length,
      overdue: rows.filter((row) => this.matchesQuickFilter(row, 'overdue')).length,
      due: rows.filter((row) => this.matchesQuickFilter(row, 'due')).length,
      next7: rows.filter((row) => this.matchesQuickFilter(row, 'next7')).length,
      settled: rows.filter((row) => this.matchesQuickFilter(row, 'settled')).length,
      open: rows.filter((row) => this.matchesQuickFilter(row, 'open')).length
    };
  }

  private isDueInNextDays(row: ReceivableDto, days: number): boolean {
    if (this.isPaid(row)) {
      return false;
    }

    const dueDate = this.parseDate(row.dueDate);
    if (!dueDate) {
      return false;
    }

    const diff = this.daysDifferenceFromToday(dueDate);
    return diff > 0 && diff <= days;
  }

  private daysDifferenceFromToday(date: Date): number {
    const today = new Date();
    const todayUtc = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
    const dateUtc = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
    return Math.floor((dateUtc - todayUtc) / 86400000);
  }

  private parseDate(value?: string | null): Date | null {
    if (!value) {
      return null;
    }

    const plainDate = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    if (plainDate) {
      const year = Number(plainDate[1]);
      const month = Number(plainDate[2]) - 1;
      const day = Number(plainDate[3]);
      return new Date(year, month, day);
    }

    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  private calculateTotals(rows: ReceivableDto[]): ReceivablesViewModel['totals'] {
    const grossAmount = rows.reduce((acc, row) => acc + Number(row.grossAmount ?? 0), 0);
    const amountReceived = rows.reduce((acc, row) => acc + Number(row.amountReceived ?? 0), 0);
    const outstandingAmount = rows.reduce((acc, row) => acc + this.outstandingAmountValue(row), 0);
    const pendingItems = rows.filter((row) => !this.isPaid(row)).length;

    return {
      grossAmount,
      amountReceived,
      outstandingAmount,
      pendingItems
    };
  }

  private normalizeStatus(status?: string): ReceivableStatusNormalized {
    const value = (status ?? '').trim().toLowerCase();

    switch (value) {
      case 'duetoday':
      case 'vence hoje':
      case 'vencendo':
        return 'due';
      case 'overdue':
      case 'em atraso':
        return 'overdue';
      case 'settled':
      case 'pago':
      case 'paid':
        return 'settled';
      case 'open':
      case 'aberto':
      case 'em aberto':
      default:
        return 'open';
    }
  }

  private loadQuickFilterFromStorage(): ReceivableQuickFilter {
    if (typeof window === 'undefined') {
      return 'all';
    }

    const stored = window.localStorage.getItem(this.quickFilterStorageKey);
    if (
      stored === 'all' ||
      stored === 'overdue' ||
      stored === 'due' ||
      stored === 'next7' ||
      stored === 'settled' ||
      stored === 'open'
    ) {
      return stored;
    }

    return 'all';
  }

  private persistQuickFilter(value: ReceivableQuickFilter): void {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(this.quickFilterStorageKey, value);
  }

  private loadMonthRefFromStorage(): string {
    if (typeof window === 'undefined') {
      return this.currentMonthRef();
    }

    return this.normalizeMonthRef(window.localStorage.getItem(this.monthStorageKey));
  }

  private persistMonthRef(value: string): void {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(this.monthStorageKey, value);
  }

  private applyMonthRef(value: string): void {
    if (this.monthRefControl.value === value) {
      return;
    }

    this.monthRefControl.setValue(value);
    this.tableComponent?.clearFilters();
    this.tableHasActiveFilters = false;
    this.tableFilteredRowsCount = null;
  }

  private toMonthQuery(monthRef: string): { year: number; month: number } {
    const normalized = this.normalizeMonthRef(monthRef);
    const [year, month] = normalized.split('-');
    return { year: Number(year), month: Number(month) };
  }

  private normalizeMonthRef(value: string | null | undefined): string {
    const defaultValue = this.currentMonthRef();
    if (!value) {
      return defaultValue;
    }

    const match = /^(\d{4})-(\d{2})$/.exec(value.trim());
    if (!match) {
      return defaultValue;
    }

    const year = Number(match[1]);
    const month = Number(match[2]);
    if (year < 2000 || year > 2100 || month < 1 || month > 12) {
      return defaultValue;
    }

    return `${year}-${`${month}`.padStart(2, '0')}`;
  }

  private currentMonthRef(): string {
    const now = new Date();
    return `${now.getFullYear()}-${`${now.getMonth() + 1}`.padStart(2, '0')}`;
  }

  private shiftMonth(monthRef: string, delta: number): string {
    const normalized = this.normalizeMonthRef(monthRef);
    const [yearPart, monthPart] = normalized.split('-');
    const shifted = new Date(Number(yearPart), Number(monthPart) - 1 + delta, 1);
    return `${shifted.getFullYear()}-${`${shifted.getMonth() + 1}`.padStart(2, '0')}`;
  }

  private formatMonthLabel(monthRef: string): string {
    const normalized = this.normalizeMonthRef(monthRef);
    const [yearPart, monthPart] = normalized.split('-');
    const locale = this.translate.currentLang || this.translate.getDefaultLang() || 'pt-BR';
    const label = new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(
      new Date(Number(yearPart), Number(monthPart) - 1, 1)
    );
    return label.charAt(0).toUpperCase() + label.slice(1);
  }

  private buildFilterOptions(values: Array<string | null | undefined>): FilterOption[] {
    const uniqueValues = Array.from(
      new Set(
        values
          .map((value) => (value ?? '').trim())
          .filter((value): value is string => value.length > 0)
      )
    ).sort((a, b) => a.localeCompare(b, 'pt-BR', { sensitivity: 'base' }));

    return uniqueValues.map((value) => ({ label: value, value }));
  }

  private buildPaymentMethodFilterOptions(values: Array<string | null | undefined>): FilterOption[] {
    const uniqueValues = Array.from(
      new Set(
        values
          .map((value) => (value ?? '').trim())
          .filter((value): value is string => value.length > 0)
      )
    );

    return uniqueValues
      .map((value) => ({
        label: this.paymentMethodLabel(value),
        value
      }))
      .sort((a, b) => a.label.localeCompare(b.label, 'pt-BR', { sensitivity: 'base' }));
  }

  private buildDueDateOptions(values: Array<string | null | undefined>): FilterOption[] {
    const uniqueValues = Array.from(
      new Set(
        values
          .map((value) => (value ?? '').trim())
          .filter((value): value is string => value.length > 0)
      )
    ).sort((a, b) => a.localeCompare(b));

    return uniqueValues.map((value) => ({
      label: this.formatDate(value),
      value
    }));
  }

  private buildStatusFilterOptions(rows: ReceivableDto[]): FilterOption[] {
    const available = new Set<ReceivableStatusNormalized>(rows.map((row) => this.normalizeStatus(row.status)));
    const ordered: ReceivableStatusNormalized[] = ['overdue', 'due', 'open', 'settled'];

    return ordered
      .filter((status) => available.has(status))
      .map((status) => ({
        value: status,
        label: this.translate.instant(this.statusTranslationKey(status))
      }));
  }

  private statusTranslationKey(status: ReceivableStatusNormalized): string {
    switch (status) {
      case 'due':
        return 'status.dueToday';
      case 'overdue':
        return 'status.overdue';
      case 'settled':
        return 'status.settled';
      default:
        return 'status.open';
    }
  }

  private paymentMethodLabel(value?: string | null): string {
    const fallback = (value ?? '').trim();
    if (!fallback) {
      return '-';
    }

    const translationKey = this.paymentMethodTranslationKey(fallback);
    return translationKey ? this.translate.instant(translationKey) : fallback;
  }

  private paymentMethodTranslationKey(value: string): string | null {
    switch (value.trim().toLowerCase()) {
      case 'boleto':
        return 'paymentMethod.boleto';
      case 'debit':
      case 'debito':
      case 'débito':
        return 'paymentMethod.debit';
      case 'credit':
      case 'credito':
      case 'crédito':
        return 'paymentMethod.credit';
      case 'deposit':
      case 'deposito':
      case 'depósito':
        return 'paymentMethod.deposit';
      case 'pix':
        return 'paymentMethod.pix';
      default:
        return null;
    }
  }

  private hasTableActiveFilters(filters?: Record<string, unknown>): boolean {
    if (!filters) {
      return false;
    }

    return Object.values(filters).some((meta) => {
      if (Array.isArray(meta)) {
        return meta.some((item) => this.filterMetaHasValue(item));
      }

      return this.filterMetaHasValue(meta);
    });
  }

  private filterMetaHasValue(meta: unknown): boolean {
    if (!meta || typeof meta !== 'object') {
      return false;
    }

    const value = (meta as { value?: unknown }).value;
    if (Array.isArray(value)) {
      return value.length > 0;
    }

    return value !== null && value !== undefined && value !== '';
  }

  private moneyFormatter(currency: string): Intl.NumberFormat {
    const cached = this.currencyFormatters.get(currency);
    if (cached) {
      return cached;
    }

    const formatter = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2
    });
    this.currencyFormatters.set(currency, formatter);
    return formatter;
  }
}
