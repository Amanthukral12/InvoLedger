import { create } from "zustand";
import { Invoice } from "../types/types";

interface InvoiceState {
  selectedInvoice: Invoice | null;
  setSelectedInvoice: (invoice: Invoice) => void;
}

const useInvoiceStore = create<InvoiceState>()((set) => ({
  selectedInvoice: null,
  setSelectedInvoice: (invoice) => set({ selectedInvoice: invoice }),
}));

export default useInvoiceStore;
