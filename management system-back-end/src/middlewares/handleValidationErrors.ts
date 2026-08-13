import { RequestHandler } from "express";
import { validationResult, FieldValidationError } from "express-validator";

export const handleValidationErrors: RequestHandler = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const formattedErrors = errors.array().map(err => {
            const e = err as FieldValidationError;
            return {
                field: e.path,    
                message: e.msg
            };
        });

        return res.status(400).json({
            success: false,
            message: "Validation failed",
            errors: formattedErrors
        });
    }

    next();
};
