import { create } from "zustand";
import { Company, CustomSession } from "../types/types";
import { persist } from "zustand/middleware";

interface AuthState {
  company: Company | null;
  currentSession: CustomSession | null;
  isAuthenticated: boolean;
  setCompany: (company: Company | null) => void;
  setCurrentSession: (session: CustomSession | null) => void;
  logout: () => void;
}
const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      company: null,
      currentSession: null,
      isAuthenticated: false,
      setCompany: (company) => set({ company, isAuthenticated: !!company }),
      setCurrentSession: (session) => set({ currentSession: session }),
      logout: () =>
        set({ company: null, currentSession: null, isAuthenticated: false }),
    }),
    {
      name: "auth-store",
      partialize: (state) => ({
        company: state.company,
        currentSession: state.currentSession,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;
