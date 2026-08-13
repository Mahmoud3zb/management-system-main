import { RequestHandler } from "express";
import { User } from "../user-model";
import { StatusCodes } from "http-status-codes";
import { body } from "express-validator";
import mongoose from "mongoose";


export const addStudentValidation = [
    body("name")
        .notEmpty().withMessage("Student name is required")
        .isString().withMessage("Name must be a string")
        .trim()
        .isLength({ min: 3, max: 50 }).withMessage("Name must be between 3 and 50 characters"),

    body("phone")
        .optional()
        .isMobilePhone("ar-EG").withMessage("Invalid Egyptian phone number format"),

    body("parentPhone")
        .optional()
        .isMobilePhone("ar-EG").withMessage("Invalid parent phone number format")
        .custom((val, { req }) => {
            if (val === req.body.phone) {
                throw new Error("Parent phone cannot be the same as student phone");
            }
            return true;
        }),
];

interface IRequest {
    name: string;
    phone?: string;
    parentPhone?: string;
    // level: Level
}
interface IResponse {
    message: string,
    field?: string
    value?: string
    data?: any
}


export const addStudent: RequestHandler<{ groupID: string }, IResponse, IRequest> = async (req, res) => {
    try {

        const groupID = req.params.groupID;
        if (!mongoose.Types.ObjectId.isValid(groupID)) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Invalid group ID"
            });
        }
        const { name, phone, parentPhone } = req.body;
        const studentData: any = {
            name,
            group: groupID,
        };
        if (phone && phone.trim()) {
            studentData.phone = phone.trim();
        }
        if (parentPhone && parentPhone.trim()) {
            studentData.parentPhone = parentPhone.trim();
        }
        const student = await User.create(studentData);
        res.status(StatusCodes.CREATED).json({
            message: "Student added successfully",
            data: student
        });
    } catch (err) {
        if ((err as any).code === 11000) {
            console.log((err as any).keyPattern);
            console.log((err as any).keyValue);

            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Duplicate value",
                field: (err as any).keyPattern,
                value: (err as any).keyValue
            });
        }
        console.error("Add Student Error:", err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Internal server error"
        });
    }
}