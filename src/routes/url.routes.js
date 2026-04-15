import { Router } from "express";
import { shortenURL } from "../controllers/url.controller.js";

const urlRouter = Router();

urlRouter.post("/shorten", shortenURL);

export default urlRouter;
