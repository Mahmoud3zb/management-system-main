import { UserToken } from "./src/interfaces/user-token";

declare global {
  namespace Express {
    interface User extends UserToken {}
    interface Request {
      user?: User;
    }
  }
}


export {};
