import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../utils/api";
import { Transporter } from "../types/types";

export const useTransporter = () => {
  const queryClient = useQueryClient();

  const transporterQuery = useQuery({
    queryKey: ["transporter"],
    queryFn: async () => {
      const { data } = await api.get("/transporters/");
      return data.data;
    },
  });

  const createTransporterMutation = useMutation<
    Transporter,
    Error,
    Partial<Transporter>,
    { previousTransporters?: Transporter[] }
  >({
    mutationFn: async (formData) => {
      const { data } = await api.post("/transporter/add", formData);
      return data;
    },
    onMutate: async (newTransporter) => {
      await queryClient.cancelQueries({ queryKey: ["transporter"] });
      const previousTransporters = queryClient.getQueryData<Transporter[]>([
        "transporter",
      ]);
      queryClient.setQueryData<Transporter[]>(
        ["transporter"],
        (oldTransporters) =>
          oldTransporters
            ? [
                ...oldTransporters,
                { ...newTransporter, id: Date.now().toString() } as Transporter,
              ]
            : [{ ...newTransporter, id: Date.now().toString() } as Transporter]
      );
      return { previousTransporters };
    },
    onError: (_, __, context) => {
      if (context?.previousTransporters) {
        queryClient.setQueryData(["transporter"], context.previousTransporters);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["transporter"] });
    },
  });

  const updateTransporterMutation = useMutation<
    Transporter,
    Error,
    { id: string | undefined; formData: Partial<Transporter> },
    { previousTransporters?: Transporter[] }
  >({
    mutationFn: async ({ id, formData }) => {
      const { data } = await api.put<Transporter>(
        `/transporters/${id}`,
        formData
      );
      return data;
    },
    onMutate: async ({ id, formData }) => {
      await queryClient.cancelQueries({ queryKey: ["transporter"] });
      const previousTransporters = queryClient.getQueryData<Transporter[]>([
        "transporter",
      ]);
      queryClient.setQueryData<Transporter[]>(
        ["transporter"],
        (oldTransporters) =>
          oldTransporters?.map((transporter) =>
            transporter.id === id ? { ...transporter, formData } : transporter
          ) || []
      );
      return { previousTransporters };
    },
    onError: (_, __, context) => {
      if (context?.previousTransporters) {
        queryClient.setQueryData(["transporter"], context.previousTransporters);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["transporter"] });
    },
  });

  const deleteTransporterMutation = useMutation<
    void,
    Error,
    string,
    { previousTransporters?: Transporter[] }
  >({
    mutationFn: async (id) => {
      await api.delete(`/transporters/${id}`);
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["transporter"] });
      const previousTransporters = queryClient.getQueryData<Transporter[]>([
        "transporter",
      ]);
      queryClient.setQueryData<Transporter[]>(
        ["transporter"],
        (oldTransporters) =>
          oldTransporters?.filter((transporter) => transporter.id !== id) || []
      );
      return { previousTransporters };
    },
    onError: (_, __, context) => {
      if (context?.previousTransporters) {
        queryClient.setQueryData(["transporter"], context.previousTransporters);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["transporter"] });
    },
  });

  return {
    transporterQuery,
    createTransporterMutation,
    updateTransporterMutation,
    deleteTransporterMutation,
  };
};
