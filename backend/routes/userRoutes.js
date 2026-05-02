import express from "express";
import { deleteUser, loginUser, registerUser, updateProfilePhoto, removeProfilePhoto } from "../controllers/userController.js";
import { verifyUser } from "../utils/generateToken.js";

const router = express.Router();


router.route("/login").post(loginUser);
router.route("/signup").post(registerUser);
router.route("/del").delete(deleteUser);
router.route("/update-photo").put(verifyUser, updateProfilePhoto);
router.route("/remove-photo").delete(verifyUser, removeProfilePhoto);


export default router;