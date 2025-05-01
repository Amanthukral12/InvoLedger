import { useQuery, useQueryClient } from "@tanstack/react-query";
import useTransactionStore from "../store/transactionStore";
import api from "../utils/api";
import useClientStore from "../store/clientstore";

export const useTransaction = () => {
  const queryClient = useQueryClient();

  const { selectedYear } = useTransactionStore();
  const selectedClient = useClientStore((state) => state.selectedClient);

  const transactionQuery = useQuery({
    queryKey: ["transaction", selectedYear, selectedClient],
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
  return {
    transactionQuery,
  };
};
