import type { InvoiceLineItem, InvoiceState } from "@/types/invoice";

export function lineItemAmount(item: InvoiceLineItem): number {
  return Math.max(0, item.quantity || 0) * Math.max(0, item.rate || 0);
}

export function calcInvoiceTotals(state: InvoiceState) {
  const items = state.lineItems.map((item) => ({
    ...item,
    amount: lineItemAmount(item),
  }));
  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const rawDiscount =
    state.discountType === "fixed"
      ? state.discountAmount || 0
      : Math.round((subtotal * (state.discountPercent || 0)) / 100);
  const discount = Math.max(0, Math.min(subtotal, rawDiscount));
  const total = subtotal - discount;
  return { items, subtotal, discount, total };
}

export type InvoiceTotals = ReturnType<typeof calcInvoiceTotals>;
