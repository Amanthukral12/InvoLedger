export interface CompanyDocument {
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

export interface SessionDocument {
  id: string;
  sessionId: string;
  companyId: number;
  refreshToken: string;
  deviceInfo: string | null;
  expiresAt: Date;
  lastUsedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  company: CompanyDocument;
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

export interface ClientDocument {
  id: string;
  name: string;
  address: string;
  GSTIN: string;
  email: string | null;
  phonenumber: string | null;
  companyId: number;
  state: string;
  company: CompanyDocument | null;
}

export interface ShipToPartyDocument {
  id: string;
  name: string;
  address: string;
  GSTIN: string;
  email: string | null;
  phonenumber: string | null;
  companyId: number;
  state: string;
  company: CompanyDocument | null;
}

export interface InvoiceDocument {
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
  company: CompanyDocument;
  client: ClientDocument;
  shipToParty: ShipToPartyDocument;
  invoiceItems: InvoiceItem[];
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

export interface GoogleStrategyOptions {
  clientID: string;
  clientSecret: string;
  callbackURL: string;
}

export interface GoogleStrategyOptionsWithRequest
  extends GoogleStrategyOptions {
  passReqToCallback: true;
}

export interface VerifyCallbackDocument {
  company?: CompanyDocument;
  sessionId: string;
}

export type VerifyCallback = (
  error: any,
  company?: VerifyCallbackDocument,
  info?: any
) => void;

export interface RefreshTokenPayload {
  sessionId: string;
}

export interface AccessTokenPayload {
  companyId: number;
  sessionId: string;
}
