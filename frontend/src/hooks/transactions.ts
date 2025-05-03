import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import useTransactionStore from "../store/transactionStore";
import api from "../utils/api";
import useClientStore from "../store/clientstore";
import { Transaction } from "../types/types";
import { toast } from "react-toastify";

export const useTransaction = () => {
  const queryClient = useQueryClient();

  const { selectedYear } = useTransactionStore();
  const selectedClient = useClientStore((state) => state.selectedClient);

  const queryKey = ["transaction", selectedYear, selectedClient];

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
  const deleteTransactionMutation = useMutation<
    void,
    Error,
    { clientId: string; id: string },
    { previousTransactions?: Transaction[] }
  >({
    mutationFn: async ({ clientId, id }) => {
      await api.delete(`/transactions/${clientId}/${id}`);
      toast.success("Transaction deleted successfully");
    },
    onMutate: async ({ id }) => {
      await queryClient.cancelQueries({
        queryKey: queryKey,
      });
      const previousTransactions = queryClient.getQueryData<Transaction[]>([
        "transaction",
        selectedYear,
        selectedClient,
      ]);
      queryClient.setQueryData<Transaction[]>(queryKey, (oldTransactions) =>
        oldTransactions?.filter((transaction) => transaction.id !== id)
      );
      return { previousTransactions };
    },
    onError: (_, __, context) => {
      if (context?.previousTransactions) {
        queryClient.setQueryData(queryKey, context.previousTransactions);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: ["client", selectedClient?.id],
      });
    },
  });

  const createTransactionMutation = useMutation<
    Transaction,
    Error,
    { clientId: string; formData: Partial<Transaction> },
    { previousTransactions?: Transaction[] }
  >({
    mutationFn: async ({ formData, clientId }) => {
      const { data } = await api.post(
        `/transactions/${clientId}/add`,
        formData
      );
      toast.success(data.message);
      return data;
    },
    onMutate: async ({ clientId, formData }) => {
      await queryClient.cancelQueries({ queryKey: queryKey });
      const previousTransactions =
        queryClient.getQueryData<Transaction[]>(queryKey);
      const transaction: Transaction = {
        id: Date.now().toString(),
        clientId,
        companyId: selectedClient?.companyId || 0,
        amount: formData.amount ?? 0,
        type: formData.type ?? "DEBIT",
        description: formData.description ?? null,
        date: formData.date ? formData.date : new Date(),
      };
      queryClient.setQueryData<Transaction[]>(queryKey, (oldTransactions) => {
        return oldTransactions
          ? [...oldTransactions, transaction]
          : [transaction];
      });
      return { previousTransactions };
    },
    onError: (_, __, context) => {
      if (context?.previousTransactions) {
        queryClient.setQueryData(queryKey, context.previousTransactions);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: ["client", selectedClient?.id],
      });
    },
  });

  return {
    transactionQuery,
    deleteTransactionMutation,
    createTransactionMutation,
  };
};
