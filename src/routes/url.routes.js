import { Router } from "express";
import { redirect, shortenURL } from "../controllers/url.controller.js";

const urlRouter = Router();

urlRouter.post("/shorten", shortenURL);
urlRouter.get("/:shortCode", redirect);

export default urlRouter;
