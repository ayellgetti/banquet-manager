import type { CustomerListRecord } from "@/data/banquetData";
import { apiRequest } from "@/lib/apiClient";
import type { Paginated } from "@/lib/apiTypes";
import { formatCustomerName } from "@/lib/mappers/enquiryMapper";

type ApiCustomer = {
  id: string;
  firstName: string;
  lastName: string;
  mobileNo: string;
  emailId: string | null;
  city: string | null;
  createdAt: string;
};

export type CreateCustomerPayload = {
  firstName: string;
  lastName: string;
  mobileNo: string;
  emailId?: string | null;
  city?: string | null;
  state?: string | null;
};

function mapCustomer(customer: ApiCustomer): CustomerListRecord {
  const name = formatCustomerName(customer.firstName, customer.lastName);
  return {
    id: customer.id,
    name,
    email: customer.emailId ?? "",
    phone: customer.mobileNo,
    notes: customer.city ?? undefined,
    createdAt: customer.createdAt,
    segment: "lead",
    enquiryCount: 0,
    bookingCount: 0,
    totalSpent: 0,
  };
}

export async function fetchCustomersFromApi(): Promise<CustomerListRecord[]> {
  const page = await apiRequest<Paginated<ApiCustomer>>(
    "/customers?limit=100&sortBy=createdAt&order=desc",
  );
  return page.items.map(mapCustomer);
}

export async function createCustomerViaApi(payload: CreateCustomerPayload): Promise<CustomerListRecord> {
  const customer = await apiRequest<ApiCustomer>("/customers", {
    method: "POST",
    body: payload,
  });
  return mapCustomer(customer);
}
