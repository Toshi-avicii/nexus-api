import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import appRoutes from "./routes";
import logger from "./utils/logger";
import { errorMiddleware } from "./middlewares/error.middleware";
import cookieParser from "cookie-parser";
import { limiter } from "./middlewares/rateLimit.middleware";
import { speedLimiter } from "./middlewares/slowDown.middleware";
import swaggerUi from 'swagger-ui-express';
import swaggerSpecification from "./swagger";
import path from "path";
const app = express();
app.set('trust proxy', 1);

// Define a custom format for Morgan to log using Winston
const stream = {
    write: (message: string) => logger.info(message.trim()),
};

// Middleware
app.use(express.json()); // enable json
app.use(cookieParser());
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:5050'],
    credentials: true
})); // Cross-Origin Resource Sharing
// app.use((req, res, next) => {
//   res.header('Access-Control-Allow-Credentials', 'true');
//   next();
// });

app.use(helmet()); // Security headers
app.use(compression()); // Gzip compression
app.use(morgan("combined", { stream })); // Logging
app.use(speedLimiter); // Speed limiting
app.use(limiter); // Rate limiting
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Routes
app.use('/api/v1', appRoutes);
app.use('/api/v1/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecification));

// use error middleware
app.use(errorMiddleware);

export default app;
