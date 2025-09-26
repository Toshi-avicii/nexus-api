import app from "./app";
import logger from "./utils/logger";
import config from './config';
import connectDb from "./utils/db";

const PORT = config.port;

app.listen(PORT, async () => {
  const dbConResult = await connectDb();
  if (dbConResult) {
    logger.info(`🚀 Server running on http://localhost:${PORT}`);
  } else {
    logger.error(dbConResult);
  }
});