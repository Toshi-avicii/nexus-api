import mongoose from "mongoose";
import connectDb from "../../../src/utils/db";
import { jest, describe, beforeEach, it, expect } from '@jest/globals';

jest.mock("mongoose");

const mockedMongooseConnect = mongoose.connect as jest.MockedFunction<typeof mongoose.connect>;

describe("connectDb", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return success message when connection is successful", async () => {
    mockedMongooseConnect.mockResolvedValueOnce({ connection: {} } as any);
    const result = await connectDb();
    expect(result).toBe("connection successfull to db");
  });

  it("should throw DatabaseError when connection fails", async () => {
    mockedMongooseConnect.mockRejectedValueOnce(new Error("failed to connect"));
    await expect(connectDb()).rejects.toThrow("failed to connect");
  });
});
