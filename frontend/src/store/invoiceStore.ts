import { create } from "zustand";
import { Invoice } from "../types/types";

interface InvoiceState {
  selectedMonth: number;
  selectedYear: number;
  currentPage: number;
  pageSize: number;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedInvoice: Invoice | null;
  setMonth: (month: number) => void;
  setYear: (year: number) => void;
  setCurrentPage: (page: number) => void;
  setPageSize: (size: number) => void;
  setSelectedInvoice: (invoice: Invoice) => void;
}

const useInvoiceStore = create<InvoiceState>()((set) => ({
  selectedInvoice: null,
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
  setSelectedInvoice: (invoice) => set({ selectedInvoice: invoice }),
}));

export default useInvoiceStore;
