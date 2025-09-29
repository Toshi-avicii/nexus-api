import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import appRoutes from "./routes";
import logger from "./utils/logger";
import { errorMiddleware } from "./middlewares/error.middleware";

const app = express();
app.set('trust proxy', 1);

// Define a custom format for Morgan to log using Winston
const stream = {
    write: (message: string) => logger.info(message.trim()),
};


// Middleware
app.use(express.json()); // enable json
app.use(cors({
    origin: ['*'],
    credentials: true
})); // Cross-Origin Resource Sharing
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
});

app.use(helmet()); // Security headers
app.use(compression()); // Gzip compression
app.use(morgan("combined", { stream })); // Logging

// Routes
app.use('/api/v1', appRoutes);

// use error middleware
app.use(errorMiddleware);

export default app;
