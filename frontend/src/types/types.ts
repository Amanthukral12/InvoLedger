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
