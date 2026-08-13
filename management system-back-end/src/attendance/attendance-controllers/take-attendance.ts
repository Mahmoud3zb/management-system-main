import { RequestHandler } from "express";
import { body } from "express-validator";
import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";
import { Attendance } from "../attendance-model";

export const takeAttendanceValidation = [
    body("date")
        .trim()
        .notEmpty().withMessage("Date is required"),
    body("present")
        .isArray({ min: 1 }).withMessage("Present list must contain at least one student"),
]


interface IPresent {
    studentID: mongoose.Types.ObjectId,
    isPresent: boolean
}

interface IRequest {
    date: string;
    present: IPresent[];
}

interface IResponse {
    message: string;
    data?: any;
}

export const takeAttendance: RequestHandler<{ groupID: string }, IResponse, IRequest> = async (req, res) => {
    try {
        const { groupID } = req.params;
        if (!mongoose.Types.ObjectId.isValid(groupID)) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Invalid group ID"
            });
        }
        const { date, present } = req.body;
        const hasInvalidStudentId = present.some(item =>
            !mongoose.Types.ObjectId.isValid(item.studentID));
        if (hasInvalidStudentId) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "One or more student IDs in the list are invalid"
            });

        }
        const attendance = await Attendance.findOneAndUpdate(
            { groupID, date },
            {
                $set: {
                    groupID,
                    date,
                    present
                }
            },
            {
                returnDocument: 'after',
                upsert: true, 
                runValidators: true
            }
        ).populate("present.studentID", "name phone");
        res.status(StatusCodes.CREATED).json({
            message: "Attendance taken successfully",
            data: attendance
        });
    } catch (err) {
        console.log("Take Attendance Error:", err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Internal server error"
        });
    }
}