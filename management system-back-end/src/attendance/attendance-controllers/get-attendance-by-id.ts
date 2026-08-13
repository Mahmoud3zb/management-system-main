import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";
import { Attendance } from "../attendance-model";



export const getAttendanceById: RequestHandler<{ id: string }> = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            res.status(StatusCodes.BAD_REQUEST).json({
                message: "Invalid attendance sheet ID format"
            });
            return;
        }

        const sheet = await Attendance.findById(id)
            .populate("present.studentID", "name phone") 
            .lean()
            .exec();

        if (!sheet) {
            res.status(StatusCodes.NOT_FOUND).json({
                message: "Attendance sheet not found"
            });
            return;
        }

        res.status(StatusCodes.OK).json({
            message: "Attendance sheet fetched successfully",
            data: sheet
        });
    } catch (err) {
        console.log("Get Attendance By ID Error:", err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Internal server error"
        });
    }
};