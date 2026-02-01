const router = require("express").Router();
const passport = require("passport");
const decodeToken = require("../middlewares/auth/decodeToken");
const { listThreads, getThreadMessages, deleteThread, chatCompletion } = require("../controllers/ai.controller");

router.use(passport.authenticate("jwt", { session: false }, null), decodeToken);

router.use((req, res, next) => {
  req.ownerId = req.userId;
  req.ownerModel = "User";
  next();
});

router.get("/thread", listThreads);
router.get("/thread/:threadId", getThreadMessages);
router.delete("/thread/:threadId", deleteThread);
router.post("/chat", chatCompletion);

module.exports = router;

