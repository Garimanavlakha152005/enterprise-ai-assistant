import express from "express";
import cors from "cors";
import authRouter from "./routes/auth.js";
import dashboardRouter from "./routes/dashboard.js";

export const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRouter);
app.use("/api/dashboard", dashboardRouter);

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (error instanceof Error && error.name === "ZodError") {
    return res.status(400).json({ message: "Invalid request data" });
  }

  console.error(error);
  return res.status(500).json({ message: "Internal server error" });
});
