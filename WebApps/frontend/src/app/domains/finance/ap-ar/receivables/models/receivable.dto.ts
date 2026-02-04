export interface ReceivableDto{
    id?: string | null;
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
    netAmount?: number;
    outstandingAmount?: number;
    status?: string;
}