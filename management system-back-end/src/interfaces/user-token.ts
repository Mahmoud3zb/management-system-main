import { Role } from "../user/user-model";
export interface UserToken {
  id: string;
  email: string;
  role: Role; 
}
