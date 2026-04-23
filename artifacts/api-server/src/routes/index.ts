import { Router, type IRouter } from "express";
import healthRouter from "./health";
import tradingRouter from "./trading/index";
import gitSyncRouter from "./git-sync";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/trading", tradingRouter);
router.use("/git", gitSyncRouter);

export default router;
