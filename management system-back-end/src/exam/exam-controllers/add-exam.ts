import { RequestHandler } from "express";
import { Exam, IResult } from "../exam-model";
import { body } from "express-validator";
import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";

export const addExamValidation = [
    body("title")
        .trim()
        .notEmpty().withMessage("Title is required"),
    body("date")
        .trim()
        .notEmpty().withMessage("Date is required"),
    body("maxMarks")
        .isNumeric().withMessage("Max marks must be a valid number"),
    body("results")
        .isArray({ min: 1 }).withMessage("Results must contain at least one student"),
];

interface IRequest {
    title: string
    date: string
    maxMarks: number
    results: IResult[]
}

interface IRessponse {
    message: string
    data?: any
}


export const addExam: RequestHandler<{ groupID: string }, IRessponse, IRequest> = async (req, res) => {
    try {
        const groupID = req.params.groupID;
        if (!mongoose.Types.ObjectId.isValid(groupID)) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Invalid group ID"
            });
        }
        const { title, date, maxMarks, results } = req.body;

        for (const item of results) {
            if (!mongoose.Types.ObjectId.isValid(item.studentID)) {
                return res.status(StatusCodes.BAD_REQUEST).json({
                    message: `Invalid student ID in results: ${item.studentID}`
                });

            }

            if (item.marks > maxMarks) {
                return res.status(StatusCodes.BAD_REQUEST).json({
                    message: `Mark (${item.marks}) cannot be greater than maxMarks (${maxMarks}) for student ID: ${item.studentID}`
                });

            }

            if (item.marks < 0) {
                return res.status(StatusCodes.BAD_REQUEST).json({
                    message: `Mark cannot be negative for student ID: ${item.studentID}`
                });
            }
        }

        const exam = await Exam.create({ groupID, title, date, maxMarks, results })
        await exam.populate([
            { path: "groupID", select: "name" },
            { path: "results.studentID", select: "name" }
        ]);
        res.status(StatusCodes.CREATED).json({
            message: "Exam added successfully",
            data: exam
        });
    } catch (err) {
        console.log(err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Internal server error" });
    }
}
