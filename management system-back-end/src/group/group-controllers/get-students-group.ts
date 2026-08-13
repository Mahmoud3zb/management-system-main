import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";
import { Role, User } from "../../user/user-model";

interface IResponse {
    message: string;
    data?: any;
}


export const getGroupStudents: RequestHandler<{ id: string }, IResponse> = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Invalid group ID format"
            });
            
        }

        
        const students = await User.find({
            group: id,
            role: Role.STUDENT,
            isActive: true
        })
        .select("name phone parentPhone")
        .sort({ name: 1 })
        .lean()
        .exec();

        res.status(StatusCodes.OK).json({
            message: "Group students fetched successfully",
            data: students
        });
    } catch (err) {
        console.log("Get Group Students Error:", err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Internal server error"
        });
    }
};