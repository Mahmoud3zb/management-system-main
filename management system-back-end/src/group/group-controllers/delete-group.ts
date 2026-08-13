import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";
import { Group } from "../group-model";
import { Role, User } from "../../user/user-model";


export const deleteGroup: RequestHandler<{ id: string }> = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            res.status(StatusCodes.BAD_REQUEST).json({
                message: "Invalid group ID format"
            });
            return;
        }
        const deletedGroup = await Group.findOneAndUpdate(
            { _id: id, isActive: true },
            { $set: { isActive: false } },
            { returnDocument: 'after' }
        );

        if (!deletedGroup) {
            res.status(StatusCodes.NOT_FOUND).json({
                message: "Group not found or already deleted"
            });
            return;
        }
        const studentsResult = await User.updateMany(
            { 
                group: id, 
                role: Role.STUDENT,
                isActive: true
            },
            { 
                $set: { isActive: false },
                $unset: { group: "" }
            }
        );

        res.status(StatusCodes.OK).json({
            message: "Group archived and its students have been deactivated successfully",
            data: {
                group: deletedGroup,
                affectedStudentsCount: studentsResult.modifiedCount
            }
        });
    } catch (err) {
        console.log("Delete Group Error:", err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Internal server error"
        });
    }
};