import dotenv from "dotenv";
dotenv.config();

export default {
  port: process.env.PORT || 5000,
  env: process.env.NODE_ENV || "development",
  dbUrl: process.env.DATABASE_URL || "",
  refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET || "",
  accessTokenSecret: process.env.ACCESS_TOKEN_SECRET || "",
  mailAppPassword: process.env.MAIL_APP_PASSWORD || "",
  senderMailId: process.env.MAIL_ID || "",
  frontendUrl: process.env.FRONTEND_URL,
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },
};
