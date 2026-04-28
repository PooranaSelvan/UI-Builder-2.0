import express from "express";
import { componentData, customComponentData } from "../controllers/componentController.js";

const router = express.Router();


router.route("/componentData").get(componentData);
router.route("/customComponentData").get(customComponentData);


export default router;