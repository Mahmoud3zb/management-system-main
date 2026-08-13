import { RequestHandler } from "express";
import { Role, User } from "../user-model";
import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";




export const getStudentByID: RequestHandler<{ id: string }> = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Invalid student ID"
            });
        }
        const student = await User.findOne({
            _id: id,
            role: Role.STUDENT,
            isActive: true 
        }).populate("group");
        if (!student) {
            res.status(StatusCodes.NOT_FOUND).json({
                message: "Student not found"
            });
            return;
        }
        res.status(StatusCodes.OK).json({
            message: "Student fetched successfully",
            data: student
        });
    } catch (err) {
        console.log(err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Internal server error"
        });
    }
};