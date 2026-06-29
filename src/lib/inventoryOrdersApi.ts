import { apiRequest } from "@/lib/apiClient";
import type { Paginated } from "@/lib/apiTypes";

export type InventoryOrderLineRecord = {
  id: string;
  materialId: string;
  materialName: string;
  materialCategory: string | null;
  unit: string;
  quantity: string;
};

export type InventoryOrderRecord = {
  id: string;
  orderNumber: string;
  vendorId: string;
  eventId: string | null;
  deliveryAt: string;
  notes: string | null;
  status: "PLACED" | "DELIVERED" | "CANCELLED";
  createdAt: string;
  vendor: {
    id: string;
    vendorName: string;
  };
  event: {
    id: string;
    eventType: string;
    eventDate: string;
    customer: {
      firstName: string;
      lastName: string;
    };
  } | null;
  lineItems: InventoryOrderLineRecord[];
};

export type CreateInventoryOrderLineInput = {
  materialId: string;
  materialName: string;
  materialCategory?: string | null;
  unit: string;
  quantity: number;
};

export type CreateInventoryOrderInput = {
  vendorId: string;
  eventId?: string | null;
  deliveryAt: string;
  notes?: string | null;
  lineItems: CreateInventoryOrderLineInput[];
};

export async function fetchInventoryOrdersFromApi(): Promise<InventoryOrderRecord[]> {
  const page = await apiRequest<Paginated<InventoryOrderRecord>>(
    "/inventory-orders?limit=100&sortBy=createdAt&order=desc",
  );

  return page.items;
}

export async function fetchInventoryOrderByIdFromApi(id: string): Promise<InventoryOrderRecord> {
  return apiRequest<InventoryOrderRecord>(`/inventory-orders/${id}`);
}

export async function createInventoryOrderViaApi(
  input: CreateInventoryOrderInput,
): Promise<InventoryOrderRecord> {
  return apiRequest<InventoryOrderRecord>("/inventory-orders", {
    method: "POST",
    body: input,
  });
}
