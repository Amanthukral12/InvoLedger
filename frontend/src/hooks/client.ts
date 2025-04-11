import { useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../utils/api";

export const useClient = () => {
  const queryClient = useQueryClient();

  const clientQuery = useQuery({
    queryKey: ["client"],
    queryFn: async () => {
      const { data } = await api.get("/client/");
      return data.data;
    },
    enabled: false,
  });
  return {
    clientQuery,
  };
};
