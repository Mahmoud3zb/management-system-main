import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";
import { User, Role } from "../user-model";


export const toggleStudentStatus: RequestHandler<{ id: string }> = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Invalid student ID format"
            });
            
        }

        const student = await User.findOne({ _id: id, role: Role.STUDENT });
        if (!student) {
            return res.status(StatusCodes.NOT_FOUND).json({
                message: "Student not found"
            });
            
        }


        student.isActive = !student.isActive;
        await student.save();

        res.status(StatusCodes.OK).json({
            message: `Student status updated to ${student.isActive ? "Active" : "Inactive"}`,
            data: student
        });
    } catch (err) {
        console.log("Toggle Student Status Error:", err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Internal server error"
        });
    }
};