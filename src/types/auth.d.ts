import { UserType } from "./general"

export type CreateUserBody = {
    username: string,
    email: string,
    phone: string,
    password: string,
    role: UserType,
    address?: UserAddress,
    isActive: boolean
}

export type UserAddress = {
    street: string,
    city: string,
    state: string,
    country: string,
    postalCode: string,
}