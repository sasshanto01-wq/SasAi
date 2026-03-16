import { Router, type IRouter } from "express";
import healthRouter from "./health";
import tradingRouter from "./trading/index";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/trading", tradingRouter);

export default router;
