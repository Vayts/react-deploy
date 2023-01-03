import {NextFunction, Request, Response} from "express";
import jwt from "jsonwebtoken";
import {User} from "../interfaces/user.interface";

export const verifyUser = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = <string>req.headers.authorization || <string>req.headers.Authorization;
  if (!authHeader?.startsWith('Bearer ')) return res.sendStatus(401);
  const token = authHeader.split(' ')[1];
  jwt.verify(token, <string>process.env.JWT_ACCESS_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).end();
    }
    else {
      req.user = <User>decoded;
      next();
    }
  });
};
