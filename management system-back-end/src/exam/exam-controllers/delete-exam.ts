import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import { Exam } from "../exam-model";

export const deleteExam: RequestHandler<{ id: string }> = async (req, res) => {
    try {
        const { id } = req.params;
        
        const exam = await Exam.findByIdAndUpdate(
            id,
            { $set: { isDeleted: true } },
            { returnDocument: 'after' }
        );

        if (!exam) {
            res.status(StatusCodes.NOT_FOUND).json({ message: "Exam not found" });
            return;
        }

        res.status(StatusCodes.OK).json({ message: "Exam deleted successfully" });
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Internal server error" });
    }
};