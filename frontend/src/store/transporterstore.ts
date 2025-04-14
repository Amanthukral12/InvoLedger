import { create } from "zustand";
import { Transporter } from "../types/types";

interface TransporterState {
  selectedTransporter: Transporter | null;
  setSelectedTransporter: (transporter: Transporter) => void;
}

const useTransporterStore = create<TransporterState>()((set) => ({
  selectedTransporter: null,
  setSelectedTransporter: (transporter) =>
    set({ selectedTransporter: transporter }),
}));

export default useTransporterStore;
