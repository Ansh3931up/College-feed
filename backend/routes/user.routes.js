import { Router } from "express";

import {
    register,
    login,
    logout,
    getProfile,
    getAllUsers,
    forgot,
    reset,
    updateAccountDetails,
    changeCurrentPassword,
    getCurrentUser,
    calculateTotalRevenue,
    filterByPincode,
    getUsersByCollege,
    createCollegeAdmin
} from "../controllers/user.controller.js";
import { upload } from "../middleware/multer.middleware.js";
import { verifyJWT, authorizedRoles } from "../middleware/auth.middleware.js";

const router = Router();


// Public routes
router.route("/register").post(upload.single("avatar"), register);
router.route("/login").post(login);
router.route("/forgot-password").post(forgot);
router.route("/reset-password/:resetToken").post(reset);

// Protected routes (require authentication)
router.use(verifyJWT);

// User profile routes
router.route("/logout").post(logout);
router.route("/profile").get(getProfile);
router.route("/me").get(getCurrentUser);
router.route("/change-password").patch(changeCurrentPassword);
router.route("/update-details").patch(updateAccountDetails);

// College admin routes
router.route("/college-users").get(authorizedRoles("COLLEGE_ADMIN"), getUsersByCollege);
router.route("/create-admin").post(authorizedRoles("COLLEGE_ADMIN"), createCollegeAdmin);

// System admin routes (legacy - can be removed if not needed)
router.route("/all").get(authorizedRoles("COLLEGE_ADMIN"), getAllUsers);
router.route("/total-revenue").get(authorizedRoles("COLLEGE_ADMIN"), calculateTotalRevenue);
router.route("/filter/:pincode").get(authorizedRoles("COLLEGE_ADMIN"), filterByPincode);

console.log("🚀 Exporting user router with", router.stack?.length || "unknown", "routes");
export default router;