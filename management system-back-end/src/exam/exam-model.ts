import mongoose from "mongoose";


export interface IResult {
    studentID: mongoose.Types.ObjectId
    marks: number
}

interface IExam extends mongoose.Document {
    title: string
    groupID: mongoose.Types.ObjectId
    date: string
    maxMarks: number
    results: IResult[]
    isDeleted?: boolean
    createdAt: Date
    updatedAt: Date
}

const examSchema = new mongoose.Schema<IExam>({
    title: {
        type: String,
        required: true
    },
    groupID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Group",
        required: true
    },
    date: {
        type: String,
        required: true
    },
    maxMarks: {
        type: Number,
        required: true,
        min: 0
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    results: {
        type: [
            {
                _id: false,
                studentID: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
                    required: true
                },
                marks: {
                    type: Number,
                    required: true,
                    min: 0
                }
            }
        ],
        required: true
    }
},
    {
        timestamps: true
    });

export const Exam = mongoose.model<IExam>("Exam", examSchema);