import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import {  Role, User } from "../user-model";


export const getStudents: RequestHandler = async (req, res) => {
    try {
        const students = await User.find({
            role: Role.STUDENT,
            isActive: true
        })
        .populate("group","name phone")
        .sort({ isActive: -1, name: 1 });
        res.status(StatusCodes.OK).json({
            message: "Students fetched successfully",
            data: students
        });
    } catch (err) {
        console.log(err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Internal server error"
        });
    }
}