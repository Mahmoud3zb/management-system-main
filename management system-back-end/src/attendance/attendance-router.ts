import { Router } from "express";
import { handleValidationErrors } from "../middlewares/handleValidationErrors";
import { takeAttendanceValidation, takeAttendance } from "./attendance-controllers/take-attendance";
import { isAuthenticated } from "../middlewares/isAuthenticated.middleware";
import { isAuthorized } from "../middlewares/isAuthorized.middleware";
import { Role } from "../user/user-model";
import { getGroupSheetAttendance } from "./attendance-controllers/get-group-sheet-attendance";
import { getAttendanceById } from "./attendance-controllers/get-attendance-by-id";


const router = Router();


router.post("/take-attendance/:groupID",
    isAuthenticated,
    isAuthorized(Role.ADMIN, Role.TEACHER),
    takeAttendanceValidation,
    handleValidationErrors,
    takeAttendance
)

router.get("/group/:groupID",
    isAuthenticated,
    isAuthorized(Role.ADMIN, Role.TEACHER),
    getGroupSheetAttendance
)
router.get("/:id",
    isAuthenticated,
    isAuthorized(Role.ADMIN, Role.TEACHER),
    getAttendanceById
)




export default router;