import type { InventoryRecord } from "@/data/banquetData";
import { apiRequest } from "@/lib/apiClient";
import type { Paginated } from "@/lib/apiTypes";

export { fetchVendorsFromApi } from "@/lib/vendorsApi";

type ApiInventory = {
  id: string;
  title: string;
  category: string | null;
  quantity: string | null;
  unit: string | null;
  purchasePrice: string | null;
  status: "AVAILABLE" | "BOOKED" | "MAINTENANCE";
  createdAt: string;
  vendor: { id: string; vendorName: string } | null;
};

export async function fetchInventoryFromApi(): Promise<InventoryRecord[]> {
  const page = await apiRequest<Paginated<ApiInventory>>(
    "/inventory?limit=100&sortBy=title&order=asc",
  );

  return page.items.map((item) => {
    const quantity = Number.parseFloat(item.quantity ?? "0") || 0;
    const costPerUnit = Number.parseFloat(item.purchasePrice ?? "0") || 0;
    return {
      id: item.id,
      name: item.title,
      vendorId: item.vendor?.id,
      vendorName: item.vendor?.vendorName ?? "—",
      category: "other",
      quantity,
      unit: (item.unit as InventoryRecord["unit"]) ?? "pc",
      reorderLevel: 0,
      costPerUnit,
      createdAt: item.createdAt,
      value: quantity * costPerUnit,
      stockStatus: item.status === "AVAILABLE" ? "ok" : "low",
    };
  });
}
