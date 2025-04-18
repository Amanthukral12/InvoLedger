import { create } from "zustand";
import { Invoice } from "../types/types";

interface InvoiceState {
  selectedMonth: number;
  selectedYear: number;
  currentPage: number;
  pageSize: number;
  selectedInvoice: Invoice | null;
  setMonth: (month: number) => void;
  setYear: (year: number) => void;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  setSelectedInvoice: (invoice: Invoice) => void;
}

const useInvoiceStore = create<InvoiceState>()((set) => ({
  selectedInvoice: null,
  selectedMonth: new Date().getMonth() + 1,
  selectedYear: new Date().getFullYear(),
  currentPage: 1,
  pageSize: 10,
  setMonth: (month) => set({ selectedMonth: month, currentPage: 1 }),
  setYear: (year) => set({ selectedYear: year, currentPage: 1 }),
  setPage: (page) => set({ currentPage: page }),
  setPageSize: (size) => set({ pageSize: size }),
  setSelectedInvoice: (invoice) => set({ selectedInvoice: invoice }),
}));

export default useInvoiceStore;
