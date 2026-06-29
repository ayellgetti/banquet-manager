import type { VendorRecord } from "@/data/banquetData";
import { apiRequest } from "@/lib/apiClient";
import type { Paginated } from "@/lib/apiTypes";

type ApiVendor = {
  id: string;
  vendorName: string;
  mobile: string | null;
  email: string | null;
  createdAt: string;
  category: { id: string; categoryName: string } | null;
};

export type VendorCategoryOption = {
  id: string;
  categoryName: string;
};

export type CreateVendorInput = {
  vendorName: string;
  categoryId?: string | null;
  mobile?: string | null;
  email?: string | null;
  address?: string | null;
  gstNumber?: string | null;
  notes?: string | null;
};

function mapApiVendorToRecord(vendor: ApiVendor): VendorRecord {
  return {
    id: vendor.id,
    name: vendor.vendorName,
    category: vendor.category?.categoryName ?? "General",
    email: vendor.email ?? "",
    rating: 4,
    startingRate: 0,
    createdAt: vendor.createdAt,
    usedInCount: 0,
  };
}

export async function fetchVendorsFromApi(): Promise<VendorRecord[]> {
  const page = await apiRequest<Paginated<ApiVendor>>(
    "/vendors?limit=100&sortBy=vendorName&order=asc",
  );

  return page.items.map(mapApiVendorToRecord);
}

export async function fetchVendorCategoriesFromApi(): Promise<VendorCategoryOption[]> {
  return apiRequest<VendorCategoryOption[]>("/vendors/categories");
}

export async function createVendorViaApi(input: CreateVendorInput): Promise<VendorRecord> {
  const vendor = await apiRequest<ApiVendor>("/vendors", {
    method: "POST",
    body: {
      vendorName: input.vendorName.trim(),
      categoryId: input.categoryId || null,
      mobile: input.mobile?.trim() || null,
      email: input.email?.trim() || null,
      address: input.address?.trim() || null,
      gstNumber: input.gstNumber?.trim() || null,
      notes: input.notes?.trim() || null,
    },
  });

  return mapApiVendorToRecord(vendor);
}
