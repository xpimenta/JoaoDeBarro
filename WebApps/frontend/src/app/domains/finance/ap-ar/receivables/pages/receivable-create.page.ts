import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { ReceivableApi } from '../data-access/receivables.api';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

type ReceivableCreatePayload = {
  customerName: string;
  serviceDescription: string;
  serviceDate: string;
  serviceOrderNumber?: string;
  invoiceNumber?: string;
  invoiceIssueDate?: string;
  dueDate: string;
  paymentMethod: string;
  grossAmount: number;
  issAmount: number;
  amountReceived: number;
  currencyCode: string;
  netAmount: number;
  outstandingAmount: number;
  status: string;
};

@Component({
  selector: 'app-receivable-create-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    InputTextModule,
    InputNumberModule,
    SelectModule,
    ButtonModule,
    TranslateModule
  ],
  templateUrl: './receivable-create.page.html',
  styleUrl: './receivable-create.page.scss'
})
export class ReceivableCreatePage {
  private fb = inject(FormBuilder);
  private api = inject(ReceivableApi);
  private router = inject(Router);
  private translate = inject(TranslateService);

  paymentMethods = [
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
      paymentMethod: ['', Validators.required],
      grossAmount: [0, [Validators.required, Validators.min(0)]],
      issAmount: [0, [Validators.min(0)]],
      amountReceived: [0, [Validators.min(0)]],
      currencyCode: ['BRL', [Validators.required, Validators.minLength(3), Validators.maxLength(3)]]
    },
    { validators: [this.invoicePairValidator, this.amountsValidator] }
  );

  submitting = false;

  async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;
    const raw = this.form.getRawValue();
    const payload: ReceivableCreatePayload = {
      customerName: raw.customerName ?? '',
      serviceDescription: raw.serviceDescription ?? '',
      serviceDate: raw.serviceDate ?? '',
      serviceOrderNumber: raw.serviceOrderNumber || undefined,
      invoiceNumber: raw.invoiceNumber || undefined,
      invoiceIssueDate: raw.invoiceIssueDate || undefined,
      dueDate: raw.dueDate ?? '',
      paymentMethod: raw.paymentMethod ?? '',
      grossAmount: raw.grossAmount ?? 0,
      issAmount: raw.issAmount ?? 0,
      amountReceived: raw.amountReceived ?? 0,
      currencyCode: (raw.currencyCode ?? '').toUpperCase(),
      netAmount: 0,
      outstandingAmount: 0,
      status: ''
    };

    this.api.create(payload).subscribe({
      next: () => {
        this.submitting = false;
        this.router.navigateByUrl('/finance/ap-ar/receivables');
      },
      error: () => {
        this.submitting = false;
      }
    });
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

  private amountsValidator(group: { value: any }) {
    const gross = Number(group.value?.grossAmount ?? 0);
    const iss = Number(group.value?.issAmount ?? 0);
    const received = Number(group.value?.amountReceived ?? 0);

    if (iss > gross) {
      return { issGreaterThanGross: true };
    }
    if (received > gross - iss) {
      return { receivedGreaterThanAvailable: true };
    }
    return null;
  }
}
