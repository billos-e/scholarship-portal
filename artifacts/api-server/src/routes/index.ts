import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import universitiesRouter from "./universities";
import studentsRouter from "./students";
import requestsRouter from "./requests";
import submissionsRouter from "./submissions";
import academicRouter from "./academic";
import importRouter from "./import";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(universitiesRouter);
router.use(studentsRouter);
router.use(requestsRouter);
router.use(submissionsRouter);
router.use(academicRouter);
router.use(importRouter);

export default router;
