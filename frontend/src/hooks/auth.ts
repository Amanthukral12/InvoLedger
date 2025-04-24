import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Company, SessionResponse } from "../types/types";
import useAuthStore from "../store/authStore";
import api from "../utils/api";
import { toast } from "react-toastify";

export const useAuth = () => {
  const queryClient = useQueryClient();
  const { logout: clearAuth } = useAuthStore();

  const sessionQuery = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const { data } = await api.get<SessionResponse>("/auth/session");
      localStorage.setItem(
        "isAuthenticated",
        data.data.currentCompany.name ? "true" : "false"
      );
      return data.data;
    },
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  });

  const getAllSessionsQuery = useQuery({
    queryKey: ["sessions"],
    queryFn: async () => {
      const { data } = await api.get("/auth/allSessions");
      return data.data;
    },
    enabled: false,
  });

  const profileQuery = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data } = await api.get<Company>("/auth/profile");
      return data;
    },
    enabled: false,
  });

  const initiateGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_BACKEND_URL}/auth/google`;
  };

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await api.post("/auth/logout");
      clearAuth();
      localStorage.removeItem("token");
      localStorage.removeItem("isAuthenticated");
      await queryClient.clear();
    },
  });

  const updateCompanyProfileMutation = useMutation<
    void,
    Error,
    Partial<Company>
  >({
    mutationFn: async (formData) => {
      const { data } = await api.put("/auth/profile", formData);
      toast.success(data.message);
      return data;
    },
    onSuccess: async (data) => {
      console.log(data);
      await queryClient.invalidateQueries({ queryKey: ["session"] });
    },
    onError: (error) => {
      console.log(error);
    },
  });
  return {
    sessionQuery,
    profileQuery,
    initiateGoogleLogin,
    logoutMutation,
    getAllSessionsQuery,
    updateCompanyProfileMutation,
    isAuthenticated: !!sessionQuery.data?.currentCompany,
    company: sessionQuery.data?.currentCompany,
    currentSession: sessionQuery.data?.currentSession,
  };
};
