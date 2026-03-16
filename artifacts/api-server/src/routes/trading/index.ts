import { Router, type IRouter } from "express";
import analyseRouter from "./analyse";
import whaleRouter from "./whale";
import sentimentRouter from "./sentiment";
import newsRouter from "./news";

const router: IRouter = Router();

router.use(analyseRouter);
router.use(whaleRouter);
router.use(sentimentRouter);
router.use(newsRouter);

export default router;
