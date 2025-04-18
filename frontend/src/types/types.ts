export interface Company {
  id: number;
  googleId: string;
  email: string;
  name: string;
  avatar: string | null;
  GST: string | null;
  Address: string | null;
  PhoneNumber: string | null;
  state: string | null;
  companyOwnerSignnature: string | null;
  companyBankName: string | null;
  companyBankAccountNumber: string | null;
  companyBankIFSC: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Session {
  id: string;
  sessionId: string;
  companyId: number;
  refreshToken: string;
  deviceInfo: string | null;
  expiresAt: Date;
  lastUsedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  company: Company;
}

export interface CustomSession {
  id: string;
  sessionId: string;
  companyId: number;
  deviceInfo: string | null;
  expiresAt: Date;
  lastUsedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface SessionResponse {
  data: {
    currentCompany: Company;
    currentSession: CustomSession;
  };
}

export interface Client {
  id: string;
  name: string;
  address: string;
  GSTIN: string;
  email: string | null;
  phonenumber: string | null;
  companyId: number;
  state: string;
}

export interface Transporter {
  id: string;
  name: string;
  address: string;
  GSTIN: string;
  companyId: number;
  state: string;
}

export interface InvoiceItem {
  id: string;
  invoiceId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  hsnCode: string;
  amount: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  invoiceDate: Date;
  companyId: number;
  clientId: string;
  shipToPartyId: string | null;
  amount: number;
  cartage: number | null;
  subTotal: number;
  sgst: number | null;
  cgst: number | null;
  igst: number | null;
  totalAmount: number;
  totalAmountInWords: string;
  reverseCharge: boolean;
  transportMode: string;
  vehicleNumber: string;
  placeOfSupply: string;
  company: Company;
  client: Client;
  shipToParty: Transporter | null;
  invoiceItems: InvoiceItem[];
}

export interface CustomInvoiceData {
  id: string;
  invoiceDate: string;
  invoiceNumber: 1;
  client: {
    name: string;
  };
}
