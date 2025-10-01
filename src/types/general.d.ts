export type UserType = "admin" | "user";
export type CustomJWTPayload = {
    email: string;
    userId: string;
    role: UserType;
}