import userModel from "../../models/user.model";
import AuthService from "../../services/auth.service";
import { CreateUserBody, LoginBody } from "../../types/auth";

jest.mock('../../models/user.model', () => ({
    create: jest.fn(),
    findOne: jest.fn(),
    findOneAndUpdate: jest.fn(),
    select: jest.fn(),
    comparePassword: jest.fn()
}));

describe("create user tests", () => {
    beforeEach(() => jest.clearAllMocks());
    const newUserData = {
        username: "tushar",
        email: "testing@gmail.com",
        phone: "0011223344",
        role: "user",
        _id: "123",
    }

    const body: CreateUserBody = {
        username: "tushar",
        email: "testing@gmail.com",
        phone: "0011223344",
        password: "Testing@123",
        role: "user",
        isActive: true
    }

    it("should create a new user", async () => {
        // arrange
        (userModel.create as jest.Mock).mockResolvedValue(newUserData);
        // act

        const response = await AuthService.createUser(body);
        // assert
        expect(userModel.create).toHaveBeenCalledWith(body);
        expect(response?.data.user._id).toBe("123")
    });

    it("should give undefined if body is not passed", async () => {
        (userModel.create as jest.Mock).mockResolvedValue(null);
        const response = await AuthService.createUser(null as any);
        expect(response).toBe(undefined);
    });
});

describe("login user tests", () => {
    beforeEach(() => jest.clearAllMocks());

    it("should throw error if email is not present", async() => {
        (userModel.findOne as jest.Mock).mockResolvedValue(null);
        const body = {
            password: "Testing@123"
        }

        await expect(
            AuthService.login(body as LoginBody)
        ).rejects.toThrow("Email and password are required")
    });

    it("should throw error if password is not present", async() => {
        (userModel.findOne as jest.Mock).mockResolvedValue(null);
        const body = {
            email: "testing@gmail.com"
        }

        await expect(
            AuthService.login(body as LoginBody)
        ).rejects.toThrow("Email and password are required")
    });
});