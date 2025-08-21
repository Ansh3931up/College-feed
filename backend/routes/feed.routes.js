import { Router } from "express";

console.log("🔧 Initializing feed routes...");
import {
    createSmartPost,
    publishPost,
    getFeed,
    getPostById,
    toggleLike,
    addComment,
    addReply,
    respondToEvent,
    claimItem,
    smartClassifyPost,
    createAndPublishPost
} from "../controllers/feed.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";



const router = Router();
console.log("✅ Feed router created successfully");
console.log("verifyJWT is:", verifyJWT);
router.use(verifyJWT);


// All routes require authentication
router.use(verifyJWT);

// AI-powered post classification
router.route("/classify").post(smartClassifyPost);

// One-step: Create and publish post (simplified)
router.route("/create-and-publish").post(
    upload.array("attachments", 5), // Max 5 attachments
    createAndPublishPost
);

// Smart post creation and publishing (legacy)
router.route("/smart-create").post(
    upload.array("attachments", 5), // Max 5 attachments
    createSmartPost
);

router.route("/publish").post(
    upload.array("attachments", 5),
    publishPost
);

// Feed routes
router.route("/").get(getFeed);
router.route("/:id").get(getPostById);

// Interaction routes
router.route("/:id/like").post(toggleLike);
router.route("/:id/comment").post(addComment);
router.route("/:id/comment/:commentId/reply").post(addReply);

// Event-specific routes
router.route("/:id/event/respond").post(respondToEvent);

// Lost & Found specific routes
router.route("/:id/lostfound/claim").post(claimItem);

console.log("🚀 Exporting feed router with", router.stack?.length || "unknown", "routes");
export default router;
