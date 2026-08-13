import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";
import { Exam } from "../exam-model";



export const getExamById:RequestHandler <{id:string}>= async (req, res) => {
    try{
        const {id} = req.params;
        if(!mongoose.Types.ObjectId.isValid(id)){
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Invalid exam ID"
            });
        }
        const exam = await Exam.find({_id: id, isDeleted: false}).lean().exec();
        if(!exam){
            return res.status(StatusCodes.NOT_FOUND).json({
                message: "Exam not found"
            });
        }
        res.status(StatusCodes.OK).json({
            message: "Exam fetched successfully",
            data: exam
        });
    }catch(err){
        console.log("Get Exam By Id Error:", err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Internal server error"
        });
    }
}