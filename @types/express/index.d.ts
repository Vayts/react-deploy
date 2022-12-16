import {User} from "../../src/interfaces/user.interface";

export {};

declare global {
  namespace Express {
    interface Request {
      user: User;
    }
  }
}
