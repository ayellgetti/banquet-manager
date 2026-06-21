export type InvoiceLineItem = {
  id: string;
  description: string;
  quantity: number;
  rate: number;
};

export type InvoiceState = {
  customerName: string;
  phone: string;
  eventDate: string;
  invoiceDate: string;
  invoiceNumber: string;
  lineItems: InvoiceLineItem[];
  discountPercent: number;
  discountAmount: number;
  discountType: "percent" | "fixed";
  notes: string;
};

const todayISO = () => new Date().toISOString().slice(0, 10);

const defaultInvoiceNumber = () => {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `INV-${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${String(d.getTime()).slice(-4)}`;
};

let lineSeq = 0;
export const createInvoiceLineItem = (): InvoiceLineItem => ({
  id: `line-${++lineSeq}-${Date.now()}`,
  description: "",
  quantity: 1,
  rate: 0,
});

export const initialInvoice = (): InvoiceState => ({
  customerName: "",
  phone: "",
  eventDate: "",
  invoiceDate: todayISO(),
  invoiceNumber: defaultInvoiceNumber(),
  lineItems: [createInvoiceLineItem()],
  discountPercent: 0,
  discountAmount: 0,
  discountType: "percent",
  notes: "",
});
