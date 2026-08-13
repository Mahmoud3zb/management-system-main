import { RequestHandler } from "express";
import { Role, User } from "../user-model";
import { StatusCodes } from "http-status-codes";
import { body } from "express-validator";
import bcrypt from "bcrypt";

export const addTeacherValidation = [
    body("name")
        .trim()
        .notEmpty().withMessage("Name is required"),
    body("password")
        .trim()
        .notEmpty().withMessage("Password is required"),
    body("role")
        .trim()
        .notEmpty().withMessage("Role is required")
]

interface IRequest {
    name: string,
    email: string,
    password: string,
    role: Role,
    phone: string
}

interface IResponse {
    message: string,
    data?: any
}

export const addTeacher: RequestHandler<{}, IResponse, IRequest> = async (req, res) => {
    try {
        const { name, password, role, phone ,email } = req.body;
        const hashed = await bcrypt.hash(password, 10);
        const teacher = await User.create({ name,email,password: hashed, role, phone });
        res.status(StatusCodes.CREATED).json({
            message: "Teacher added successfully",
            data: teacher
        });
    } catch (err) {
        console.log(err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Internal server error" });
    }
}