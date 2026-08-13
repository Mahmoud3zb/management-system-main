import { Router } from "express";
import { loginHandler, loginValidation } from "./login";
import { handleValidationErrors } from "../middlewares/handleValidationErrors";
import { refreshToken } from "./refresh-token";



const router = Router();




router.post('/login',
    loginValidation,
    handleValidationErrors,
    loginHandler);

router.post("/refresh", refreshToken);
export default router;