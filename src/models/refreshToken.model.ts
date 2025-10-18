// models/RefreshToken.ts
import { Schema, Document, Model, models, model } from "mongoose";

export interface IRefreshToken extends Document {
  userId: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

type RefreshTokenModel = Model<IRefreshToken>;

const refreshTokenSchema = new Schema<IRefreshToken>({
  userId: { type: String, required: true },
  token: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
});

const refreshTokenModel: RefreshTokenModel = models.RefreshToken || model<IRefreshToken, RefreshTokenModel>('RefreshToken', refreshTokenSchema);

export default refreshTokenModel;
