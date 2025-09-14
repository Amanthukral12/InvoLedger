import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../utils/api";
import useClientStore from "../store/clientstore";
import { Transaction } from "../types/types";
import { toast } from "react-toastify";
import { useFilterStore } from "../store/filterStore";

export const useTransaction = () => {
  const queryClient = useQueryClient();

  const { selectedYear, selectedMonth } = useFilterStore();
  const selectedClient = useClientStore((state) => state.selectedClient);

  const queryKey = ["transaction", selectedYear, selectedClient?.id];

  const transactionQuery = useQuery({
    queryKey: queryKey,
    queryFn: async () => {
      const { data } = await api.get(
        `/transactions/${selectedClient?.id}/getTransactions`,
        {
          params: {
            year: selectedYear,
          },
        }
      );
      return data.data;
    },
    enabled: !!selectedClient && !!selectedYear,
  });

  const getAllTransactionsForCompanyForMonth = useQuery({
    queryKey: ["allTransactions", selectedYear, selectedMonth],
    queryFn: async () => {
      const { data } = await api.get(`/transactions`, {
        params: {
          year: selectedYear,
          month: selectedMonth,
        },
      });
      return data.data;
    },
    enabled: !!selectedYear && !!selectedMonth,
  });
  const getAllTransactionsForCompanyForMonthGroupedByClient = useQuery({
    queryKey: ["allTransactionsGroupedByClient", selectedYear, selectedMonth],
    queryFn: async () => {
      const { data } = await api.get(`/transactions/groupedByClient`, {
        params: {
          year: selectedYear,
          month: selectedMonth,
        },
      });
      return data.data;
    },
    enabled: !!selectedYear && !!selectedMonth,
  });

  const deleteTransactionMutation = useMutation<
    void,
    Error,
    { clientId: string; id: string },
    {
      previousTransactions?: Transaction[];
      prevAllTransactions?: Transaction[];
    }
  >({
    mutationFn: async ({ clientId, id }) => {
      await api.delete(`/transactions/${clientId}/${id}`);
      toast.success("Transaction deleted successfully");
    },
    onMutate: async ({ id }) => {
      await queryClient.cancelQueries({
        queryKey: queryKey,
      });
      await queryClient.cancelQueries({
        queryKey: ["allTransactions", selectedYear, selectedMonth],
      });

      const previousTransactions = queryClient.getQueryData<Transaction[]>([
        "transaction",
        selectedYear,
        selectedClient,
      ]);
      const prevAllTransactions = queryClient.getQueryData<Transaction[]>([
        "allTransactions",
        selectedYear,
        selectedMonth,
      ]);
      queryClient.setQueryData<Transaction[]>(queryKey, (oldTransactions) =>
        oldTransactions?.filter((transaction) => transaction.id !== id)
      );
      queryClient.setQueryData<Transaction[]>(
        ["allTransactions", selectedYear, selectedMonth],
        (oldTransactions) =>
          oldTransactions?.filter((transaction) => transaction.id !== id)
      );

      return { previousTransactions, prevAllTransactions };
    },
    onError: (_, __, context) => {
      if (context?.previousTransactions) {
        queryClient.setQueryData(queryKey, context.previousTransactions);
      }
      if (context?.prevAllTransactions) {
        queryClient.setQueryData(
          ["allTransactions", selectedYear, selectedMonth],
          context.prevAllTransactions
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: ["client", selectedClient?.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["allTransactions", selectedYear, selectedMonth],
      });
      queryClient.invalidateQueries({
        queryKey: [
          "allTransactionsGroupedByClient",
          selectedYear,
          selectedMonth,
        ],
      });
    },
  });

  const createTransactionMutation = useMutation<
    Transaction,
    Error,
    { clientId: string; formData: Partial<Transaction> },
    {
      previousTransactions?: Transaction[];
      prevAllTransactions?: Transaction[];
    }
  >({
    mutationFn: async ({ formData, clientId }) => {
      const { data } = await api.post(
        `/transactions/${clientId}/add`,
        formData
      );
      toast.success(data.message);
      return data.data;
    },
    onMutate: async ({ clientId, formData }) => {
      await queryClient.cancelQueries({ queryKey: queryKey });
      await queryClient.cancelQueries({
        queryKey: ["allTransactions", selectedYear, selectedMonth],
      });
      const previousTransactions =
        queryClient.getQueryData<Transaction[]>(queryKey);
      const prevAllTransactions = queryClient.getQueryData<Transaction[]>([
        "allTransactions",
        selectedYear,
        selectedMonth,
      ]);

      const transaction: Transaction = {
        id: Date.now().toString(),
        clientId,
        companyId: selectedClient?.companyId || 0,
        amount: formData.amount ?? 0,
        type: formData.type ?? "DEBIT",
        description: formData.description ?? "",
        bankName: formData.bankName || "",
        date: formData.date ? formData.date : new Date(),
      };
      queryClient.setQueryData<Transaction[]>(queryKey, (oldTransactions) => {
        return oldTransactions
          ? [...oldTransactions, transaction]
          : [transaction];
      });
      queryClient.setQueryData<Transaction[]>(
        ["allTransactions", selectedYear, selectedMonth],
        (oldTransactions) => {
          return oldTransactions
            ? [...oldTransactions, transaction]
            : [transaction];
        }
      );
      return { previousTransactions, prevAllTransactions };
    },
    onError: (_, __, context) => {
      if (context?.previousTransactions) {
        queryClient.setQueryData(queryKey, context.previousTransactions);
      }
      if (context?.prevAllTransactions) {
        queryClient.setQueryData(
          ["allTransactions", selectedYear, selectedMonth],
          context.prevAllTransactions
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: ["client", selectedClient?.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["allTransactions", selectedYear, selectedMonth],
      });
      queryClient.invalidateQueries({
        queryKey: [
          "allTransactionsGroupedByClient",
          selectedYear,
          selectedMonth,
        ],
      });
    },
  });

  return {
    transactionQuery,
    deleteTransactionMutation,
    createTransactionMutation,
    getAllTransactionsForCompanyForMonth,
    getAllTransactionsForCompanyForMonthGroupedByClient,
  };
};
