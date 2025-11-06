import slowDown from "express-slow-down";

export const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000,
  delayAfter: 10,
  delayMs: () => 500,
  maxDelayMs: 10000
});