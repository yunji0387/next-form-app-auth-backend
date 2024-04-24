import User from "../models/User.js";
import bcrypt from "bcrypt";

/**
 * @route POST /auth/register
 * @desc Registers a user
 * @access Public
 */
export async function Register(req, res) {
    const { first_name, last_name, email, password } = req.body;
    try {
        const newUser = new User({
            first_name,
            last_name,
            email,
            password,
        });

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                status: "failed",
                data: [],
                message: "It seems you already have an account, please log in instead.",
            });
        }
        const savedUser = await newUser.save();
        res.status(200).json({
            status: "success",
            data: [{ first_name, last_name, email }],
            message: "Thank you for registering with us. Your account has been successfully created.",
        });

    } catch (error) {
        return res.status(500).json({
            status: "error",
            code: 500,
            data: [],
            message: "Internal Server Error",
            details: error.message,
        });
    }
    res.end();
}

/**
 * @route POST /auth/login
 * @desc Logs in a user
 * @access Public
 */
export async function Login(req, res) {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email }).select("+password");
        if (!user) {
            return res.status(401).json({
                status: "failed",
                data: [],
                message: "Invalid email or password. Please try again with the correct credentials.",
            });
        }
        const isPasswordVaild = await bcrypt.compare(String(req.body.password), user.password);
        if (!isPasswordVaild) {
            return res.status(401).json({
                status: "failed",
                data: [],
                message: "Invalid email or password. Please try again with the correct credentials.",
            });
        }

        let options = {
            maxAge: 1000 * 60 * 60, // would expire after 15 minutes
            httpOnly: true,
            signed: true,
            secure: true,
            samSite: "None",
        };

        const token = user.generateAccessJWT();
        res.cookie("SessionID", token, options);
        // const { password, ...user_data } = user._doc;
        res.status(200).json({
            status: "success",
            // data: [user_data],
            data: [],
            message: "You have successfully logged in.",
        });
    } catch (error) {
        return res.status(500).json({
            status: "error",
            code: 500,
            data: [],
            message: "Internal Server Error",
            details: error.message,
        });
    }
    res.end();
}