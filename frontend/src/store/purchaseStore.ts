import { create } from "zustand";
import { Purchase } from "../types/types";

interface PurchaseState {
  selectedMonth: number;
  selectedYear: number;
  currentPage: number;
  pageSize: number;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedPurchase: Purchase | null;
  setMonth: (month: number) => void;
  setYear: (year: number) => void;
  setCurrentPage: (page: number) => void;
  setPageSize: (size: number) => void;
  setSelectedPurchase: (purchase: Purchase) => void;
}

const usePurchaseStore = create<PurchaseState>()((set) => ({
  selectedPurchase: null,
  selectedMonth: new Date().getMonth() + 1,
  selectedYear: new Date().getFullYear(),
  currentPage: 1,
  pageSize: 6,
  searchTerm: "",
  setSearchTerm: (term) => set({ searchTerm: term }),
  setMonth: (month) => set({ selectedMonth: month, currentPage: 1 }),
  setYear: (year) => set({ selectedYear: year, currentPage: 1 }),
  setCurrentPage: (page) => set({ currentPage: page }),
  setPageSize: (size) => set({ pageSize: size }),
  setSelectedPurchase: (purchase) => set({ selectedPurchase: purchase }),
}));

export default usePurchaseStore;
