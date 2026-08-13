import jwt from "jsonwebtoken";
import { RequestHandler } from "express";
import { UserToken } from "../interfaces/user-token";

export const isAuthenticated: RequestHandler = (req, res, next) => {
    const { token } = req.cookies;

    if (!token) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }

    try {
        req.user = <UserToken>jwt.verify(token, process.env.SECRET_KEY!);
        next();
    } catch (error) {
        res.status(401).json({ message: "Unauthorized, please login" });
    }
};