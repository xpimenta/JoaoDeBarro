import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ReceivableApi } from '../../data-access/receivables.api';
import { ReceivableDto } from '../../models/receivable.dto';

type PaymentMethodValue = 'Boleto' | 'Debit' | 'Credit' | 'Deposit' | 'Pix';
type IssModeValue = 'auto' | 'manual';
type EntryModeValue = 'single' | 'installments';
type InstallmentRuleValue = 'default30_90_120' | 'monthlyFixedDay';

type InstallmentPreviewRow = {
  installmentNumber: number;
  dueDate: string;
  grossAmount: number;
  issAmount: number;
  inssAmount: number;
  netAmount: number;
  adjusted: boolean;
};

type ReceivableCreatePayload = {
  id?: string;
  customerName: string;
  serviceDescription: string;
  serviceDate: string;
  serviceOrderNumber?: string;
  invoiceNumber?: string;
  invoiceIssueDate?: string;
  dueDate: string;
  paymentDate?: string;
  paymentMethod: string;
  grossAmount: number;
  issAmount: number;
  inssAmount: number;
  amountReceived: number;
  currencyCode: string;
  netAmount: number;
  outstandingAmount: number;
  status: string;
};

@Component({
  selector: 'app-receivable-form-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    InputTextModule,
    InputNumberModule,
    ButtonModule,
    TranslateModule
  ],
  templateUrl: './receivable-form.page.html',
  styleUrl: './receivable-form.page.scss'
})
export class ReceivableFormPage implements OnInit {
  private fb = inject(FormBuilder);
  private api = inject(ReceivableApi);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private translate = inject(TranslateService);
  private readonly currencyFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
  private readonly issPreferencesStorageKey = 'jdb.receivables.issPreferences';

  private paymentMethodValues: PaymentMethodValue[] = ['Boleto', 'Debit', 'Credit', 'Deposit', 'Pix'];
  paymentMethods: Array<{ label: string; value: PaymentMethodValue }> = [
    { label: this.translate.instant('paymentMethod.boleto'), value: 'Boleto' },
    { label: this.translate.instant('paymentMethod.debit'), value: 'Debit' },
    { label: this.translate.instant('paymentMethod.credit'), value: 'Credit' },
    { label: this.translate.instant('paymentMethod.deposit'), value: 'Deposit' },
    { label: this.translate.instant('paymentMethod.pix'), value: 'Pix' }
  ];

  form = this.fb.group(
    {
      customerName: ['', [Validators.required, Validators.maxLength(150)]],
      serviceDescription: ['', [Validators.required, Validators.maxLength(255)]],
      serviceDate: ['', Validators.required],
      serviceOrderNumber: [''],
      invoiceNumber: [''],
      invoiceIssueDate: [''],
      dueDate: ['', Validators.required],
      paymentDate: [''],
      paymentMethod: ['', Validators.required],
      entryMode: ['single' as EntryModeValue],
      installmentRule: ['default30_90_120' as InstallmentRuleValue],
      installmentCount: [4, [Validators.min(2), Validators.max(120)]],
      fixedDueDay: [10, [Validators.min(1), Validators.max(31)]],
      installmentBaseDate: [''],
      issMode: ['auto' as IssModeValue],
      issRate: [5, [Validators.required, Validators.min(0), Validators.max(100)]],
      grossAmount: [0, [Validators.required, Validators.min(0)]],
      issAmount: [0, [Validators.min(0)]],
      inssAmount: [0, [Validators.min(0)]],
      amountReceived: [0, [Validators.min(0)]]
    },
    { validators: [this.invoicePairValidator, this.amountsValidator] }
  );

  submitting = false;
  submitErrorMessage = '';
  isEditMode = false;
  private editingId: string | null = null;
  private originalStatus = '';
  installmentPreviewRows: InstallmentPreviewRow[] = [];
  installmentRowsTouched = false;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.editingId = id;
    }

    this.restoreIssPreferences();
    this.syncInstallmentFlow();
    this.syncIssFlow();
    this.syncPaymentDateControl();

    if (!id) {
      return;
    }

    this.loadForEdit(id);
  }

  async submit(): Promise<void> {
    this.submitErrorMessage = '';
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const paymentMethod = this.normalizePaymentMethod(raw.paymentMethod);
    const entryMode = this.normalizeEntryMode(raw.entryMode);
    if (!paymentMethod) {
      this.form.get('paymentMethod')?.setErrors({ required: true });
      this.form.markAllAsTouched();
      return;
    }

    if (!this.isEditMode && entryMode === 'installments' && !String(raw.serviceOrderNumber ?? '').trim()) {
      this.form.get('serviceOrderNumber')?.setErrors({ required: true });
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;
    const payload: ReceivableCreatePayload = {
      customerName: raw.customerName ?? '',
      serviceDescription: raw.serviceDescription ?? '',
      serviceDate: raw.serviceDate ?? '',
      serviceOrderNumber: raw.serviceOrderNumber || undefined,
      invoiceNumber: raw.invoiceNumber || undefined,
      invoiceIssueDate: raw.invoiceIssueDate || undefined,
      dueDate: raw.dueDate ?? '',
      paymentDate: Number(raw.amountReceived ?? 0) > 0 ? this.normalizeOptionalDate(raw.paymentDate) : undefined,
      paymentMethod,
      grossAmount: raw.grossAmount ?? 0,
      issAmount: raw.issAmount ?? 0,
      inssAmount: raw.inssAmount ?? 0,
      amountReceived: raw.amountReceived ?? 0,
      currencyCode: 'BRL',
      netAmount: 0,
      outstandingAmount: 0,
      status: this.originalStatus
    };

    if (this.isEditMode && this.editingId) {
      payload.id = this.editingId;
      this.api.update(this.editingId, payload).subscribe({
        next: () => {
          this.submitting = false;
          this.router.navigateByUrl('/finance/ap-ar/receivables');
        },
        error: (error) => this.handleSubmitError(error)
      });
      return;
    }

    if (entryMode === 'installments') {
      const installmentPayloads = this.buildInstallmentPayloads(raw, paymentMethod);
      if (!installmentPayloads.length) {
        this.submitting = false;
        this.form.markAllAsTouched();
        return;
      }

      this.api.createBatch(installmentPayloads).subscribe({
        next: () => {
          this.submitting = false;
          this.router.navigateByUrl('/finance/ap-ar/receivables');
        },
        error: (error) => this.handleSubmitError(error)
      });
      return;
    }

    this.api.create(payload).subscribe({
      next: () => {
        this.submitting = false;
        this.router.navigateByUrl('/finance/ap-ar/receivables');
      },
      error: (error) => this.handleSubmitError(error)
    });
  }

  private loadForEdit(id: string): void {
    this.api.getById(id).subscribe({
      next: (dto) => this.patchForm(dto),
      error: () => this.router.navigateByUrl('/finance/ap-ar/receivables')
    });
  }

  private patchForm(dto: ReceivableDto): void {
    const grossAmount = dto.grossAmount ?? 0;
    const issAmount = dto.issAmount ?? 0;
    const inssAmount = dto.inssAmount ?? 0;
    const inferredIssRate = grossAmount > 0 ? this.roundCurrency((issAmount / grossAmount) * 100) : 5;
    const preferredIssMode = this.normalizeIssMode(this.form.controls.issMode.value);

    this.originalStatus = dto.status ?? '';
    this.form.patchValue({
      customerName: dto.customerName ?? '',
      serviceDescription: dto.serviceDescription ?? '',
      serviceDate: this.toInputDate(dto.serviceDate),
      serviceOrderNumber: dto.serviceOrderNumber ?? '',
      invoiceNumber: dto.invoiceNumber ?? '',
      invoiceIssueDate: this.toInputDate(dto.invoiceIssueDate),
      entryMode: 'single',
      dueDate: this.toInputDate(dto.dueDate),
      paymentDate: this.toInputDate(dto.paymentDate),
      paymentMethod: this.normalizePaymentMethod(dto.paymentMethod),
      issMode: preferredIssMode,
      issRate: inferredIssRate,
      grossAmount,
      issAmount,
      inssAmount,
      amountReceived: dto.amountReceived ?? 0
    });
  }

  private toInputDate(value?: string | null): string {
    if (!value) {
      return '';
    }

    const isoDate = /^(\d{4}-\d{2}-\d{2})/.exec(value);
    if (isoDate) {
      return isoDate[1];
    }

    return value;
  }

  private invoicePairValidator(group: { value: any }) {
    const invoiceNumber = (group.value?.invoiceNumber ?? '').trim();
    const invoiceIssueDate = group.value?.invoiceIssueDate ?? '';

    if (invoiceNumber && !invoiceIssueDate) {
      return { invoiceIssueDateRequired: true };
    }
    if (!invoiceNumber && invoiceIssueDate) {
      return { invoiceNumberRequired: true };
    }
    return null;
  }

  private amountsValidator(group: { value: any; getRawValue?: () => any }) {
    const rawValue = typeof group.getRawValue === 'function' ? group.getRawValue() : group.value;
    const gross = Number(rawValue?.grossAmount ?? 0);
    const iss = Number(rawValue?.issAmount ?? 0);
    const inss = Number(rawValue?.inssAmount ?? 0);
    const received = Number(rawValue?.amountReceived ?? 0);
    const paymentDate = String(rawValue?.paymentDate ?? '').trim();
    const netAmount = Math.max(0, gross - iss - inss);

    if (iss + inss > gross) {
      return { issGreaterThanGross: true };
    }
    if (received > netAmount) {
      return { receivedGreaterThanAvailable: true };
    }
    if (received > 0 && !paymentDate) {
      return { paymentDateRequired: true };
    }
    return null;
  }

  private normalizePaymentMethod(value: unknown): PaymentMethodValue | '' {
    const candidate = typeof value === 'string' ? value : (value as { value?: unknown } | null)?.value;
    if (typeof candidate !== 'string') {
      return '';
    }

    return this.paymentMethodValues.includes(candidate as PaymentMethodValue) ? (candidate as PaymentMethodValue) : '';
  }

  private normalizeOptionalDate(value: unknown): string | undefined {
    if (typeof value !== 'string') {
      return undefined;
    }

    const trimmed = value.trim();
    return /^\d{4}-\d{2}-\d{2}$/.test(trimmed) ? trimmed : undefined;
  }

  get isInstallmentMode(): boolean {
    return !this.isEditMode && this.normalizeEntryMode(this.form.controls.entryMode.value) === 'installments';
  }

  get isFixedDayInstallmentRule(): boolean {
    return this.isInstallmentMode && this.normalizeInstallmentRule(this.form.controls.installmentRule.value) === 'monthlyFixedDay';
  }

  get netAmount(): number {
    const gross = Number(this.form.controls.grossAmount.value ?? 0);
    const iss = Number(this.form.controls.issAmount.value ?? 0);
    const inss = Number(this.form.controls.inssAmount.value ?? 0);
    return this.roundCurrency(Math.max(0, gross - iss - inss));
  }

  get netAmountLabel(): string {
    return this.currencyFormatter.format(this.netAmount);
  }

  formatCurrency(value: number): string {
    return this.currencyFormatter.format(this.roundCurrency(value));
  }

  get installmentGrossTotal(): number {
    return this.roundCurrency(this.installmentPreviewRows.reduce((acc, row) => acc + Number(row.grossAmount ?? 0), 0));
  }

  get installmentIssTotal(): number {
    return this.roundCurrency(this.installmentPreviewRows.reduce((acc, row) => acc + Number(row.issAmount ?? 0), 0));
  }

  get installmentInssTotal(): number {
    return this.roundCurrency(this.installmentPreviewRows.reduce((acc, row) => acc + Number(row.inssAmount ?? 0), 0));
  }

  get installmentNetTotal(): number {
    return this.roundCurrency(this.installmentPreviewRows.reduce((acc, row) => acc + Number(row.netAmount ?? 0), 0));
  }

  applyNetAmountToReceived(): void {
    this.form.controls.amountReceived.setValue(this.netAmount);
  }

  applyInstallmentReference(): void {
    this.installmentRowsTouched = false;
    this.refreshInstallmentPreview(true);
  }

  updateInstallmentDueDate(index: number, value: string | null | undefined): void {
    if (!this.installmentPreviewRows[index]) {
      return;
    }

    const dueDate = typeof value === 'string' ? value.trim() : '';
    this.installmentPreviewRows = this.installmentPreviewRows.map((row, rowIndex) => {
      if (rowIndex !== index) {
        return row;
      }

      return {
        ...row,
        dueDate
      };
    });
  }

  updateInstallmentGrossAmount(index: number, value: number | null): void {
    if (!this.installmentPreviewRows[index]) {
      return;
    }

    const totalIss = this.normalizeMoney(this.form.controls.issAmount.value);
    const totalInss = this.normalizeMoney(this.form.controls.inssAmount.value);
    const totalTaxes = this.roundCurrency(totalIss + totalInss);
    const grossAmount = index === 0 ? Math.max(this.normalizeMoney(value), totalTaxes) : this.normalizeMoney(value);
    this.installmentPreviewRows = this.installmentPreviewRows.map((row, rowIndex) => {
      if (rowIndex !== index) {
        return row;
      }

      const issAmount = rowIndex === 0 ? totalIss : 0;
      const inssAmount = rowIndex === 0 ? totalInss : 0;
      return {
        ...row,
        grossAmount,
        issAmount,
        inssAmount,
        netAmount: this.roundCurrency(Math.max(0, grossAmount - issAmount - inssAmount))
      };
    });
  }

  private syncInstallmentTaxRule(): void {
    if (!this.isInstallmentMode || !this.installmentPreviewRows.length) {
      return;
    }

    const totalIss = this.normalizeMoney(this.form.controls.issAmount.value);
    const totalInss = this.normalizeMoney(this.form.controls.inssAmount.value);
    const totalTaxes = this.roundCurrency(totalIss + totalInss);
    const grossParts = this.ensureFirstInstallmentGrossAmount(
      this.installmentPreviewRows.map((row) => this.normalizeMoney(row.grossAmount)),
      totalTaxes
    );
    if (grossParts.length > 0 && grossParts[0] < totalTaxes) {
      grossParts[0] = totalTaxes;
    }

    this.installmentPreviewRows = this.installmentPreviewRows.map((row, rowIndex) => {
      const grossAmountRaw = this.normalizeMoney(row.grossAmount);
      const grossAmount = grossParts[rowIndex] ?? grossAmountRaw;
      const issAmount = rowIndex === 0 ? totalIss : 0;
      const inssAmount = rowIndex === 0 ? totalInss : 0;

      return {
        ...row,
        grossAmount,
        issAmount,
        inssAmount,
        netAmount: this.roundCurrency(Math.max(0, grossAmount - issAmount - inssAmount))
      };
    });
  }

  private ensureFirstInstallmentGrossAmount(grossParts: number[], firstInstallmentTaxes: number): number[] {
    if (!grossParts.length || firstInstallmentTaxes <= 0) {
      return grossParts;
    }

    const normalized = grossParts.map((value) => this.normalizeMoney(value));
    if (normalized[0] >= firstInstallmentTaxes) {
      return normalized;
    }

    let deficit = this.roundCurrency(firstInstallmentTaxes - normalized[0]);
    normalized[0] = this.roundCurrency(normalized[0] + deficit);

    for (let index = normalized.length - 1; index > 0 && deficit > 0; index -= 1) {
      const deduction = Math.min(normalized[index], deficit);
      normalized[index] = this.roundCurrency(normalized[index] - deduction);
      deficit = this.roundCurrency(deficit - deduction);
    }

    if (deficit > 0) {
      normalized[0] = this.roundCurrency(normalized[0] - deficit);
    }

    return normalized;
  }

  isInstallmentDueDateInvalid(row: InstallmentPreviewRow): boolean {
    if (!this.installmentRowsTouched) {
      return false;
    }

    return !this.normalizeOptionalDate(row.dueDate);
  }

  openNativeDatePicker(event: Event): void {
    const input = event.target as (HTMLInputElement & { showPicker?: () => void }) | null;
    if (!input || input.type !== 'date' || input.disabled) {
      return;
    }

    try {
      input.showPicker?.();
    } catch {
      // Ignore browsers that block programmatic picker opening without a gesture.
    }
  }

  private roundCurrency(value: number): number {
    return Math.round(value * 100) / 100;
  }

  private normalizeMoney(value: unknown): number {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) {
      return 0;
    }

    return this.roundCurrency(Math.max(0, parsed));
  }

  private normalizeIssMode(value: unknown): IssModeValue {
    return value === 'manual' ? 'manual' : 'auto';
  }

  private normalizeEntryMode(value: unknown): EntryModeValue {
    return value === 'installments' ? 'installments' : 'single';
  }

  private normalizeInstallmentRule(value: unknown): InstallmentRuleValue {
    return value === 'monthlyFixedDay' ? 'monthlyFixedDay' : 'default30_90_120';
  }

  private normalizeInstallmentCount(value: unknown): number {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) {
      return 4;
    }

    return Math.max(2, Math.min(120, Math.floor(parsed)));
  }

  private normalizeFixedDueDay(value: unknown): number {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) {
      return 10;
    }

    return Math.max(1, Math.min(31, Math.floor(parsed)));
  }

  private normalizeIssRate(value: unknown, fallback = 5): number {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) {
      return fallback;
    }

    return this.roundCurrency(Math.min(100, Math.max(0, parsed)));
  }

  private restoreIssPreferences(): void {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      const serialized = window.localStorage.getItem(this.issPreferencesStorageKey);
      if (!serialized) {
        return;
      }

      const parsed = JSON.parse(serialized) as { mode?: unknown; rate?: unknown };
      this.form.patchValue(
        {
          issMode: this.normalizeIssMode(parsed.mode),
          issRate: this.normalizeIssRate(parsed.rate)
        },
        { emitEvent: false }
      );
    } catch {
      // Ignore malformed local preference and keep defaults.
    }
  }

  private persistIssPreferences(): void {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      const payload = JSON.stringify({
        mode: this.normalizeIssMode(this.form.controls.issMode.value),
        rate: this.normalizeIssRate(this.form.controls.issRate.value)
      });
      window.localStorage.setItem(this.issPreferencesStorageKey, payload);
    } catch {
      // Ignore write failures from browser storage restrictions.
    }
  }

  private toInputDateFromDate(date: Date): string {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private parseInputDate(value: string): Date | null {
    const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    if (!iso) {
      return null;
    }

    const year = Number(iso[1]);
    const month = Number(iso[2]);
    const day = Number(iso[3]);
    const date = new Date(year, month - 1, day);

    if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
      return null;
    }

    return date;
  }

  private getTodayDate(): Date {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }

  private addDays(baseDate: Date, days: number): Date {
    const result = new Date(baseDate);
    result.setDate(result.getDate() + days);
    return result;
  }

  private addMonths(baseDate: Date, months: number): Date {
    return new Date(baseDate.getFullYear(), baseDate.getMonth() + months, 1);
  }

  private buildFixedDayDate(year: number, month: number, dayOfMonth: number): Date {
    const lastDay = new Date(year, month + 1, 0).getDate();
    const safeDay = Math.min(dayOfMonth, lastDay);
    return new Date(year, month, safeDay);
  }

  private resolveDefaultInstallmentBaseDate(): string {
    return this.normalizeOptionalDate(this.form.controls.dueDate.value)
      || this.normalizeOptionalDate(this.form.controls.invoiceIssueDate.value)
      || this.normalizeOptionalDate(this.form.controls.serviceDate.value)
      || this.toInputDateFromDate(this.getTodayDate());
  }

  private generateInstallmentDueDates(): Array<{ dueDate: string; adjusted: boolean }> {
    const rawBaseDate = this.normalizeOptionalDate(this.form.controls.installmentBaseDate.value);
    if (!rawBaseDate) {
      return [];
    }

    const parsedBaseDate = this.parseInputDate(rawBaseDate);
    if (!parsedBaseDate) {
      return [];
    }

    const today = this.getTodayDate();
    const effectiveBaseDate = parsedBaseDate < today ? today : parsedBaseDate;
    const baseAdjusted = effectiveBaseDate.getTime() !== parsedBaseDate.getTime();
    const rule = this.normalizeInstallmentRule(this.form.controls.installmentRule.value);
    const installmentCount = this.normalizeInstallmentCount(this.form.controls.installmentCount.value);

    if (rule === 'default30_90_120') {
      return Array.from({ length: installmentCount }).map((_, index) => ({
        dueDate: this.toInputDateFromDate(this.addDays(effectiveBaseDate, 30 * (index + 1))),
        adjusted: baseAdjusted
      }));
    }

    const fixedDueDay = this.normalizeFixedDueDay(this.form.controls.fixedDueDay.value);
    const monthAnchor = new Date(effectiveBaseDate.getFullYear(), effectiveBaseDate.getMonth(), 1);
    const firstCandidate = this.buildFixedDayDate(effectiveBaseDate.getFullYear(), effectiveBaseDate.getMonth(), fixedDueDay);
    const firstMonthOffset = firstCandidate < effectiveBaseDate ? 1 : 0;

    return Array.from({ length: installmentCount }).map((_, index) => {
      const monthDate = this.addMonths(monthAnchor, firstMonthOffset + index);
      const dueDateAsDate = this.buildFixedDayDate(monthDate.getFullYear(), monthDate.getMonth(), fixedDueDay);
      const adjusted = dueDateAsDate.getDate() !== fixedDueDay || (index === 0 && firstMonthOffset > 0) || baseAdjusted;

      return {
        dueDate: this.toInputDateFromDate(dueDateAsDate),
        adjusted
      };
    });
  }

  private splitAmount(total: number, parts: number): number[] {
    if (parts <= 0) {
      return [];
    }

    const safeTotal = this.roundCurrency(Math.max(0, total));
    const totalInCents = Math.round(safeTotal * 100);
    const basePartInCents = Math.floor(totalInCents / parts);
    const remainder = totalInCents % parts;

    return Array.from({ length: parts }).map((_, index) => {
      const cents = basePartInCents + (index < remainder ? 1 : 0);
      return cents / 100;
    });
  }

  private refreshInstallmentPreview(forceRegenerate = false): void {
    if (!this.isInstallmentMode) {
      this.installmentPreviewRows = [];
      return;
    }

    const dueDates = this.generateInstallmentDueDates();
    if (!dueDates.length) {
      this.installmentPreviewRows = [];
      return;
    }

    if (!forceRegenerate && this.installmentPreviewRows.length === dueDates.length) {
      return;
    }

    const totalIss = this.normalizeMoney(this.form.controls.issAmount.value);
    const totalInss = this.normalizeMoney(this.form.controls.inssAmount.value);
    const totalTaxes = this.roundCurrency(totalIss + totalInss);
    const grossParts = this.ensureFirstInstallmentGrossAmount(
      this.splitAmount(Number(this.form.controls.grossAmount.value ?? 0), dueDates.length),
      totalTaxes
    );

    this.installmentPreviewRows = dueDates.map((row, index) => {
      const grossAmount = grossParts[index] ?? 0;
      const issAmount = index === 0 ? totalIss : 0;
      const inssAmount = index === 0 ? totalInss : 0;

      return {
        installmentNumber: index + 1,
        dueDate: row.dueDate,
        grossAmount,
        issAmount,
        inssAmount,
        netAmount: this.roundCurrency(Math.max(0, grossAmount - issAmount - inssAmount)),
        adjusted: row.adjusted
      };
    });
  }

  private buildInstallmentPayloads(raw: any, paymentMethod: PaymentMethodValue): ReceivableCreatePayload[] {
    if (!this.installmentPreviewRows.length) {
      return [];
    }

    const totalIss = this.normalizeMoney(this.form.controls.issAmount.value);
    const totalInss = this.normalizeMoney(this.form.controls.inssAmount.value);
    const totalTaxes = this.roundCurrency(totalIss + totalInss);
    const installmentRows = this.installmentPreviewRows.map((row, rowIndex) => {
      const grossAmountRaw = this.normalizeMoney(row.grossAmount);
      const grossAmount = rowIndex === 0 ? Math.max(grossAmountRaw, totalTaxes) : grossAmountRaw;
      return {
        ...row,
        dueDate: this.normalizeOptionalDate(row.dueDate) ?? '',
        grossAmount,
        issAmount: rowIndex === 0 ? totalIss : 0,
        inssAmount: rowIndex === 0 ? totalInss : 0
      };
    });

    const hasInvalidRows = installmentRows.some((row) => !row.dueDate);
    if (hasInvalidRows) {
      this.installmentRowsTouched = true;
      return [];
    }

    const serviceOrderNumber = String(raw.serviceOrderNumber ?? '').trim();

    return installmentRows.map((row) => ({
      customerName: raw.customerName ?? '',
      serviceDescription: raw.serviceDescription ?? '',
      serviceDate: raw.serviceDate ?? '',
      serviceOrderNumber: serviceOrderNumber || undefined,
      invoiceNumber: raw.invoiceNumber || undefined,
      invoiceIssueDate: raw.invoiceIssueDate || undefined,
      dueDate: row.dueDate,
      paymentDate: undefined,
      paymentMethod,
      grossAmount: row.grossAmount,
      issAmount: row.issAmount,
      inssAmount: row.inssAmount,
      amountReceived: 0,
      currencyCode: 'BRL',
      netAmount: 0,
      outstandingAmount: 0,
      status: this.originalStatus
    }));
  }

  private syncInstallmentFlow(): void {
    const entryModeControl = this.form.controls.entryMode;
    const installmentRuleControl = this.form.controls.installmentRule;
    const installmentCountControl = this.form.controls.installmentCount;
    const fixedDueDayControl = this.form.controls.fixedDueDay;
    const installmentBaseDateControl = this.form.controls.installmentBaseDate;
    const dueDateControl = this.form.controls.dueDate;
    const serviceOrderControl = this.form.controls.serviceOrderNumber;
    const amountReceivedControl = this.form.controls.amountReceived;
    const paymentDateControl = this.form.controls.paymentDate;

    const applyRuleState = () => {
      const isInstallments = !this.isEditMode && this.normalizeEntryMode(entryModeControl.value) === 'installments';
      const isFixedDayRule = this.normalizeInstallmentRule(installmentRuleControl.value) === 'monthlyFixedDay';

      if (!isInstallments) {
        installmentRuleControl.disable({ emitEvent: false });
        installmentCountControl.disable({ emitEvent: false });
        fixedDueDayControl.disable({ emitEvent: false });
        installmentBaseDateControl.disable({ emitEvent: false });
        installmentCountControl.clearValidators();
        fixedDueDayControl.clearValidators();
        installmentBaseDateControl.clearValidators();
        return;
      }

      installmentRuleControl.enable({ emitEvent: false });
      installmentCountControl.enable({ emitEvent: false });
      installmentBaseDateControl.enable({ emitEvent: false });
      installmentCountControl.setValidators([Validators.required, Validators.min(2), Validators.max(120)]);
      installmentBaseDateControl.setValidators([Validators.required]);

      if (isFixedDayRule) {
        fixedDueDayControl.enable({ emitEvent: false });
        fixedDueDayControl.setValidators([Validators.required, Validators.min(1), Validators.max(31)]);
      } else {
        fixedDueDayControl.disable({ emitEvent: false });
        fixedDueDayControl.clearValidators();
      }
    };

    const applyEntryModeState = () => {
      const isInstallments = !this.isEditMode && this.normalizeEntryMode(entryModeControl.value) === 'installments';

      if (isInstallments && !this.normalizeOptionalDate(installmentBaseDateControl.value)) {
        installmentBaseDateControl.setValue(this.resolveDefaultInstallmentBaseDate(), { emitEvent: false });
      }

      this.installmentRowsTouched = false;
      dueDateControl.setValidators(isInstallments ? [] : [Validators.required]);
      serviceOrderControl.setValidators(isInstallments ? [Validators.required] : []);

      if (isInstallments) {
        amountReceivedControl.setValue(0, { emitEvent: false });
        amountReceivedControl.disable({ emitEvent: false });
        paymentDateControl.setValue('', { emitEvent: false });
        paymentDateControl.disable({ emitEvent: false });
      } else {
        amountReceivedControl.enable({ emitEvent: false });
        paymentDateControl.enable({ emitEvent: false });
      }

      dueDateControl.updateValueAndValidity({ emitEvent: false });
      serviceOrderControl.updateValueAndValidity({ emitEvent: false });

      applyRuleState();
      installmentCountControl.updateValueAndValidity({ emitEvent: false });
      fixedDueDayControl.updateValueAndValidity({ emitEvent: false });
      installmentBaseDateControl.updateValueAndValidity({ emitEvent: false });
      this.refreshInstallmentPreview(true);
    };

    if (this.isEditMode) {
      entryModeControl.setValue('single', { emitEvent: false });
      entryModeControl.disable({ emitEvent: false });
    }

    applyEntryModeState();

    entryModeControl.valueChanges.subscribe(() => applyEntryModeState());
    installmentRuleControl.valueChanges.subscribe(() => {
      applyRuleState();
      installmentCountControl.updateValueAndValidity({ emitEvent: false });
      fixedDueDayControl.updateValueAndValidity({ emitEvent: false });
      this.refreshInstallmentPreview(true);
    });
    installmentBaseDateControl.valueChanges.subscribe(() => this.refreshInstallmentPreview(true));
    installmentCountControl.valueChanges.subscribe(() => this.refreshInstallmentPreview(true));
    fixedDueDayControl.valueChanges.subscribe(() => this.refreshInstallmentPreview(true));
    this.form.controls.issAmount.valueChanges.subscribe(() => this.syncInstallmentTaxRule());
    this.form.controls.inssAmount.valueChanges.subscribe(() => this.syncInstallmentTaxRule());
  }

  private syncIssFlow(): void {
    const issModeControl = this.form.controls.issMode;
    const issRateControl = this.form.controls.issRate;
    const grossAmountControl = this.form.controls.grossAmount;
    const issAmountControl = this.form.controls.issAmount;

    const applyIssMode = () => {
      const isAutoMode = issModeControl.value === 'auto';

      if (isAutoMode) {
        issRateControl.enable({ emitEvent: false });
        issAmountControl.disable({ emitEvent: false });
        this.recalculateIssAmount();
        return;
      }

      issRateControl.disable({ emitEvent: false });
      issAmountControl.enable({ emitEvent: false });
    };

    applyIssMode();
    this.persistIssPreferences();

    issModeControl.valueChanges.subscribe(() => {
      applyIssMode();
      this.persistIssPreferences();
    });
    issRateControl.valueChanges.subscribe(() => {
      if (issModeControl.value === 'auto') {
        this.recalculateIssAmount();
      }

      this.persistIssPreferences();
    });
    grossAmountControl.valueChanges.subscribe(() => {
      if (issModeControl.value === 'auto') {
        this.recalculateIssAmount();
      }
    });
  }

  private recalculateIssAmount(): void {
    const grossAmount = Number(this.form.controls.grossAmount.value ?? 0);
    const issRate = Number(this.form.controls.issRate.value ?? 0);
    const safeGrossAmount = Number.isFinite(grossAmount) ? Math.max(0, grossAmount) : 0;
    const safeIssRate = Number.isFinite(issRate) ? Math.max(0, Math.min(100, issRate)) : 0;
    const issAmount = this.roundCurrency((safeGrossAmount * safeIssRate) / 100);

    this.form.controls.issAmount.setValue(issAmount, { emitEvent: false });
    this.syncInstallmentTaxRule();
  }

  private syncPaymentDateControl(): void {
    const paymentDateControl = this.form.controls.paymentDate;
    paymentDateControl.valueChanges.subscribe((rawValue) => {
      const hasPaymentDate = Boolean(this.normalizeOptionalDate(rawValue));
      const amountReceived = Number(this.form.controls.amountReceived.value ?? 0);

      if (!hasPaymentDate || amountReceived > 0) {
        return;
      }

      this.applyNetAmountToReceived();
    });
  }

  private handleSubmitError(error: unknown): void {
    this.submitting = false;
    this.submitErrorMessage = this.resolveSubmitErrorMessage(error);
  }

  private resolveSubmitErrorMessage(error: unknown): string {
    if (!(error instanceof HttpErrorResponse)) {
      return this.translate.instant('receivables.form.saveErrorGeneric');
    }

    if (error.status === 0) {
      return this.translate.instant('receivables.form.saveErrorApiUnavailable');
    }

    const detail = this.extractApiErrorMessage(error.error);
    if (!detail) {
      return this.translate.instant('receivables.form.saveErrorGeneric');
    }

    return this.translate.instant('receivables.form.saveErrorWithDetail', { detail });
  }

  private extractApiErrorMessage(errorBody: unknown): string | null {
    if (typeof errorBody === 'string') {
      const trimmed = errorBody.trim();
      return trimmed || null;
    }

    if (!errorBody || typeof errorBody !== 'object') {
      return null;
    }

    const body = errorBody as Record<string, unknown>;
    const directMessageKeys = ['message', 'title', 'detail'];

    for (const key of directMessageKeys) {
      const value = body[key];
      if (typeof value === 'string' && value.trim()) {
        return value.trim();
      }
    }

    const errors = body['errors'];
    if (!errors || typeof errors !== 'object') {
      return null;
    }

    for (const value of Object.values(errors as Record<string, unknown>)) {
      if (typeof value === 'string' && value.trim()) {
        return value.trim();
      }

      if (!Array.isArray(value)) {
        continue;
      }

      const firstMessage = value.find(
        (item): item is string => typeof item === 'string' && item.trim().length > 0
      );
      if (firstMessage) {
        return firstMessage.trim();
      }
    }

    return null;
  }
}
