import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";
import { Exam } from "../exam-model";


export const getGroupExams: RequestHandler<{groupID: string}> =async (req, res) => {
    try{
        const {groupID} = req.params;
        if(!mongoose.Types.ObjectId.isValid(groupID)){
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Invalid group ID"
            });
        }
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const exams = await Exam.find({groupID: groupID , isDeleted: false})
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip((page - 1) * limit)
        .lean()
        .exec();
        const total = await Exam.countDocuments({groupID: groupID});
        res.status(StatusCodes.OK).json({
            message: "Exams fetched successfully",
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            data: exams
        });
    }catch(err){
        console.log("Get Group Exams Error:", err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Internal server error"
        });
    }
};