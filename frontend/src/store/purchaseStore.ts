import { create } from "zustand";
import { Purchase } from "../types/types";

interface PurchaseState {
  selectedPurchase: Purchase | null;

  setSelectedPurchase: (purchase: Purchase) => void;
}

const usePurchaseStore = create<PurchaseState>()((set) => ({
  selectedPurchase: null,
  setSelectedPurchase: (purchase) => set({ selectedPurchase: purchase }),
}));

export default usePurchaseStore;
