import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import passport from "./config/passport";
import authRoutes from "./routes/auth.routes";
import clientRoutes from "./routes/client.routes";
import PgSession from "connect-pg-simple";
import session from "express-session";
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

app.get("/", (req, res) => {
  res.send("API is running");
});

export default app;
