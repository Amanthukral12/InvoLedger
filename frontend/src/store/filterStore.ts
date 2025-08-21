import { create } from "zustand";

interface FilterState {
  selectedMonth: number;
  selectedYear: number;
  searchTerm: string;
  currentPage: number;
  pageSize: number;
  setMonth: (month: number) => void;
  setYear: (year: number) => void;
  setSearchTerm: (term: string) => void;
  setCurrentPage: (page: number) => void;
  setPageSize: (size: number) => void;
}

export const useFilterStore = create<FilterState>()((set) => ({
  selectedMonth: new Date().getMonth() + 1,
  selectedYear: new Date().getFullYear(),
  searchTerm: "",
  currentPage: 1,
  pageSize: 6,
  setMonth: (month) => set({ selectedMonth: month, currentPage: 1 }),
  setYear: (year) => set({ selectedYear: year, currentPage: 1 }),
  setSearchTerm: (term) => set({ searchTerm: term }),
  setCurrentPage: (page) => set({ currentPage: page }),
  setPageSize: (size) => set({ pageSize: size }),
}));
