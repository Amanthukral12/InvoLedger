import { create } from "zustand";

interface TransactionState {
  selectedYear: number;
  setSelectedYear: (year: number) => void;
}

const useTransactionStore = create<TransactionState>()((set) => ({
  selectedYear: new Date().getFullYear(),
  setSelectedYear: (year) => set({ selectedYear: year }),
}));

export default useTransactionStore;
