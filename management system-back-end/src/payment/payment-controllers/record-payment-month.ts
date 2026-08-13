import { RequestHandler } from "express";
import { body } from "express-validator";
import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";
import { Payment } from "../payment-model";

export const recordPaymentMonthValidation = [
    body("studentID").isMongoId().withMessage("Invalid student ID format"),
    body("month").isString().withMessage("Month must be a string"),
    body("isPaid").isBoolean().withMessage("isPaid must be a boolean"),
    body("paidAt").isString().withMessage("paidAt must be a string"),
];

interface IRequest {
    studentID: string;
    paidAt: string;
    month: string;
    isPaid: boolean;
}

interface IResponse {
    message: string;
    field?: unknown;
    value?: unknown;
    data?: unknown;
}

export const recordPaymentMonth: RequestHandler<{ groupID: string },IResponse,IRequest> = async (req, res) => {
    try {
        const groupID = req.params.groupID;

        if (!mongoose.Types.ObjectId.isValid(groupID)) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Invalid group ID",
            });
        }

        const { studentID, month, isPaid, paidAt } = req.body;

        if (!mongoose.Types.ObjectId.isValid(studentID)) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Invalid student ID",
            });
        }

        const updatedPayment = await Payment.findOneAndUpdate(
            {
                groupID,
                month,
                "paidList.studentID": studentID,
            },
            {
                $set: {
                    "paidList.$.isPaid": isPaid,
                    "paidList.$.paidAt": paidAt,
                },
            },
            {
                returnDocument: 'after',
                runValidators: true,
            }
        ).populate("paidList.studentID" , "name phone");
        

        if (updatedPayment) {
            return res.status(StatusCodes.OK).json({
                message: "Payment updated successfully",
                data: updatedPayment,
            });
        }

        const payment = await Payment.findOneAndUpdate(
            {
                groupID,
                month,
            },
            {
                $setOnInsert: {
                    groupID,
                    month,
                },
                $push: {
                    paidList: {
                        studentID,
                        isPaid,
                        paidAt,
                    },
                },
            },
            {
                returnDocument: 'after',
                upsert: true,
                runValidators: true,
            }
        ).populate("paidList.studentID" , "name phone");

        return res.status(StatusCodes.OK).json({
            message: "Payment recorded successfully",
            data: payment,
        });
    } catch (err: any) {
        if (err.code === 11000) {
            console.log(err.keyPattern);
            console.log(err.keyValue);

            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Duplicate value",
                field: err.keyPattern,
                value: err.keyValue,
            });
        }

        console.log(err);

        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Internal server error",
        });
    }
};



// import { RequestHandler } from "express";
// import { body } from "express-validator";
// import { StatusCodes } from "http-status-codes";
// import mongoose from "mongoose";
// import { Payment } from "../payment-model";


// export const recordPaymentMonthValidation = [
//     body("studentID").isMongoId().withMessage("Invalid student ID format"),
//     body("month").isString().withMessage("Month must be a string"),
//     body("isPaid").isBoolean().withMessage("isPaid must be a boolean"),
//     body("paidAt").isString().withMessage("paidAt must be a string"),
// ];

// interface IRequest {
//     studentID: string;
//     paidAt: string;
//     month: string;
//     isPaid: boolean;
// }

// interface IResponse {
//     message: string;
//     field?: string;
//     value?: string;
//     data?: any;
// }




// export const recordPaymentMonth:RequestHandler<{groupID: string},IResponse, IRequest> = async (req, res) => {
//     try{
//         const groupID = req.params.groupID;
//         if(!mongoose.Types.ObjectId.isValid(groupID)){
//             return res.status(StatusCodes.BAD_REQUEST).json({
//                 message: "Invalid group ID"
//             });
//         }
//         const { studentID, month, isPaid , paidAt } = req.body;

//         if(!mongoose.Types.ObjectId.isValid(studentID)){
//             return res.status(StatusCodes.BAD_REQUEST).json({
//                 message: "Invalid student ID"
//             });
//         }
//         const payment = await Payment.findOneAndUpdate({
//             groupID,
//             month
//         }, {
//             $setOnInsert: {
//                 groupID,
//                 month,
//             },
//             $push: {
//                 paidList: { studentID,  isPaid, paidAt },
//             }
//         }, {
//             new: true,
//             upsert: true,
//             runValidators: true
//         });

//         res.status(StatusCodes.OK).json({
//             message: "Payment recorded successfully",
//             data: payment
//         });
    
//     }catch(err:any){
//         if ((err as any).code === 11000) {
//             console.log((err as any).keyPattern);
//             console.log((err as any).keyValue);
        
//             return res.status(StatusCodes.BAD_REQUEST).json({
//                 message: "Duplicate value",
//                 field: (err as any).keyPattern,
//                 value: (err as any).keyValue
//             });
//         }
//         console.log(err);
//         res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Internal server error" });
//     }
// }