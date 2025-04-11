import { create } from "zustand";
import { Client } from "../types/types";

interface ClientState {
  selectedClient: Client | null;
  setSelectedClient: (client: Client) => void;
}

const useClientStore = create<ClientState>()((set) => ({
  selectedClient: null,
  setSelectedClient: (client) => set({ selectedClient: client }),
}));

export default useClientStore;
