import jwt from "jsonwebtoken";
import { asyncHandler } from "../utilities/asyncHandler.js";
import ApiError from "../utilities/ApiError.js";
import { User } from "../module/user.model.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        // Extract token from cookies or Authorization header
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
        console.log("Token received:", token ? "Present" : "Missing");
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Access token is required"
            });
        }

        // Verify JWT token
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        
        // Find user by decoded token's _id
        const user = await User.findById(decodedToken._id).select("-password -refreshToken");

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid access token"
            });
        }

        // Check if user is active
        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: "Your account has been deactivated"
            });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error("JWT verification error:", error.message);
        return res.status(401).json({
            success: false,
            message: error?.message || "Invalid access token"
        });
    }
});

// For backward compatibility
export const verifyjwt = verifyJWT;

export const authorizedRoles = (...roles) => async (req, res, next) => {
    try {
        const currentUserRole = req.user.role;
        if (!roles.includes(currentUserRole)) {
            throw new ApiError(403, "You do not have permission to access this resource");
        }
        next();
    } catch (error) {
        console.error("Error in authorizedRoles middleware:", error);
        return res.status(error.status || 500).json({
            success: false,
            message: error.message || "Internal Server Error"
        });
    }
};
