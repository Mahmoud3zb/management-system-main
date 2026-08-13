import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import { Role, User } from "../user-model";
import { Level } from "../../group/group-model";

interface IRequest {
    currentLevel: Level;
    newLevel: Level;
}

interface IResponse {
    message: string;
    data?: any;
}

export const promoteStudentsLevel: RequestHandler<{}, IResponse, IRequest> = async (
    req,
    res
) => {
    try {
        const { currentLevel, newLevel } = req.body;

        if (currentLevel === newLevel) {
            res.status(StatusCodes.BAD_REQUEST).json({
                message: "Current level and new level cannot be the same",
            });
            return;
        }

        const result = await User.updateMany(
            {
                role: Role.STUDENT,
                level: currentLevel,
            },
            {
                $set: { level: newLevel },
            }
        );

        if (result.matchedCount === 0) {
            res.status(StatusCodes.NOT_FOUND).json({
                message: `No matched students found in level ${currentLevel}`,
            });
            return;
        }

        res.status(StatusCodes.OK).json({
            message: `Successfully promoted ${result.modifiedCount} students from level ${currentLevel} to ${newLevel}`,
            data: {
                matchedCount: result.matchedCount,
                modifiedCount: result.modifiedCount,
            },
        });
    } catch (err) {
        console.log("Promote Students Level Error:", err);

        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Internal server error",
        });
    }
};