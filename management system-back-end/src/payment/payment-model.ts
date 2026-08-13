import mongoose from "mongoose";

interface IPaidList {
    studentID: mongoose.Types.ObjectId;
    paidAt: string;
}

interface IPayment extends mongoose.Document {
    groupID: mongoose.Types.ObjectId;
    month: string;
    paidList: IPaidList[];
    createdAt: Date;
    updatedAt: Date;
}

const paymentSchema = new mongoose.Schema<IPayment>({
    groupID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Group",
        required: true
    },
    month: {
        type: String,
        required: true
    },
    paidList: {
        type: [
            {
                _id: false,
                studentID: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
                    required: true
                },
                paidAt: {
                    type: String,
                    required: true
                }
            }
        ],
    }
}, { 
    timestamps: true,
    versionKey: false 
});


paymentSchema.index({ groupID: 1, month: 1 }, { unique: true });

export const Payment = mongoose.model<IPayment>("Payment", paymentSchema);