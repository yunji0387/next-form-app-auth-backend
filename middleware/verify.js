import User from "../models/User.js";
import Blacklist from "../models/Blacklist.js";
import jwt from "jsonwebtoken";
import { SECRET_ACCESS_TOKEN } from "../config/index.js";

export async function VerifyToken(req, res, next) {
    try {
        const authHeader = req.headers["cookie"];

        if (!authHeader) return res.sendStatus(401);
        const cookie = authHeader.split("=")[1];
        const accessToken = cookie.split(";")[0];

        const checkIfBlacklisted = await Blacklist.findOne({ token: accessToken });
        if (checkIfBlacklisted) {
            return res.status(401).json({
                error: {
                    status: "failed",
                    message: "This session has expired. Please login to continue.",
                }
            });
        };

        jwt.verify(accessToken, SECRET_ACCESS_TOKEN, async (err, decoded) => {
            if (err) {
                return res.status(401).json({
                    error: {
                        status: "failed",
                        message: "This session has expired. Please login to continue.",
                        details: err.message,
                    }
                });
            }

            const { id } = decoded;
            const user = await User.findById(id);
            const { password, ...user_data } = user._doc;
            req.user = user_data;
            next();
        });

    } catch (err) {
        res.status(500).json({
            error: {
                status: "error",
                message: "Internal Server Error",
                code: 500,
                data: [],
                details: err.message,
            }
        });
    }
}

export function VerifyRole(req, res, next) {
    try {
        const user = req.user; // we have access to the user object from the request
        const { role } = user; // extract the user role
        // check if user has no advance privileges
        // return an unathorized response
        if (role !== "0x88") {
            return res.status(401).json({
                error: {
                    status: "failed",
                    message: "You are not authorized to view this page.",
                }
            });
        }
        next(); // continue to the next middleware or function
    } catch (err) {
        res.status(500).json({
            error: {
                status: "error",
                code: 500,
                data: [],
                message: "Internal Server Error",
            }
        });
    }
}