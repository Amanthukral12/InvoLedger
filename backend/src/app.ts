import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import passport from "./config/passport";
import authRoutes from "./routes/auth.routes";
import clientRoutes from "./routes/client.routes";
import transporterRoutes from "./routes/transporters.routes";
import invoiceRoutes from "./routes/invoice.routes";
import PgSession from "connect-pg-simple";
import session from "express-session";
import { generateInvoicePdf } from "./utils/invoice";

dotenv.config();
const app = express();

app.use(express.json());
app.use(cookieParser());

const PgStore = PgSession(session);

app.use(
  session({
    store: new PgStore({
      conObject: {
        connectionString: process.env.DATABASE_URL,
      },
      schemaName: "public",
      tableName: "PgSession",
    }),
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use("/", authRoutes);
app.use("/client", clientRoutes);
app.use("/transporters", transporterRoutes);
app.use("/invoice", invoiceRoutes);

app.get("/generate-invoice", (req, res) => {
  const invoiceData = {
    id: "39514c3b-3695-4fc2-9d7c-24ae905f9334",
    invoiceNumber: "3",
    invoiceDate: new Date("2025-04-01T08:13:35.043Z"),
    companyId: 1,
    clientId: "d4500a08-37c4-47db-9dfa-c54a32dddcd5",
    shipToPartyId: "4db6550f-9613-467d-b5c7-887c002e46b7",
    amount: 50000,
    cartage: 800,
    subTotal: 50800,
    sgst: 3048,
    cgst: 3048,
    igst: null,
    totalAmount: 56896,
    totalAmountInWords: "Fifty Six Thousand Eight Hundred Ninety Six",
    reverseCharge: false,
    transportMode: "Rickshaw",
    vehicleNumber: "dl14sd1568",
    placeOfSupply: "07-Delhi",
    createdAt: new Date("2025-04-02T07:45:06.883Z"),
    updatedAt: new Date("2025-04-02T07:45:06.883Z"),
    invoiceItems: [
      {
        id: "f00c66fe-eb64-41ea-a7e1-0242d0b95af2",
        invoiceId: "39514c3b-3695-4fc2-9d7c-24ae905f9334",
        description: "Product A",
        quantity: 10,
        unitPrice: 200,
        hsnCode: "123456",
        amount: 2000,
      },
      {
        id: "134bfd99-118f-4cdd-a5f6-9cee5b1b2630",
        invoiceId: "39514c3b-3695-4fc2-9d7c-24ae905f9334",
        description: "Product B",
        quantity: 5,
        unitPrice: 300,
        hsnCode: "654321",
        amount: 1500,
      },
      {
        id: "4b869d1f-8f86-4f54-92f5-ba944a4fbdf8",
        invoiceId: "39514c3b-3695-4fc2-9d7c-24ae905f9334",
        description: "Product C",
        quantity: 3,
        unitPrice: 500,
        hsnCode: "789012",
        amount: 1500,
      },
    ],
    client: {
      id: "d4500a08-37c4-47db-9dfa-c54a32dddcd5",
      name: "STAR UV COATINGS",
      address:
        "B-30/3 Part of Plot No.B-30 Jhilmil Industrieal Area Shahdara Dehli-110095",
      GSTIN: " 07AEKFS1389A1Z0",
      email: "abc@gmail.com",
      phonenumber: "9911566036",
      companyId: 1,
      state: "07-Delhi",
      company: null,
    },
    shipToParty: {
      id: "4db6550f-9613-467d-b5c7-887c002e46b7",
      companyId: 1,
      name: "ABC Company",
      address: "B-30/3 Part Jhilmil Industrieal Area Shahdara Dehli-110098",
      GSTIN: " 07AEKF15489A1Z0",
      state: "07-Delhi",
      email: null,
      phonenumber: null,
      company: null,
    },
    company: {
      id: 1,
      googleId: "116206804803972801015",
      email: "thukral618@gmail.com",
      name: "DEE KAY PACKERS",
      avatar:
        "https://lh3.googleusercontent.com/a/ACg8ocJTjhOen-NvhH2r16bUmwlwzjKLzM1Lh2-IeqO7uCp-gGp2vA7Eew=s96-c",
      GST: "07AADPT4139J1ZG",
      Address: "B-19,B BLOCK,JHILMIL IND.AREA SHADHARA DELHI",
      PhoneNumber: "9811272621",
      state: "07-Delhi",
      companyOwnerSignnature: null,
      companyBankName: "Yes Bank",
      companyBankAccountNumber: "10005468245",
      companyBankIFSC: "yesbank10056",
      createdAt: new Date("2025-03-23T19:38:34.934Z"),
      updatedAt: new Date("2025-03-23T19:38:34.934Z"),
    },
  };

  generateInvoicePdf(invoiceData, res);
});

app.get("/", (req, res) => {
  res.send("API is running");
});

export default app;
