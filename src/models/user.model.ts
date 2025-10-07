import { Document, model, Model, models, Schema } from "mongoose";
import { UserType } from "../types/general";
import { UserAddress } from "../types/auth";
import bcrypt from 'bcryptjs';

interface User extends Document {
    username: string,
    email: string,
    phone: string,
    password: string,
    role: UserType,
    addresses: UserAddress[],
    isActive: boolean,
    forgotPasswordToken?: string,
    avatarUrl?: string,
    comparePassword(enteredPassword: string): Promise<boolean>;
}

type UserModel = Model<User>;

const addressSchema = new Schema<UserAddress>({
  street: {
    type: String,
    required: true,
    maxLength: [120, "street name should be no longer than 120 characters"],
  },
  city: {
    type: String,
    required: true,
    maxLength: [50, "city name should be no longer than 50 characters"],
  },
  state: {
    type: String,
    required: true,
    maxLength: [35, "state name should be no longer than 35 characters"],
  },
  country: {
    type: String,
    required: true,
    maxLength: [120, "country name should be no longer than 120 characters"],
  },
  postalCode: {
    type: String,
    required: true,
    maxLength: [6, "postal code should be no longer than 6 characters"],
  },
});

const userSchema = new Schema<User, UserModel>({
    username: {
        type: String,
        required: [true, 'username is required'],
        trim: true,
        minLength: [3, 'Username must be at least 3 characters long'],
        maxLength: [20, 'Username must not be 20 characters long']
    },
    email: {
        type: String,
        required: [true, 'email is required'],
        trim: true,
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please enter a valid email address"],
        unique: [true, 'Email already exists']
    },
    password: {
        type: String,
        required: [true, 'password is required'],
        minlength: [5, 'Passwords must be at least 5 characters long'],
        trim: true,
        select: false
    },
    forgotPasswordToken: { // this key is only for forgot password route, to save a jwt token temporarily.
        type: String,
        required: false,
        trim: true,
        select: false
    },
    avatarUrl: {
        type: String,
        required: false
    },
    role: {
        type: String,
        enum: {
            values: ['user', 'admin'],
            message: '{VALUE} is not a valid role.'
        },
        default: "user",
    },
    addresses: [addressSchema],
    phone: {
        type: String,
        minLength: [10, 'Invalid phone number'],
        maxLength: [10, "Phone number must not be more than 10 characters long"],
        required: [true, 'Phone number is required']
    },
       isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// declaring indexes on these fields
userSchema.index({ username: 1, email: 1 });

userSchema.pre<User>('save', async function (next) {
    const salt = await bcrypt.genSalt(10); // Generate salt

    if (this.password) {
        this.password = await bcrypt.hash(this.password, salt);
        next();
    }

    if (this.addresses && this.addresses.length > 0) {
        for (const address of this.addresses) {
            const { street, city, state, country, postalCode } = address;
            if (!street || !city || !state || !country || !postalCode) {
                return next(new Error("All address fields are required when address is provided"));
            } else {
                next();
            }
        }
    }

    const validRoles = ['user', 'admin'];

    if (!validRoles.includes(this.role)) {
        return next(new Error("Invalid role"));
    } else {
        next();
    }
});

// Method to compare entered password with hashed password
userSchema.methods.comparePassword = async function (enteredPassword: string): Promise<boolean> {
    return await bcrypt.compare(enteredPassword, this.password);
};

const userModel: UserModel = models.User || model<User, UserModel>('User', userSchema);

export default userModel;