import { Router } from "express";
import { getGroups } from "./group-controllers/get-groups";
import { getGroupById } from "./group-controllers/get-group-by-id";
import { addGroupValidation, createGroup } from "./group-controllers/create-group";
import { handleValidationErrors } from "../middlewares/handleValidationErrors";
import { updateGroup, updateGroupValidation } from "./group-controllers/update-group";
import { deleteGroup } from "./group-controllers/delete-group";
import { isAuthenticated } from "../middlewares/isAuthenticated.middleware";
import { isAuthorized } from "../middlewares/isAuthorized.middleware";
import { Role } from "../user/user-model";
import { getGroupStudents } from "./group-controllers/get-students-group";


const router = Router();



router.get("/",
    isAuthenticated,
    isAuthorized(Role.ADMIN, Role.TEACHER),
    getGroups
)
router.get("/:id",
    isAuthenticated,
    isAuthorized(Role.ADMIN, Role.TEACHER),
    getGroupById
)
router.get(
    "/:id/students",
    isAuthenticated,
    isAuthorized(Role.ADMIN, Role.TEACHER),
    getGroupStudents
)
router.post("/",
    isAuthenticated,
    isAuthorized(Role.ADMIN, Role.TEACHER),
    addGroupValidation,
    handleValidationErrors,
    createGroup
);

router.put("/:id",
    isAuthenticated,
    isAuthorized(Role.ADMIN, Role.TEACHER),
    updateGroupValidation,
    handleValidationErrors,
    updateGroup
);

router.delete("/:id",
    isAuthenticated,
    isAuthorized(Role.ADMIN, Role.TEACHER),
    deleteGroup);
export default router;