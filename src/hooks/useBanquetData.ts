import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  banquetQueryKeys,
  convertEnquiryToBooking,
  createPayment,
  createInvoice,
  fetchBookings,
  fetchCalendarEvents,
  fetchCustomers,
  fetchEnquiries,
  fetchEnquiryViewDetail,
  fetchFollowUpEnquiries,
  fetchFollowUpHistory,
  fetchInventory,
  fetchInventoryOrder,
  fetchInventoryOrders,
  createInventoryOrder,
  fetchInvoiceDetail,
  fetchInvoices,
  fetchOpenEnquiries,
  fetchPayments,
  fetchVendors,
  postLogFollowUp,
  updateInvoice,
  type ConvertEnquiryPayload,
} from "@/lib/banquetApi";
import type { LogFollowUpInput } from "@/data/banquetStore";

export function useEnquiriesQuery() {
  return useQuery({
    queryKey: banquetQueryKeys.enquiries(),
    queryFn: async () => {
      const response = await fetchEnquiries();
      return response.data;
    },
  });
}

export function useEnquiryViewDetailQuery(enquiryId?: string) {
  return useQuery({
    queryKey: banquetQueryKeys.enquiryDetail(enquiryId ?? ""),
    queryFn: async () => {
      const response = await fetchEnquiryViewDetail(enquiryId!);
      return response.data;
    },
    enabled: !!enquiryId,
  });
}

export function useCustomersQuery() {
  return useQuery({
    queryKey: banquetQueryKeys.customers(),
    queryFn: async () => {
      const response = await fetchCustomers();
      return response.data;
    },
  });
}

export function useOpenEnquiriesQuery(enabled = true) {
  return useQuery({
    queryKey: banquetQueryKeys.openEnquiries(),
    queryFn: async () => {
      const response = await fetchOpenEnquiries();
      return response.data;
    },
    enabled,
  });
}

export function useBookingsQuery(enabled = true) {
  return useQuery({
    queryKey: banquetQueryKeys.bookings(),
    queryFn: async () => {
      const response = await fetchBookings();
      return response.data;
    },
    enabled,
  });
}

export function useCalendarEventsQuery() {
  return useQuery({
    queryKey: banquetQueryKeys.calendarEvents(),
    queryFn: async () => {
      const response = await fetchCalendarEvents();
      return response.data;
    },
    staleTime: 60_000,
  });
}

export function useConvertEnquiryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: ConvertEnquiryPayload) => {
      const response = await convertEnquiryToBooking(payload);
      return response.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: banquetQueryKeys.all });
    },
  });
}

export function useFollowUpEnquiriesQuery() {
  return useQuery({
    queryKey: banquetQueryKeys.followUpEnquiries(),
    queryFn: async () => {
      const response = await fetchFollowUpEnquiries();
      return response.data;
    },
  });
}

export function useFollowUpHistoryQuery(enquiryId?: string) {
  return useQuery({
    queryKey: banquetQueryKeys.followUpHistory(enquiryId ?? ""),
    queryFn: async () => {
      const response = await fetchFollowUpHistory(enquiryId!);
      return response.data;
    },
    enabled: !!enquiryId,
  });
}

export function useLogFollowUpMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: LogFollowUpInput) => {
      const response = await postLogFollowUp(input);
      return response.data;
    },
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: banquetQueryKeys.all });
      void queryClient.invalidateQueries({
        queryKey: banquetQueryKeys.followUpHistory(variables.enquiryId),
      });
    },
  });
}

export function usePaymentsQuery() {
  return useQuery({
    queryKey: banquetQueryKeys.payments(),
    queryFn: async () => {
      const response = await fetchPayments();
      return response.data;
    },
  });
}

export function useCreatePaymentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: Parameters<typeof createPayment>[0]) => {
      const response = await createPayment(input);
      return response.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: banquetQueryKeys.payments() });
    },
  });
}

export function useInvoicesQuery() {
  return useQuery({
    queryKey: banquetQueryKeys.invoices(),
    queryFn: async () => {
      const response = await fetchInvoices();
      return response.data;
    },
  });
}

export function useInvoiceDetailQuery(invoiceId?: string) {
  return useQuery({
    queryKey: banquetQueryKeys.invoiceDetail(invoiceId ?? ""),
    queryFn: async () => {
      const response = await fetchInvoiceDetail(invoiceId!);
      return response.data;
    },
    enabled: !!invoiceId,
  });
}

export function useCreateInvoiceMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: Parameters<typeof createInvoice>[0]) => {
      const response = await createInvoice(input);
      return response.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: banquetQueryKeys.invoices() });
    },
  });
}

export function useUpdateInvoiceMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: Parameters<typeof updateInvoice>[1] }) => {
      const response = await updateInvoice(id, input);
      return response.data;
    },
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: banquetQueryKeys.invoices() });
      void queryClient.invalidateQueries({ queryKey: banquetQueryKeys.invoiceDetail(data.id) });
    },
  });
}

export function useVendorsQuery() {
  return useQuery({
    queryKey: banquetQueryKeys.vendors(),
    queryFn: async () => {
      const response = await fetchVendors();
      return response.data;
    },
  });
}

export function useInventoryQuery() {
  return useQuery({
    queryKey: banquetQueryKeys.inventory(),
    queryFn: async () => {
      const response = await fetchInventory();
      return response.data;
    },
  });
}

export function useInventoryOrdersQuery() {
  return useQuery({
    queryKey: banquetQueryKeys.inventoryOrders(),
    queryFn: async () => {
      const response = await fetchInventoryOrders();
      return response.data;
    },
    refetchOnWindowFocus: true,
  });
}

export function useInventoryOrderDetailQuery(orderId?: string) {
  return useQuery({
    queryKey: banquetQueryKeys.inventoryOrderDetail(orderId ?? ""),
    queryFn: async () => {
      const response = await fetchInventoryOrder(orderId!);
      return response.data;
    },
    enabled: !!orderId,
  });
}

export function useCreateInventoryOrderMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: Parameters<typeof createInventoryOrder>[0]) => {
      const response = await createInventoryOrder(input);
      return response.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: banquetQueryKeys.inventoryOrders() });
    },
  });
}
