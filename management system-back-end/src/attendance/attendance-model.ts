import mongoose from "mongoose";


interface IPresent {
    studentID: mongoose.Types.ObjectId,
    isPresent: boolean
}

interface IAttendance extends mongoose.Document {
    groupID: mongoose.Types.ObjectId;
    date: string;
    present: IPresent[];
    createdAt: Date;
    updatedAt: Date;
}

const attendanceSchema = new mongoose.Schema<IAttendance>({
    groupID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Group",
        required: true
    },
    date: {
        type: String,
        required: true
    },
    present: {
        type: [
            {
                _id: false,
                studentID: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
                    required: true
                },
                isPresent: {
                    type: Boolean,
                    default: true
                },
                
            },
            
        ],
        required: true
    }
}, {
    timestamps: true
});

attendanceSchema.index({ groupID: 1, date: 1 }, { unique: true });

export const Attendance = mongoose.model<IAttendance>("Attendance", attendanceSchema);