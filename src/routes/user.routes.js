import {
  loginUser,
  logoutUser,
  registerUser,
} from "../controller/user.controller.js";
import { upload } from "../middleware/multer.middleware.js";
import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);
router.route("/login").post(loginUser);

// Sequired routes
router.route("/logout").post(verifyJWT, logoutUser);

export default router;
