import type { PaymentMethod, PaymentRecord, PaymentType } from "@/data/banquetData";
import { apiRequest } from "@/lib/apiClient";
import type { Paginated } from "@/lib/apiTypes";

type ApiPaymentType = "INCOME" | "EXPENSE";

type ApiPayment = {
  id: string;
  bookingId: string | null;
  vendorId: string | null;
  paymentType: ApiPaymentType;
  amount: string;
  transactionDate: string;
  paymentMode: "CASH" | "UPI" | "CARD" | "BANK_TRANSFER" | "CHEQUE" | null;
  description: string | null;
  receivedFrom: string | null;
  paidTo: string | null;
  createdAt: string;
  booking: { id: string; bookingNumber: string | null } | null;
  vendor: { id: string; vendorName: string } | null;
};

export type CreatePaymentInput = {
  paymentType: PaymentType;
  bookingId?: string;
  vendorId?: string;
  amount: number;
  date: string;
  method: PaymentMethod;
  receivedFrom?: string;
  paidTo?: string;
  description?: string;
};

function mapApiPaymentType(type: ApiPaymentType): PaymentType {
  return type === "EXPENSE" ? "expense" : "income";
}

function mapPaymentTypeToBackend(type: PaymentType): ApiPaymentType {
  return type === "expense" ? "EXPENSE" : "INCOME";
}

function mapPaymentMode(mode: ApiPayment["paymentMode"]): PaymentMethod {
  switch (mode) {
    case "UPI":
      return "upi";
    case "CARD":
      return "card";
    case "BANK_TRANSFER":
      return "bank";
    case "CASH":
    default:
      return "cash";
  }
}

function mapMethodToBackend(method: PaymentMethod): ApiPayment["paymentMode"] {
  switch (method) {
    case "upi":
      return "UPI";
    case "card":
      return "CARD";
    case "bank":
      return "BANK_TRANSFER";
    case "cash":
    default:
      return "CASH";
  }
}

function toApiPaymentDateTime(date: string): string {
  const parsed = new Date(`${date}T12:00:00`);
  return parsed.toISOString();
}

function mapApiPaymentToRecord(payment: ApiPayment): PaymentRecord {
  const paymentType = mapApiPaymentType(payment.paymentType);
  const vendorName = payment.vendor?.vendorName;
  const isExpense = paymentType === "expense";

  return {
    id: payment.id,
    bookingId: payment.bookingId ?? "",
    customerId: "",
    paymentType,
    amount: Number.parseFloat(payment.amount) || 0,
    date: payment.transactionDate.slice(0, 10),
    method: mapPaymentMode(payment.paymentMode),
    status: "paid",
    note: payment.description ?? undefined,
    createdAt: payment.createdAt,
    clientName: isExpense
      ? payment.paidTo ?? vendorName ?? payment.description ?? "—"
      : payment.receivedFrom ?? payment.description ?? "—",
    email: "",
    bookingTitle: isExpense
      ? vendorName ?? "—"
      : payment.booking?.bookingNumber ?? "—",
    vendorId: payment.vendorId ?? undefined,
    vendorName,
  };
}

export async function fetchPaymentsFromApi(): Promise<PaymentRecord[]> {
  const page = await apiRequest<Paginated<ApiPayment>>(
    "/payments?limit=100&sortBy=createdAt&order=desc",
  );

  return page.items.map(mapApiPaymentToRecord);
}

export async function createPaymentViaApi(input: CreatePaymentInput): Promise<PaymentRecord> {
  const isExpense = input.paymentType === "expense";

  const payment = await apiRequest<ApiPayment>("/payments", {
    method: "POST",
    body: {
      paymentType: mapPaymentTypeToBackend(input.paymentType),
      bookingId: isExpense ? null : input.bookingId || null,
      vendorId: isExpense ? input.vendorId || null : null,
      amount: input.amount,
      transactionDate: toApiPaymentDateTime(input.date),
      paymentMode: mapMethodToBackend(input.method),
      receivedFrom: isExpense ? null : input.receivedFrom?.trim() || null,
      paidTo: isExpense ? input.paidTo?.trim() || null : null,
      description: input.description?.trim() || null,
      transactionType: isExpense ? "Vendor payment" : "Booking payment",
    },
  });

  return mapApiPaymentToRecord(payment);
}
