import { RequestHandler } from "express";
import { body } from "express-validator";
import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";
import { Exam } from "../exam-model";
import { User, Role } from "../../user/user-model";


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

        if (!mongoose.Types.ObjectId.isValid(studentID)) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Invalid student ID format"
            });
        }

        const examInfo = await Exam.findById(id).select("maxMarks groupID isDeleted").lean();
        if (!examInfo || examInfo.isDeleted) {
            return res.status(StatusCodes.NOT_FOUND).json({
                message: "Exam not found"
            });
        }

        if (marks > examInfo.maxMarks) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: `Mark (${marks}) cannot be greater than maxMarks (${examInfo.maxMarks})`
            });
        }

        // 1. Attempt to update existing student mark in results array
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

        if (updatedExam) {
            return res.status(StatusCodes.OK).json({
                message: "Student mark updated successfully",
                data: updatedExam
            });
        }

        // 2. Student was not in results array (Late Joiner).
        // Verify student existence, group membership, and role before adding.
        const student = await User.findById(studentID).select("group role isActive name").lean();
        if (!student) {
            return res.status(StatusCodes.NOT_FOUND).json({
                message: "Student not found"
            });
        }

        if (!student.group || student.group.toString() !== examInfo.groupID.toString()) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Student does not belong to the group associated with this exam"
            });
        }

        if (student.role !== Role.STUDENT) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "User is not a student"
            });
        }

        // Atomically append new result, preventing duplicates under concurrent requests
        let finalExam = await Exam.findOneAndUpdate(
            {
                _id: id,
                "results.studentID": { $ne: studentID }
            },
            {
                $push: {
                    results: {
                        studentID,
                        marks
                    }
                }
            },
            {
                returnDocument: 'after',
                runValidators: true
            }
        ).populate("results.studentID", "name");

        // Concurrency guard: if another request added this student concurrently, update the mark
        if (!finalExam) {
            finalExam = await Exam.findOneAndUpdate(
                {
                    _id: id,
                    "results.studentID": studentID
                },
                {
                    $set: { "results.$.marks": marks }
                },
                {
                    returnDocument: 'after',
                    runValidators: true
                }
            ).populate("results.studentID", "name");
        }

        if (!finalExam) {
            return res.status(StatusCodes.NOT_FOUND).json({
                message: "Exam not found or student could not be added"
            });
        }

        return res.status(StatusCodes.OK).json({
            message: "Student mark updated successfully",
            data: finalExam
        });
    } catch (err) {
        console.log("Update Student Mark Error:", err);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Internal server error"
        });
    }
};