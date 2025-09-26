import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";

const app = express();
app.set('trust proxy', 1);

// Middleware
app.use(express.json()); // enable json
app.use(cors({
    origin: ['http://localhost:3000'],
    credentials: true
})); // Cross-Origin Resource Sharing
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
});

app.use(helmet()); // Security headers
app.use(compression()); // Gzip compression

export default app;
