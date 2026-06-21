export type InvoiceLineItem = {
  id: string;
  description: string;
  quantity: number;
  rate: number;
};

export type InvoiceState = {
  businessName: string;
  businessAddress: string;
  businessPhone: string;
  businessEmail: string;
  authorizedSignatory: string;
  customerName: string;
  customerAddress: string;
  customerPhone: string;
  customerEmail: string;
  invoiceDate: string;
  dueDate: string;
  invoiceNumber: string;
  lineItems: InvoiceLineItem[];
  discountPercent: number;
  discountAmount: number;
  discountType: "percent" | "fixed";
  paymentInfo: string;
  notes: string;
};

export type InvoiceBusinessProfile = {
  businessName: string;
  businessAddress: string;
  businessPhone: string;
  businessEmail: string;
  authorizedSignatory: string;
  paymentInfo: string;
};

export const INVOICE_BUSINESS_STORAGE_KEY = "banquet-invoice-business";

export function loadInvoiceBusinessProfile(): InvoiceBusinessProfile {
  try {
    const raw = localStorage.getItem(INVOICE_BUSINESS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<InvoiceBusinessProfile>;
      return {
        businessName: parsed.businessName ?? "",
        businessAddress: parsed.businessAddress ?? "",
        businessPhone: parsed.businessPhone ?? "",
        businessEmail: parsed.businessEmail ?? "",
        authorizedSignatory: parsed.authorizedSignatory ?? "",
        paymentInfo: parsed.paymentInfo ?? "",
      };
    }
  } catch {
    /* ignore */
  }
  return {
    businessName: "",
    businessAddress: "",
    businessPhone: "",
    businessEmail: "",
    authorizedSignatory: "",
    paymentInfo: "",
  };
}

export function saveInvoiceBusinessProfile(profile: InvoiceBusinessProfile) {
  localStorage.setItem(INVOICE_BUSINESS_STORAGE_KEY, JSON.stringify(profile));
}

const todayISO = () => new Date().toISOString().slice(0, 10);

const defaultDueDate = () => {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  return d.toISOString().slice(0, 10);
};

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

export const initialInvoice = (): InvoiceState => {
  const business = loadInvoiceBusinessProfile();
  return {
    ...business,
    customerName: "",
    customerAddress: "",
    customerPhone: "",
    customerEmail: "",
    invoiceDate: todayISO(),
    dueDate: defaultDueDate(),
    invoiceNumber: defaultInvoiceNumber(),
    lineItems: [createInvoiceLineItem()],
    discountPercent: 0,
    discountAmount: 0,
    discountType: "percent",
    notes: "",
  };
};
