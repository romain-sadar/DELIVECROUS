import express from "express";
import cors from "cors";
import helmet from "helmet";
import { config } from "./config/env";
import router from "./routes";
import { errorHandler } from "./middleware/error.middleware";
import path from 'node:path';
import fs from 'node:fs';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yaml';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.use("/api", router);
app.get("/health", (_req, res) => {
  res.json({ status: "ok", env: config.nodeEnv });
});

const openapiPath = path.join(__dirname, '..', 'openapi.yaml');
let openapiDocument: any;

try {
  const fileContents = fs.readFileSync(openapiPath, 'utf8');
  openapiDocument = YAML.parse(fileContents);
} catch (err) {
  console.error('Impossible de charger openapi.yaml', err);
  openapiDocument = {
    openapi: '3.1.0',
    info: {
      title: 'DeliveCROUS API',
      version: '1.0.0',
      description: 'Documentation indisponible (openapi.yaml non trouvé ou invalide).',
    },
  };
}

app.get('/api/openapi.json', (_req, res) => {
  res.json(openapiDocument);
});

app.use(
  '/api/docs',
  swaggerUi.serve,
  swaggerUi.setup(openapiDocument, {
    explorer: true,
  }),
);

app.use(errorHandler);

export default app;
