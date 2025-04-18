import { useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../utils/api";
import useInvoiceStore from "../store/invoiceStore";

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
  });
  return {
    invoiceQuery,
  };
};
