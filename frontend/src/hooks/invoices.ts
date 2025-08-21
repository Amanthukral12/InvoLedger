import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../utils/api";
import { Invoice } from "../types/types";
import { toast } from "react-toastify";
import { useFilterStore } from "../store/filterStore";

export const useInvoice = () => {
  const queryClient = useQueryClient();

  const { selectedMonth, selectedYear, currentPage, pageSize, searchTerm } =
    useFilterStore();

  const invoiceQuery = useQuery({
    queryKey: [
      "invoice",
      selectedMonth,
      selectedYear,
      currentPage,
      pageSize,
      searchTerm,
    ],
    queryFn: async () => {
      const { data } = await api.get("/invoice", {
        params: {
          month: selectedMonth,
          year: selectedYear,
          page: currentPage,
          limit: pageSize,
          searchTerm: searchTerm,
        },
      });
      return data.data;
    },
    placeholderData: true,
  });

  const invoiceCountQuery = useQuery({
    queryKey: ["invoiceCount", selectedYear],
    queryFn: async () => {
      const { data } = await api.get("/invoice/getInvoicesCount", {
        params: {
          year: selectedYear,
        },
      });
      return data.data;
    },
  });

  const invoicesSummary = useQuery({
    queryKey: ["invoicesSummary", selectedMonth, selectedYear],
    queryFn: async () => {
      const { data } = await api.get("/invoice/invoicesSummary", {
        params: {
          month: selectedMonth,
          year: selectedYear,
        },
      });
      return data.data;
    },
    enabled: !!selectedMonth && !!selectedYear,
    refetchOnWindowFocus: false,
  });

  const invoicesForMonthCompany = useQuery({
    queryKey: ["invoicesForMonthCompany", selectedMonth, selectedYear],
    queryFn: async () => {
      const { data } = await api.get("/invoice/invoicesformonthcompany", {
        params: {
          month: selectedMonth,
          year: selectedYear,
        },
      });
      return data.data;
    },
  });
  const createInvoiceMutation = useMutation<
    Invoice,
    Error,
    Partial<Invoice>,
    { previousInvoices?: Invoice[] }
  >({
    mutationFn: async (formData) => {
      const { data } = await api.post("/invoice/add", formData);
      toast.success(data.message);
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

  const generateInvoiceMutation = useMutation<
    void,
    Error,
    {
      id: string;
      invoiceNumber: number;
      clientName: string;
      invoiceType: string;
    }
  >({
    mutationFn: async ({ id, invoiceNumber, clientName, invoiceType }) => {
      const response = await api.post(
        `/invoice/generate-invoice/${id}/`,
        { invoiceType },
        {
          responseType: "blob",
          withCredentials: true,
        }
      );

      const disposition = response.headers["content-disposition"];
      let filename = `${clientName}_${invoiceType}_${invoiceNumber}.pdf`;

      if (disposition && disposition.includes("filename=")) {
        const match = disposition.match(/filename="?([^"]+)"?/);
        if (match?.[1]) {
          filename = match[1];
        }
      }

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();

      link.remove();
      window.URL.revokeObjectURL(url);
    },
  });

  const updateInvoiceMutation = useMutation<
    Invoice,
    Error,
    { id: string | undefined; formData: Partial<Invoice> },
    { previousInvoices?: Invoice[] }
  >({
    mutationFn: async ({ id, formData }) => {
      const { data } = await api.put(`/invoice/${id}`, formData);
      toast.success(data.message);
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
      toast.success("Invoice deleted successfully");
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
    generateInvoiceMutation,
    invoiceCountQuery,
    invoicesSummary,
    invoicesForMonthCompany,
  };
};
