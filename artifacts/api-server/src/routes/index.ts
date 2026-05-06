import { Router, type IRouter } from "express";
import healthRouter from "./health";
import photosRouter from "./photos";
import routeRouter from "./route";

const router: IRouter = Router();

router.use(healthRouter);
router.use(photosRouter);
router.use("/route", routeRouter);

export default router;
