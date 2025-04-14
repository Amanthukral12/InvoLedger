import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../utils/api";
import { Client } from "../types/types";

export const useClient = () => {
  const queryClient = useQueryClient();

  const clientQuery = useQuery({
    queryKey: ["client"],
    queryFn: async () => {
      const { data } = await api.get("/client/");
      return data.data;
    },
  });

  const useSingleClientQuery = (id: string) => {
    return useQuery<Client>({
      queryKey: ["client", id],
      queryFn: async () => {
        const { data } = await api.get<Client>(`/client/${id}`);
        return data;
      },
      enabled: !!id,
    });
  };

  const createClientMutation = useMutation<
    Client,
    Error,
    Partial<Client>,
    { previousClients?: Client[] }
  >({
    mutationFn: async (formData) => {
      const { data } = await api.post("/client/add", formData);
      return data;
    },
    onMutate: async (newClient) => {
      await queryClient.cancelQueries({ queryKey: ["client"] });
      const previousClients = queryClient.getQueryData<Client[]>(["client"]);
      queryClient.setQueryData<Client[]>(["client"], (oldClients) =>
        oldClients
          ? [
              ...oldClients,
              { ...newClient, id: Date.now().toString() } as Client,
            ]
          : [{ ...newClient, id: Date.now().toString() } as Client]
      );
      return { previousClients };
    },
    onError: (_, __, context) => {
      if (context?.previousClients) {
        queryClient.setQueryData(["client"], context.previousClients);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["client"] });
    },
  });

  const updateClientMutation = useMutation<
    Client,
    Error,
    { id: string | undefined; updates: Partial<Client> },
    { previousClients?: Client[] }
  >({
    mutationFn: async ({ id, updates }) => {
      const { data } = await api.put<Client>(`/client/${id}`, updates);
      return data;
    },
    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: ["client"] });
      const previousClients = queryClient.getQueryData<Client[]>(["client"]);
      queryClient.setQueryData<Client[]>(
        ["client"],
        (oldClients) =>
          oldClients?.map((client) =>
            client.id === id ? { ...client, ...updates } : client
          ) || []
      );
      return { previousClients };
    },
    onError: (_, __, context) => {
      if (context?.previousClients) {
        queryClient.setQueryData(["client"], context.previousClients);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["client"] });
    },
  });

  const deleteClientMutation = useMutation<
    void,
    Error,
    string,
    { previousClients?: Client[] }
  >({
    mutationFn: async (id) => {
      await api.delete(`/client/${id}`);
    },

    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["client"] });

      const previousClients = queryClient.getQueryData<Client[]>(["client"]);

      queryClient.setQueryData<Client[]>(
        ["client"],
        (oldClients) => oldClients?.filter((client) => client.id !== id) || []
      );

      return { previousClients };
    },

    onError: (_, __, context) => {
      if (context?.previousClients) {
        queryClient.setQueryData(["client"], context.previousClients);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["client"] });
    },
  });

  return {
    clientQuery,
    createClientMutation,
    updateClientMutation,
    deleteClientMutation,
    useSingleClientQuery,
  };
};
