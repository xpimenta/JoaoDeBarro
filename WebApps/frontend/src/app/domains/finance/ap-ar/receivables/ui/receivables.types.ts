import { ReceivableDto } from '../models/receivable.dto';

export type ReceivableQuickFilter = 'all' | 'overdue' | 'due' | 'next7' | 'settled' | 'open';

export type QuickFilterCounts = Record<ReceivableQuickFilter, number>;

export type FilterOption = { label: string; value: string };

export type ReceivableStatusNormalized = 'open' | 'due' | 'overdue' | 'settled';

export type ReceivableTableRow = ReceivableDto & { statusNormalized: ReceivableStatusNormalized };

export type ReceivablesTotals = {
  grossAmount: number;
  amountReceived: number;
  outstandingAmount: number;
  pendingItems: number;
};

export type ReceivablesViewModel = {
  loading: boolean;
  error: boolean;
  totalRows: number;
  hasActiveFilters: boolean;
  quickFilter: ReceivableQuickFilter;
  quickCounts: QuickFilterCounts;
  serviceOptions: FilterOption[];
  dueDateOptions: FilterOption[];
  paymentMethodOptions: FilterOption[];
  statusOptions: FilterOption[];
  rows: ReceivableTableRow[];
  totals: ReceivablesTotals;
};
