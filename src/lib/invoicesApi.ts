import type { InvoiceLineItem, InvoiceState } from "@/types/invoice";
import { apiRequest } from "@/lib/apiClient";
import type { Paginated } from "@/lib/apiTypes";

export type ApiInvoiceLineItem = {
  id: string;
  description: string;
  quantity: string;
  rate: string;
  amount: string;
  sortOrder: number;
};

export type ApiInvoice = {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string | null;
  businessName: string;
  businessAddress: string | null;
  businessPhone: string | null;
  businessEmail: string | null;
  authorizedSignatory: string | null;
  paymentInfo: string | null;
  customerName: string;
  customerAddress: string | null;
  customerPhone: string | null;
  customerEmail: string | null;
  discountType: "percent" | "fixed";
  discountPercent: string;
  discountAmount: string;
  subtotal: string;
  totalAmount: string;
  notes: string | null;
  bookingId: string | null;
  createdAt: string;
  updatedAt: string;
  lineItems: ApiInvoiceLineItem[];
  booking: { id: string; bookingNumber: string | null } | null;
};

export type InvoiceListRecord = {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string | null;
  customerName: string;
  customerPhone: string | null;
  totalAmount: number;
  createdAt: string;
  bookingNumber: string | null;
};

export type CreateInvoiceInput = {
  invoiceNumber: string;
  invoiceDate: string;
  dueDate?: string | null;
  businessName: string;
  businessAddress?: string | null;
  businessPhone?: string | null;
  businessEmail?: string | null;
  authorizedSignatory?: string | null;
  paymentInfo?: string | null;
  customerName: string;
  customerAddress?: string | null;
  customerPhone?: string | null;
  customerEmail?: string | null;
  discountType: "percent" | "fixed";
  discountPercent: number;
  discountAmount: number;
  notes?: string | null;
  bookingId?: string | null;
  lineItems: Array<{
    description: string;
    quantity: number;
    rate: number;
  }>;
};

export type UpdateInvoiceInput = Partial<CreateInvoiceInput>;

function mapApiInvoiceToListRecord(invoice: ApiInvoice): InvoiceListRecord {
  return {
    id: invoice.id,
    invoiceNumber: invoice.invoiceNumber,
    invoiceDate: invoice.invoiceDate,
    dueDate: invoice.dueDate,
    customerName: invoice.customerName,
    customerPhone: invoice.customerPhone,
    totalAmount: Number.parseFloat(invoice.totalAmount) || 0,
    createdAt: invoice.createdAt,
    bookingNumber: invoice.booking?.bookingNumber ?? null,
  };
}

export function mapInvoiceStateToCreateInput(state: InvoiceState): CreateInvoiceInput {
  return {
    invoiceNumber: state.invoiceNumber.trim(),
    invoiceDate: state.invoiceDate,
    dueDate: state.dueDate || null,
    businessName: state.businessName.trim(),
    businessAddress: state.businessAddress.trim() || null,
    businessPhone: state.businessPhone.trim() || null,
    businessEmail: state.businessEmail.trim() || null,
    authorizedSignatory: state.authorizedSignatory.trim() || null,
    paymentInfo: state.paymentInfo.trim() || null,
    customerName: state.customerName.trim(),
    customerAddress: state.customerAddress.trim() || null,
    customerPhone: state.customerPhone.trim() || null,
    customerEmail: state.customerEmail.trim() || null,
    discountType: state.discountType,
    discountPercent: state.discountPercent,
    discountAmount: state.discountAmount,
    notes: state.notes.trim() || null,
    lineItems: state.lineItems
      .filter((line) => line.description.trim() && line.quantity > 0 && line.rate >= 0)
      .map((line) => ({
        description: line.description.trim(),
        quantity: line.quantity,
        rate: line.rate,
      })),
  };
}

export function mapApiInvoiceToState(invoice: ApiInvoice): InvoiceState {
  return {
    businessName: invoice.businessName,
    businessAddress: invoice.businessAddress ?? "",
    businessPhone: invoice.businessPhone ?? "",
    businessEmail: invoice.businessEmail ?? "",
    authorizedSignatory: invoice.authorizedSignatory ?? "",
    paymentInfo: invoice.paymentInfo ?? "",
    customerName: invoice.customerName,
    customerAddress: invoice.customerAddress ?? "",
    customerPhone: invoice.customerPhone ?? "",
    customerEmail: invoice.customerEmail ?? "",
    invoiceDate: invoice.invoiceDate,
    dueDate: invoice.dueDate ?? "",
    invoiceNumber: invoice.invoiceNumber,
    lineItems: invoice.lineItems.map(
      (line): InvoiceLineItem => ({
        id: line.id,
        description: line.description,
        quantity: Number.parseFloat(line.quantity) || 0,
        rate: Number.parseFloat(line.rate) || 0,
      }),
    ),
    discountType: invoice.discountType,
    discountPercent: Number.parseFloat(invoice.discountPercent) || 0,
    discountAmount: Number.parseFloat(invoice.discountAmount) || 0,
    notes: invoice.notes ?? "",
  };
}

export async function fetchInvoicesFromApi(): Promise<InvoiceListRecord[]> {
  const page = await apiRequest<Paginated<ApiInvoice>>(
    "/invoices?limit=100&sortBy=createdAt&order=desc",
  );

  return page.items.map(mapApiInvoiceToListRecord);
}

export async function fetchInvoiceByIdFromApi(id: string): Promise<ApiInvoice> {
  return apiRequest<ApiInvoice>(`/invoices/${id}`);
}

export async function createInvoiceViaApi(input: CreateInvoiceInput): Promise<ApiInvoice> {
  return apiRequest<ApiInvoice>("/invoices", {
    method: "POST",
    body: input,
  });
}

export async function updateInvoiceViaApi(id: string, input: UpdateInvoiceInput): Promise<ApiInvoice> {
  return apiRequest<ApiInvoice>(`/invoices/${id}`, {
    method: "PATCH",
    body: input,
  });
}

export async function deleteInvoiceViaApi(id: string): Promise<void> {
  await apiRequest(`/invoices/${id}`, { method: "DELETE" });
}
