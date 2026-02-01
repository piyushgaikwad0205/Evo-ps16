const router = require("express").Router();
const passport = require("passport");
const decodeToken = require("../middlewares/auth/decodeToken");
const requireRoles = require("../middlewares/auth/requireRoles");

const { createUserAndCollab, createCollab, listCollabs, getCollab, applyToCollab, decideApplicant, listApplicants, toggleInterest, toggleBookmark, closeCollab } = require("../controllers/collab.controller");

const requireAuth = passport.authenticate("jwt", { session: false }, null);

// Public route: allows creating a user and a collab in one step
router.post("/public/create", createUserAndCollab);

router.use(requireAuth, decodeToken, requireRoles(["general", "alumni"]));

router.get("/", listCollabs);
router.get("/:id", getCollab);
router.get("/:id/applicants", listApplicants);
router.post("/", createCollab);
router.post("/:id/apply", applyToCollab);
router.post("/:id/decide/:applicantId", decideApplicant);
router.post("/:id/interest", toggleInterest);
router.post("/:id/bookmark", toggleBookmark);
router.post("/:id/close", closeCollab);

module.exports = router;