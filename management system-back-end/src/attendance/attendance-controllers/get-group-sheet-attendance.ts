import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";
import { Attendance } from "../attendance-model";


export const getGroupSheetAttendance: RequestHandler<{ groupID: string }> = async (req, res) => {
    try {
        const { groupID } = req.params;

        if (!mongoose.Types.ObjectId.isValid(groupID)) {
            res.status(StatusCodes.BAD_REQUEST).json({
                message: "Invalid group ID format"
            });
            return;
        }
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;

        const sheets = await Attendance.find({ groupID })
            .sort({ date: -1, createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean()
            .exec();

        const total = await Attendance.countDocuments({ groupID });
            res.status(StatusCodes.OK).json({
            message: "Group attendance sheets fetched successfully",
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            data: sheets
        });
    } catch (err) {
        console.log("Get Group Sheets Error:", err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Internal server error"
        });
    }
};