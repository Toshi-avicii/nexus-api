import { NextFunction, Request, Response } from "express";
import AuthService from "../services/auth.service";
import logger from "../utils/logger";
import { AuthenticationError, TokenExpiredError } from "../utils/errors";
import { LoginBody } from "../types/auth";
import jwt, { JwtPayload, VerifyErrors } from 'jsonwebtoken';
import config from '../config';
import refreshTokenModel from "../models/refreshToken.model";
import { CreateUserInput, ForgotPasswordInput, LoginUserInput } from "../types/user";

interface UserPayload extends JwtPayload {
  userId: string
}

export const signUp = async (
  req: Request<{}, {}, CreateUserInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { username, email, phone, password, role } = req.body;
    const data = await AuthService.createUser({
      username,
      email,
      phone,
      password,
      role,
      isActive: true // or set to false as per your business logic
    });
    const accessToken = jwt.sign({ userId: data?.data.user._id, role: data?.data.user.role }, config.accessTokenSecret, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ userId: data?.data.user._id, role: data?.data.user.role }, config.refreshTokenSecret, { expiresIn: '7d' });

    const newRefreshToken = await refreshTokenModel.create({
      userId: data?.data.user._id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    if (newRefreshToken) {
      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: false, // true in production with HTTPS
        sameSite: "lax",
      });

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
      });
    }

    logger.info("User created successfully");
    res.status(200).json(data);
  } catch (err) {
    console.log({ err });
    if (err instanceof Error) {
      logger.error("Error occurred", { message: err.message });
      // res.status(400).json({ message: error.message });
      next(err);
    } else if (err instanceof AuthenticationError) {
      next(err);
    }
  }
};

export const login = async (
  req: Request<{}, {}, LoginUserInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body as LoginBody;
    const data = await AuthService.login({ email, password });
    const accessToken = jwt.sign({ userId: data?.data.user._id, role: data?.data.user.role }, config.accessTokenSecret, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ userId: data?.data.user._id, role: data?.data.user.role }, config.refreshTokenSecret, { expiresIn: '7d' });

    const newRefreshToken = await refreshTokenModel.create({
      userId: data?.data.user._id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    if (newRefreshToken) {
      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: false, // true in production with HTTPS
        sameSite: "lax",
      });

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
      });
    }
    logger.info("User logged in successfully");
    res.status(200).json(data);
  } catch (err) {
    logger.error("Error occurred in login", { error: err });
    next(err);
  }
};

export const forgotPassword = async (req: Request<{}, {}, ForgotPasswordInput>, res: Response, next: NextFunction) => {
  try {
    const result = await AuthService.resetLink(req.body);
    logger.info("forgot password API hit successfully");
    res.status(200).json(result);
  } catch (err) {
    if (err instanceof Error) {
      logger.error("Error occurred", { message: err.message });
      // res.status(400).json({ message: err.message });
      next(err);
    }
  }
}

export const getRefreshToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.status(401).json({ success: false, message: 'Token not present' });

    const existingToken = refreshTokenModel.findOne({ token: refreshToken });
    if (!existingToken) return res.status(401).json({ success: false, message: "Invalid token" });

    jwt.verify(refreshToken, config.refreshTokenSecret, async (err: VerifyErrors | null, decoded: string | JwtPayload | undefined) => {
      if (err || !decoded) {
        return res.status(403)
      }

      // Ensure decoded is our expected payload
      const user = decoded as UserPayload;

      const newAccessToken = jwt.sign({ userId: user.userId }, config.accessTokenSecret, {
        expiresIn: "15m",
      });
      const newRefreshToken = jwt.sign({ userId: user.userId }, config.refreshTokenSecret, {
        expiresIn: '7d'
      });

      await refreshTokenModel.deleteOne({ token: refreshToken });
      await refreshTokenModel.create({
        userId: user.userId,
        token: newRefreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      });

      res.cookie("accessToken", newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      });

      res.cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.json({ success: true, message: "Tokens refreshed successfully" });
    });
  } catch (err: any) {
    if (err.name === "TokenExpiredError") {
      res.clearCookie("accessToken");
      res.clearCookie("refreshToken");
      return next(new TokenExpiredError("Refresh token expired. Please log in again."));
    }

    if (err instanceof Error) {
      logger.error("Error occurred", { message: err.message });
      // res.status(400).json({ message: err.message });
      next(err);
    }

    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    return next(new AuthenticationError("Invalid refresh token"));
  }
}

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (refreshToken) {
      await refreshTokenModel.deleteOne({ token: refreshToken });
    } else {
      throw new AuthenticationError("Token not present");
    }
    
    logger.info("User logout successfully");
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
  
    res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch(err) {
    logger.error("Error occurred in logout", { error: err });
    next(err);
  }
};
