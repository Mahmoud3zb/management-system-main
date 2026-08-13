import { RequestHandler } from "express";
import { body } from "express-validator";
import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";
import { Exam } from "../exam-model";


export const updateStudentMarkValidation = [
    body("studentID").isMongoId().withMessage("Invalid student ID format"),
    body("marks")
        .isNumeric().withMessage("Marks must be a valid number")
        .custom(value => value >= 0).withMessage("Marks cannot be negative"),
];

interface IRequest {
    studentID: string;
    marks: number;
}

interface IResponse {
    message: string;
    data?: any;
}

export const updateStudentMark: RequestHandler<{ id: string }, IResponse, IRequest> = async (req, res) => {
    try {
        const { id } = req.params;
        const { studentID, marks } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Invalid exam ID format"
            });
        }

        const examInfo = await Exam.findById(id).select("maxMarks").lean();
        if (!examInfo) {
            res.status(StatusCodes.NOT_FOUND).json({
                message: "Exam not found"
            });
            return;
        }

        if (marks > examInfo.maxMarks) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: `Mark (${marks}) cannot be greater than maxMarks (${examInfo.maxMarks})`
                
            });
        }

        const updatedExam = await Exam.findOneAndUpdate(
            { 
                _id: id, 
                "results.studentID": studentID 
            },
            { 
                $set: { "results.$.marks": marks } 
            },
            { 
                returnDocument: 'after',
                runValidators: true,
            }
        ).populate("results.studentID", "name");

        if (!updatedExam) {
            res.status(StatusCodes.NOT_FOUND).json({
                message: "Student not found in this exam's results"
            });
            return;
        }

        res.status(StatusCodes.OK).json({
            message: "Student mark updated successfully",
            data: updatedExam
        });
    } catch (err) {
        console.log("Update Student Mark Error:", err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Internal server error"
        });
    }
};