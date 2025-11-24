import z from "zod";
import { UserType } from "./general";
import { forgotPasswordSchema, loginUserSchema, newUserSchema, updateUserByAdminSchema, updateUserSchema, userAddressSchema } from "../validations/user.schema";


export interface UpdateUserBody {
  username?: string;
  email?: string;
  isActive?: boolean;
}

export type CreateUserInput = z.infer<typeof newUserSchema>['body'];
export type LoginUserInput = z.infer<typeof loginUserSchema>['body'];
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>['body'];
export type UpdateUserInput = z.infer<typeof updateUserSchema>['body'];
export type UserAddressInput = z.infer<typeof userAddressSchema>['body'];
export type UpdateUserByAdminInput = z.infer<typeof updateUserByAdminSchema>['body'];