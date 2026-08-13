import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";
import { User, Role } from "../user-model";
import { body } from "express-validator";

export const updateStudentValidator = [
    body("name")
        .optional()
        .isString().withMessage("Name must be a string")
        .trim()
        .isLength({ min: 3, max: 50 }).withMessage("Name must be between 3 and 50 characters"),

    body("phone")
        .optional({ checkFalsy: true })
        .isMobilePhone("ar-EG").withMessage("Invalid Egyptian phone number format"),

    body("parentPhone")
        .optional({ checkFalsy: true })
        .isMobilePhone("ar-EG").withMessage("Invalid parent phone number format")
        .custom((val, { req }) => {
            if (val && req.body.phone && val === req.body.phone) {
                throw new Error("Parent phone cannot be the same as student phone");
            }
            return true;
        }),

    body("group")
        .optional()
        .isMongoId().withMessage("Invalid Group ID format"),

    body("level")
        .optional()
        .isNumeric().withMessage("Level must be a number"),

];


interface IRequest {
    name?: string;
    phone?: string;
    parentPhone?: string;
    group?: string;
}

interface IResponse {
    message: string;
    data?: any;
}

export const updateStudent: RequestHandler<{ id: string }, IResponse, IRequest> = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Invalid student ID format"
            });

        }
        const { name, phone, parentPhone, group } = req.body;
        const updateData: any = {};
        if (name) {
            updateData.name = name;
        }
        if (phone) {
            updateData.phone = phone;
        }
        if (parentPhone) {
            updateData.parentPhone = parentPhone;
        }
        if (group) {
            updateData.group = group;
        }
        if (Object.keys(updateData).length === 0) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Please provide at least one field to update"
            });
        }

        const updatedStudent = await User.findOneAndUpdate(
            { _id: id, role: Role.STUDENT },
            { $set: updateData },
            { returnDocument: 'after', runValidators: true }
        ).populate("group", "name");

        if (!updatedStudent) {
            return res.status(StatusCodes.NOT_FOUND).json({
                message: "Student not found"
            });

        }
        res.status(StatusCodes.OK).json({
            message: "Student updated successfully",
            data: updatedStudent
        });
    } catch (err: any) {
        if (err.code === 11000) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Phone number already in use by another student"
            });

        }
        console.log("Update Student Error:", err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Internal server error"
        });
    }
};