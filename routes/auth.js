import express from "express";
import { Register, Login, Logout, Verify, GetUser, RequestResetPassword, ResetPassword, VerifyResetPasswordToken, GoogleAuth } from "../controllers/auth.js";
import Validate from "../middleware/validate.js";
import { check } from "express-validator";
import { VerifyToken } from "../middleware/verify.js";

const router = express.Router();

router.post(
    "/register",
    check("email")
        .isEmail()
        .withMessage("Enter a valid email address")
        .normalizeEmail(),
    check("first_name")
        .not()
        .isEmpty()
        .withMessage("You first name is required")
        .trim()
        .escape(),
    check("last_name")
        .not()
        .isEmpty()
        .withMessage("You last name is required")
        .trim()
        .escape(),
    check("password")
        .notEmpty()
        .isLength({ min: 8 })
        .withMessage("Must be at least 8 chars long"),
    Validate,
    Register
);

router.post(
    "/login",
    check("email")
        .isEmail()
        .withMessage("Enter a valid email address")
        .normalizeEmail(),
    check("password").notEmpty().withMessage("Password is required"),
    Validate,
    Login
);

router.get("/logout", Logout);

router.get("/verify", VerifyToken, Verify);

router.get("/user", VerifyToken, GetUser);

router.post("/request-reset-password", RequestResetPassword);

router.post("/reset-password/:token", ResetPassword);

router.get("/verify-reset-password-token/:token", VerifyResetPasswordToken );

router.get("/google", GoogleAuth);

router.get("/google/callback",
    passport.authenticate('google', { failureRedirect: '/' }),
    (req, res) => {
        // Successful authentication, issue a JWT token
        const token = req.user.token;
        res.cookie("SessionID", token, {
            maxAge: 20 * 60 * 1000, // 20 minutes
            httpOnly: true,
            secure: true,
            sameSite: "None",
        });
        res.redirect('/');
    }
);

export default router;