import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../utils/api";
import useInvoiceStore from "../store/invoiceStore";
import { Invoice } from "../types/types";

export const useInvoice = () => {
  const queryClient = useQueryClient();

  const { selectedMonth, selectedYear, currentPage, pageSize } =
    useInvoiceStore();

  const invoiceQuery = useQuery({
    queryKey: ["invoice", selectedMonth, selectedYear, currentPage, pageSize],
    queryFn: async () => {
      const { data } = await api.get("/invoice", {
        params: {
          month: selectedMonth,
          year: selectedYear,
          page: currentPage,
          limit: pageSize,
        },
      });
      return data.data;
    },
    placeholderData: true,
  });
  const createInvoiceMutation = useMutation<
    Invoice,
    Error,
    Partial<Invoice>,
    { previousInvoices?: Invoice[] }
  >({
    mutationFn: async (formData) => {
      const { data } = await api.post("/invoice/add", formData);
      return data;
    },
    onMutate: async (newInvoice) => {
      await queryClient.cancelQueries({ queryKey: ["invoice"] });
      const previousInvoices = queryClient.getQueryData<Invoice[]>(["invoice"]);

      queryClient.setQueryData<Invoice[]>(["invoice"], (oldInvoices) => {
        return oldInvoices
          ? [
              ...oldInvoices,
              { ...newInvoice, id: Date.now().toString() } as Invoice,
            ]
          : [{ ...newInvoice, id: Date.now().toString() } as Invoice];
      });
      return { previousInvoices };
    },
    onError: (_, __, context) => {
      if (context?.previousInvoices) {
        queryClient.setQueryData(["invoice"], context.previousInvoices);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["invoice"] });
    },
  });

  const updateInvoiceMutation = useMutation<
    Invoice,
    Error,
    { id: string | undefined; formData: Partial<Invoice> },
    { previousInvoices?: Invoice[] }
  >({
    mutationFn: async ({ id, formData }) => {
      const { data } = await api.put<Invoice>(`/invoice/${id}`, formData);
      return data;
    },
    onMutate: async ({ id, formData }) => {
      await queryClient.cancelQueries({ queryKey: ["invoice"] });
      const previousInvoices = queryClient.getQueryData<Invoice[]>(["invoice"]);
      queryClient.setQueryData<Invoice[]>(
        ["invoice"],
        (oldInvoices) =>
          oldInvoices?.map((invoice) =>
            invoice.id === id ? { ...invoice, formData } : invoice
          ) || []
      );
      return { previousInvoices };
    },
    onError: (_, __, context) => {
      if (context?.previousInvoices) {
        queryClient.setQueryData(["invoice"], context.previousInvoices);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["invoice"] });
    },
  });

  const deleteInvoiceMutation = useMutation<
    void,
    Error,
    string,
    { previousInvoices?: Invoice[] }
  >({
    mutationFn: async (id) => {
      await api.delete(`/invoice/${id}`);
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["invoice"] });
      const previousInvoices = queryClient.getQueryData<Invoice[]>(["invoice"]);
      queryClient.setQueryData<Invoice[]>(
        ["invoice"],
        (oldInvoices) =>
          oldInvoices?.filter((invoice) => invoice.id !== id) || []
      );
      return { previousInvoices };
    },
    onError: (_, __, context) => {
      if (context?.previousInvoices) {
        queryClient.setQueryData(["invoice"], context.previousInvoices);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["invoice"] });
    },
  });
  return {
    invoiceQuery,
    createInvoiceMutation,
    updateInvoiceMutation,
    deleteInvoiceMutation,
  };
};
