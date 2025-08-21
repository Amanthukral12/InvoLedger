import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../utils/api";
import { Purchase } from "../types/types";
import { toast } from "react-toastify";
import { useFilterStore } from "../store/filterStore";

export const usePurchase = () => {
  const queryClient = useQueryClient();

  const { selectedMonth, selectedYear, currentPage, pageSize, searchTerm } =
    useFilterStore();
  const purchaseQuery = useQuery({
    queryKey: [
      "purchase",
      selectedMonth,
      selectedYear,
      currentPage,
      pageSize,
      searchTerm,
    ],
    queryFn: async () => {
      const { data } = await api.get("/purchase", {
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

  const purchasesSummary = useQuery({
    queryKey: ["purchasesSummary", selectedMonth, selectedYear],
    queryFn: async () => {
      const { data } = await api.get("/purchase/purchasesSummary", {
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

  const purchasesForMonthCompany = useQuery({
    queryKey: ["purchasesForMonthCompany", selectedMonth, selectedYear],
    queryFn: async () => {
      const { data } = await api.get("/purchase/purchasesformonthcompany", {
        params: {
          month: selectedMonth,
          year: selectedYear,
        },
      });
      return data.data;
    },
  });

  const createPurchaseMutation = useMutation<
    Purchase,
    Error,
    Partial<Purchase>,
    { previousPurchases?: Purchase[] }
  >({
    mutationFn: async (formData) => {
      const { data } = await api.post("/purchase/add", formData);
      toast.success(data.message);
      return data;
    },
    onMutate: async (newPurchase) => {
      await queryClient.cancelQueries({ queryKey: ["purchase"] });
      const previousPurchases = queryClient.getQueryData<Purchase[]>([
        "purchase",
      ]);

      queryClient.setQueryData<Purchase[]>(["purchase"], (oldPurchases) => {
        return oldPurchases
          ? [
              ...oldPurchases,
              { ...newPurchase, id: Date.now().toString() } as Purchase,
            ]
          : [{ ...newPurchase, id: Date.now().toString() } as Purchase];
      });
      return { previousPurchases };
    },
    onError: (_, __, context) => {
      if (context?.previousPurchases) {
        queryClient.setQueryData(["purchase"], context.previousPurchases);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["purchase"] });
    },
  });

  const updatePurchaseMutation = useMutation<
    Purchase,
    Error,
    { id: string | undefined; formData: Partial<Purchase> },
    { previousPurchases?: Purchase[] }
  >({
    mutationFn: async ({ id, formData }) => {
      const { data } = await api.put(`/purchase/${id}`, formData);
      toast.success(data.message);
      return data;
    },
    onMutate: async ({ id, formData }) => {
      await queryClient.cancelQueries({ queryKey: ["purchase"] });
      const previousPurchases = queryClient.getQueryData<Purchase[]>([
        "purchase",
      ]);
      queryClient.setQueryData<Purchase[]>(
        ["purchase"],
        (oldPurchases) =>
          oldPurchases?.map((purchase) =>
            purchase.id === id ? { ...purchase, formData } : purchase
          ) || []
      );
      return { previousPurchases };
    },
    onError: (_, __, context) => {
      if (context?.previousPurchases) {
        queryClient.setQueryData(["purchase"], context.previousPurchases);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["purchase"] });
    },
  });

  const deletePurchaseMutation = useMutation<
    void,
    Error,
    string,
    { previousPurchases?: Purchase[] }
  >({
    mutationFn: async (id) => {
      await api.delete(`/purchase/${id}`);
      toast.success("Purchase deleted successfully");
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["purchase"] });
      const previousPurchases = queryClient.getQueryData<Purchase[]>([
        "purchase",
      ]);
      queryClient.setQueryData<Purchase[]>(
        ["purchase"],
        (oldPurchases) =>
          oldPurchases?.filter((purchase) => purchase.id !== id) || []
      );
      return { previousPurchases };
    },
    onError: (_, __, context) => {
      if (context?.previousPurchases) {
        queryClient.setQueryData(["purchase"], context.previousPurchases);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["purchase"] });
    },
  });

  return {
    purchaseQuery,
    purchasesSummary,
    purchasesForMonthCompany,
    createPurchaseMutation,
    updatePurchaseMutation,
    deletePurchaseMutation,
  };
};
