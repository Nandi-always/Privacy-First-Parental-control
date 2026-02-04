const express = require("express");
const router = express.Router();
const {
    requestAppApproval,
    getApprovalRequests,
    approveRequest,
    denyRequest,
    getChildRequests
} = require("../controllers/appApprovalController");
const authMiddleware = require("../middleware/authMiddleware");

// Child requests app approval
router.post("/:childId/request", authMiddleware, requestAppApproval);

// Child gets their own requests
router.get("/:childId/my-requests", authMiddleware, getChildRequests);

// Parent gets all approval requests
router.get("/", authMiddleware, getApprovalRequests);

// Parent approves request
router.post("/:requestId/approve", authMiddleware, approveRequest);

// Parent denies request
router.post("/:requestId/deny", authMiddleware, denyRequest);

module.exports = router;
