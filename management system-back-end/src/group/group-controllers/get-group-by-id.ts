import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";
import { Group } from "../group-model";



export const getGroupById: RequestHandler<{ id: string }> = async (req, res) => {
    try{
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Invalid group ID"
            });
        }
        const group = await Group.findOne({ _id: id , isActive: true })
        .lean().exec();
        if (!group) {
            return res.status(StatusCodes.NOT_FOUND).json({
                message: "Group not found"
            });
            
        }
        res.status(StatusCodes.OK).json({
            message: "Group fetched successfully",
            data: group
        });
    }catch(err){
        console.log("Get Group By ID Error:", err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Internal server error"
        });
    }
};