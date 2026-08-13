import { RequestHandler } from "express";
import { jwtService } from "../services/jwt-service";
import { COOKIE_OPTIONS } from "./login";

export const refreshToken: RequestHandler = async (req, res) => {
    try {
        const { refreshToken } = req.cookies;

        if (!refreshToken) {
            return res.status(401).json({
                message: "Refresh token is required",
            });
        }

        const decoded = jwtService.verifyToken<{
            id: string;
            role: string;
        }>(refreshToken);

        if (!decoded) {
            return res.status(401).json({
                message: "Invalid or expired refresh token",
            });
        }

        const newToken = jwtService.createToken(
            {
                id: decoded.id,
                role: decoded.role,
            },
            {
                expiresIn: "2h",
            }
        );

        res.cookie("token", newToken, {
            ...COOKIE_OPTIONS,
            maxAge: 2 * 60 * 60 * 1000,
        });

        return res.status(200).json({
            message: "Token refreshed successfully",
        });
    } catch (error) {
        return res.status(401).json({
            message: "Invalid or expired refresh token",
        });
    }
};