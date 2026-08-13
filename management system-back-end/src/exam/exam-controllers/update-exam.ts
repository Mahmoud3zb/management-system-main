import e, { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import { Exam } from "../exam-model";
import mongoose from "mongoose";
import {body} from "express-validator";

export const updateExamValidation = [
    body("title")
        .optional()
        .isString().withMessage("Title must be a string")
        .trim()
        .isLength({ min: 3, max: 100 }).withMessage("Title must be between 3 and 50 characters"),
    body("date")
        .optional()
        .isString().withMessage("Date must be a string")
        .trim()
        .isLength({ min: 3, max: 50 }).withMessage("Date must be between 3 and 50 characters"),
    body("maxMarks")
        .optional()
        .isNumeric().withMessage("Max marks must be a valid number"),
];

interface IRequest{
    title?: string
    date?: string
    maxMarks?: number
}

interface IResponse{
    message: string
    data?: any
}


export const updateExam: RequestHandler<{ id: string }, IResponse, IRequest> = async (req, res) => {
    try{
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Invalid exam ID"
            });
        }
        const { title, date, maxMarks } = req.body;
        const updateData: any = {};
        if (title) {
            updateData.title = req.body.title;
        }
        if (date) {
            updateData.date = req.body.date;
        }
        if (maxMarks) {
            updateData.maxMarks = req.body.maxMarks;
        }
        if (Object.keys(updateData).length === 0) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Please provide at least one field to update"
            });
        }
        const updatedExam = await Exam.findOneAndUpdate(
            { _id: id },
            { $set: updateData },
            { returnDocument: 'after', runValidators: true }
        );
        if (!updatedExam) {
            return res.status(StatusCodes.NOT_FOUND).json({
                message: "Exam not found"
            });
        }
        res.status(StatusCodes.OK).json({
            message: "Exam updated successfully",
            data: updatedExam
        });
    }catch(err){
        console.log("Update Exam Error:", err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Internal server error"
        });
    }
}