export interface ReceivableDto{
    id?: string | null;
    customerName: string;
    serviceDescription: string;
    serviceDate: string;
    serviceOrderNumber?: string;
    invoiceNumber?: string;
    invoiceIssueDate?: string;
    dueDate: string;
    paymentDate?: string | null;
    paymentMethod: string;
    grossAmount: number;
    issAmount: number;
    inssAmount: number;
    amountReceived: number;
    currencyCode: string;
    netAmount?: number;
    outstandingAmount?: number;
    status?: string;
}
