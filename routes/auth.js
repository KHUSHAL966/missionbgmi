import express from "express";
import { body } from "express-validator";
import { register, login } from "../controllers/authController.js";
import validateRequest from "../middleware/validationMiddleware.js";

const router = express.Router();

router.post(
  "/register",
  [
    body("fullName").notEmpty().withMessage("Full name is required"),
    body("bgmiId").notEmpty().withMessage("BGMI ID is required"),
    body("bgmiName").notEmpty().withMessage("BGMI Name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("whatsapp").matches(/^\d{10}$/).withMessage("Enter a valid 10-digit WhatsApp number"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
  ],
  validateRequest,
  register
);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  validateRequest,
  login
);

export default router;
