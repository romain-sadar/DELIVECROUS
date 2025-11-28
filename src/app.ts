import express from "express";
import cors from "cors";
import helmet from "helmet";
import { config } from "./config/env";
import router from "./routes";
import { errorHandler } from "./middleware/error.middleware";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.use("/api", router);
app.get("/health", (_req, res) => {
  res.json({ status: "ok", env: config.nodeEnv });
});

app.use(errorHandler);

export default app;
