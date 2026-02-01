const router = require("express").Router();
const requireAdminAuth = require("../middlewares/auth/adminAuth");
const { listThreads, getThreadMessages, deleteThread, chatCompletion } = require("../controllers/ai.controller");

router.use(requireAdminAuth);

router.use((req, res, next) => {
  req.ownerId = req.adminId;
  req.ownerModel = "Admin";
  next();
});

router.get("/thread", listThreads);
router.get("/thread/:threadId", getThreadMessages);
router.delete("/thread/:threadId", deleteThread);
router.post("/chat", chatCompletion);

module.exports = router;

