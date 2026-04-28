import express from "express";
import { deleteUser, loginUser, registerUser } from "../controllers/userController.js";

const router = express.Router();


router.route("/login").post(loginUser);
router.route("/signup").post(registerUser);
router.route("/del").delete(deleteUser);


export default router;