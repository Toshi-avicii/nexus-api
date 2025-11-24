import UserService from "../../services/user.service";
import userModel from "../../models/user.model";

jest.mock("../../models/user.model", () => ({
    findOne: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findById: jest.fn(),
    findOneAndUpdate: jest.fn()
}));

jest.mock("../../utils/logger", () => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
}));

describe("UserService.updateUser", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should update the user successfully", async () => {
        (userModel.findOne as jest.Mock).mockResolvedValue(null);

        (userModel.findByIdAndUpdate as jest.Mock).mockResolvedValue({
            username: "john",
            email: "john@gmail.com",
            phone: "1234567890",
            role: "user",
            isActive: true,
        });

        const body = {
            username: " john ",
            email: "john@gmail.com",
            isActive: true,
        };

        const response = await UserService.updateUser("123", body);

        expect(userModel.findOne).toHaveBeenCalledWith({
            email: "john@gmail.com",
            _id: { $ne: "123" },
        });

        expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(
            "123",
            {
                $set: {
                    username: "john",
                    email: "john@gmail.com",
                    isActive: true,
                },
            },
            { new: true, runValidators: true }
        );

        expect(response.data.email).toBe("john@gmail.com");
    });

    it("should throw error if email already exists", async () => {
        (userModel.findOne as jest.Mock).mockResolvedValue({ email: "taken@example.com" });

        const body = {
            username: "abc",
            email: "taken@example.com",
            isActive: true,
        };

        await expect(
            UserService.updateUser("123", body)
        ).rejects.toThrow("Email already in use by another user");
    });

    it("should throw if user not found during update", async () => {
        (userModel.findOne as jest.Mock).mockResolvedValue(null);

        (userModel.findByIdAndUpdate as jest.Mock).mockResolvedValue(null);

        const body = {
            username: "abc",
            email: "abc@example.com",
            isActive: true,
        };

        await expect(
            UserService.updateUser("123", body)
        ).rejects.toThrow("User not found or inactive");
    });
});

describe("UserService.updateAddress", () => {
    beforeEach(() => jest.clearAllMocks());

    it("should update the user address successfully", async () => {
        (userModel.findById as jest.Mock).mockResolvedValue({
            _id: "123",
            username: "Tushar",
            email: "tushar@gmail.com",
            phone: "0001112223",
            role: "user",
            addresses: [{
                _id: "x123",
                street: "old 123, xyz, street no. 1",
                city: "Delhi",
                state: "Delhi",
                country: "India",
                postalCode: "10032"
            }],
        });

        (userModel.findOneAndUpdate as jest.Mock).mockResolvedValue({
            _id: "123",
            username: "Tushar",
            email: "tushar@gmail.com",
            phone: "0001112223",
            role: "user",
            addresses: [{
                _id: "x123",
                street: "123, xyz, street no. 1",
                city: "Delhi",
                state: "Delhi",
                country: "India",
                postalCode: "10032"
            }],
        });

        const body = {
            street: "123, xyz, street no. 1",
            city: "Delhi",
            state: "Delhi",
            country: "India",
            postalCode: "110032"
        }

        const response = await UserService.updateUserAddress("123", "x123", body);

        expect(userModel.findById).toHaveBeenCalledWith("123");
        expect(userModel.findOneAndUpdate).toHaveBeenCalledWith(
            { _id: "123", "addresses._id": "x123" },
            {
                $set: {
                    "addresses.$.street": body.street,
                    "addresses.$.city": body.city,
                    "addresses.$.state": body.state,
                    "addresses.$.country": body.country,
                    "addresses.$.postalCode": body.postalCode,
                },
            },
            { new: true, runValidators: true }
        );
        expect(response.data.addresses[0].street).toBe("123, xyz, street no. 1");
    });

    it("should throw NotFoundError when user not found", async () => {
        (userModel.findById as jest.Mock).mockResolvedValue(null);

        const body = {
            street: "123, xyz, street no. 1",
            city: "Delhi",
            state: "Delhi",
            country: "India",
            postalCode: "110032"
        }

        await expect(
            UserService.updateUserAddress("123", "x123", body)
        ).rejects.toThrow("User not found or inactive");

        expect(userModel.findById).toHaveBeenCalledWith("123");
        expect(userModel.findByIdAndUpdate).not.toHaveBeenCalled()
    });

    it("should throw Address not found when address does not get updated", async () => {
        (userModel.findById as jest.Mock).mockResolvedValue({
            _id: "123",
            username: "Tushar",
            email: "tushar@gmail.com",
            phone: "0001112223",
            role: "user",
            addresses: [{
                _id: "x123",
                street: "old 123, xyz, street no. 1",
                city: "Delhi",
                state: "Delhi",
                country: "India",
                postalCode: "10032"
            }],
        });

        (userModel.findOneAndUpdate as jest.Mock).mockResolvedValue(null);

        const body = {
            street: "123, xyz, street no. 1",
            city: "Delhi",
            state: "Delhi",
            country: "India",
            postalCode: "110032"
        }

        await expect(
            UserService.updateUserAddress("123", "x123", body)
        ).rejects.toThrow("Address not found");

        expect(userModel.findOneAndUpdate).toHaveBeenCalledWith(
            { _id: "123", "addresses._id": "x123" },
            {
                $set: {
                    "addresses.$.street": body.street,
                    "addresses.$.city": body.city,
                    "addresses.$.state": body.state,
                    "addresses.$.country": body.country,
                    "addresses.$.postalCode": body.postalCode,
                },
            },
            { new: true, runValidators: true }
        )
    });
})
