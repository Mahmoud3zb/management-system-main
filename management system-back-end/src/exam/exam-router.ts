import { Router } from "express";
import { getGroupExams } from "./exam-controllers/get-group-exams";
import { getExamById } from "./exam-controllers/get-exam-by-id";
import { handleValidationErrors } from "../middlewares/handleValidationErrors";
import { addExamValidation, addExam } from "./exam-controllers/add-exam";
import { updateExam, updateExamValidation } from "./exam-controllers/update-exam";
import { updateStudentMark, updateStudentMarkValidation } from "./exam-controllers/update-student-mark";
import { deleteExam } from "./exam-controllers/delete-exam";
import { isAuthenticated } from "../middlewares/isAuthenticated.middleware";
import { isAuthorized } from "../middlewares/isAuthorized.middleware";
import { Role } from "../user/user-model";



const router=Router();


router.get("/group/:groupID",getGroupExams)

router.get("/:id",
    isAuthenticated,
    isAuthorized(Role.ADMIN, Role.TEACHER),
    getExamById)

router.post("/group/:groupID",
    isAuthenticated,
    isAuthorized(Role.ADMIN, Role.TEACHER),
    addExamValidation,
    handleValidationErrors,
    addExam
)
router.put("/:id",
    isAuthenticated,
    isAuthorized(Role.ADMIN, Role.TEACHER),
    updateExamValidation, 
    handleValidationErrors,
    updateExam
)

router.put("/student-mark/:id", 
    isAuthenticated,
    isAuthorized(Role.ADMIN, Role.TEACHER),
    updateStudentMarkValidation,
    handleValidationErrors,
    updateStudentMark
)


router.delete("/:id",
    isAuthenticated,
    isAuthorized(Role.ADMIN, Role.TEACHER),
    handleValidationErrors,
    deleteExam
)


export default router;