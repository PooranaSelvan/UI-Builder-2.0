import express from "express";
import { getAllTemplates, getSpecificTemplate } from "../controllers/templateController.js";

const router = express.Router();

router.route("/").get(getAllTemplates);
router.route("/:templateId").get(getSpecificTemplate);

export default router;