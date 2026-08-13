import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";
import { Payment } from "../payment-model";


export const getPaymentById:RequestHandler<{id:string}> = async (req,res)=>{
    try{
        const {id} = req.params;
        if(!mongoose.Types.ObjectId.isValid(id)){
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Invalid payment ID"
            });
        }
        const payment = await Payment.findById(id)
        .populate("paidList.studentID", "name phone")
        .lean()
        .exec();
        if(!payment){
            return res.status(StatusCodes.NOT_FOUND).json({
                message: "Payment not found"
            });
        }
        res.status(StatusCodes.OK).json({
            message: "Payment fetched successfully",
            data: payment
        });
    }catch(err){
        console.log("Get Payment By Id Error:", err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Internal server error"
        });
    }
}