import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  banquetQueryKeys,
  convertEnquiryToBooking,
  fetchBookings,
  fetchCalendarEvents,
  fetchCustomers,
  fetchEnquiries,
  fetchFollowUpEnquiries,
  fetchFollowUpHistory,
  fetchInventory,
  fetchOpenEnquiries,
  fetchPayments,
  fetchVendors,
  postLogFollowUp,
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

export function useBookingsQuery() {
  return useQuery({
    queryKey: banquetQueryKeys.bookings(),
    queryFn: async () => {
      const response = await fetchBookings();
      return response.data;
    },
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
