import mongoose from "mongoose";

export enum Level {
    FIRST="first",
    SECOND="second",
    THIRD="third"
}

interface IGroup extends mongoose.Document {
    name: string;
    level: Level;
    isActive?: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const groupSchema = new mongoose.Schema<IGroup>({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    level: {
        type: String,
        enum: Object.values(Level),
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
},
{
    timestamps: true
});

export const Group = mongoose.model<IGroup>("Group", groupSchema);