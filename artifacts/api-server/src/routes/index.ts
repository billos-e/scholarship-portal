import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import universitiesRouter from "./universities";
import studentsRouter from "./students";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(universitiesRouter);
router.use(studentsRouter);

export default router;
