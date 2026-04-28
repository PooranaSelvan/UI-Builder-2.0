import express from "express";
import { getPages, savePage, getCustomComponents, saveCustomComponent, getProjects, saveProject, updatePage, getPageByPageId, deleteProject, deletePage, deleteCustomComponent, deleteAllCustomComponent, getPublishedPage, publishPage, unPublishPage, updateCustomComponent, checkPageUrl, renamePage } from "../controllers/builderController.js";

const router = express.Router();

// Custom Components
router.route("/components/:userId").get(getCustomComponents);
router.route("/components").post(saveCustomComponent);
router.route("/components").delete(deleteAllCustomComponent);
router.route("/components/:componentId").delete(deleteCustomComponent);
router.route("/components/:componentId").put(updateCustomComponent);

// Page
router.route("/pages/:userId").get(getPages);
router.route("/pages").post(savePage);
router.route("/pages/:pageId").put(updatePage);
router.route("/page/:pageId").get(getPageByPageId);
router.route("/pages").delete(deletePage);
router.route("/page/rename").post(renamePage);

// Project
router.route("/projects/:userId").get(getProjects);
router.route("/projects").post(saveProject);
router.route("/projects").delete(deleteProject);


// Published
router.route("/publish/:userName/:projectName/:pageUrl").get(getPublishedPage);
router.route("/publish").post(publishPage);
router.route("/publish/un").post(unPublishPage);
router.route("/check-url/:userName/:projectName/:url").get(checkPageUrl);


export default router;