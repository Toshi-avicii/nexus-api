import mongoose, { connection } from "mongoose";
import connectDb from "../../utils/db";

jest.mock('mongoose');

const mockedMongooseConnect = mongoose.connect as jest.MockedFunction<typeof mongoose.connect>;

describe('Database connection', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return success message when connected to db', async () => {
        mockedMongooseConnect.mockResolvedValueOnce({ connection: {} } as any);
        const result = await connectDb();
        expect(result).toBe('connection successfull to db')
    });

    it("should throw DatabaseError when connection fails", async () => {
        mockedMongooseConnect.mockRejectedValueOnce(new Error("failed to connect"));
        await expect(connectDb()).rejects.toThrow("failed to connect");
    });
});