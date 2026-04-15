import { Router } from "express";
import { redirect, shortenURL } from "../controllers/url.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const urlRouter = Router();

urlRouter.post("/shorten", authenticate, shortenURL);
urlRouter.get("/:shortCode", redirect);

export default urlRouter;
