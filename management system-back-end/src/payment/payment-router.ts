import { Router } from "express";
import { recordPaymentMonth, recordPaymentMonthValidation } from "./payment-controllers/record-payment-month";
import { getPaymentGroup } from "./payment-controllers/get-payment-group";
import { getPaymentById } from "./payment-controllers/get-payment-by-id";

import { isAuthenticated } from "../middlewares/isAuthenticated.middleware";
import { isAuthorized } from "../middlewares/isAuthorized.middleware";
import { Role } from "../user/user-model"; 

const router = Router();

router.put("/record/:groupID",
    // isAuthenticated,
    // isAuthorized(Role.ADMIN, Role.TEACHER),
    recordPaymentMonthValidation, 
    recordPaymentMonth
);

router.get("/group/:groupID",
    isAuthenticated,
    isAuthorized(Role.ADMIN, Role.TEACHER),
    getPaymentGroup
);

router.get("/:id",
    isAuthenticated,
    isAuthorized(Role.ADMIN, Role.TEACHER),
    getPaymentById
);



export default router;