import { UserType } from "./general";


export interface UpdateUserBody {
  username?: string;
  email?: string;
  isActive?: boolean;
}
