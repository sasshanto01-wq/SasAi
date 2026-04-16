import { Router, type IRouter } from "express";
import analyseRouter from "./analyse";
import whaleRouter from "./whale";
import sentimentRouter from "./sentiment";
import newsRouter from "./news";
import stockAnalyzeRouter from "./stock-analyze";

const router: IRouter = Router();

router.use(analyseRouter);
router.use(whaleRouter);
router.use(sentimentRouter);
router.use(newsRouter);
router.use(stockAnalyzeRouter);

export default router;
