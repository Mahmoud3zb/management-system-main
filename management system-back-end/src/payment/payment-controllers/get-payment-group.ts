import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";
import { Payment } from "../payment-model";




export const getPaymentGroup:RequestHandler<{groupID:string}>=async(req,res)=>{
    try{
    const {groupID} = req.params;
    if(!mongoose.Types.ObjectId.isValid(groupID)){
        return res.status(StatusCodes.BAD_REQUEST).json({
            message: "Invalid group ID"
        });
    }
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const payments = await Payment.find({groupID})
        .select("-paidList")
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip((page - 1) * limit)
        .lean()
        .exec();
        const total = await Payment.countDocuments({groupID});
        res.status(StatusCodes.OK).json({
            message: "Payment fetched successfully",
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            data: payments
        });
    }catch(err){
        console.log("Get Payment Group Error:", err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Internal server error"
        });
    }
}