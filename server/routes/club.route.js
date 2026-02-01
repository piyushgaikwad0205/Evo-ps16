const router = require("express").Router();
const passport = require("passport");
const requireAdminAuth = require("../middlewares/auth/adminAuth");
const requireAuth = passport.authenticate("jwt", { session: false }, null);
const decodeToken = require("../middlewares/auth/decodeToken");
const bannerUpload = require("../middlewares/clubs/bannerUpload");

const {
  listClubs,
  getClub,
  createClub,
  updateClub,
  assignHeads,
  joinClub,
  leaveClub,
  removeMember
} = require("../controllers/club.controller");

// Authenticated users: list and view clubs
router.use(requireAuth, decodeToken);

router.get("/", listClubs);
router.get("/:id", getClub);
router.post("/:id/join", joinClub);
router.post("/:id/leave", leaveClub);

// Admin-only management
router.post("/", requireAdminAuth, bannerUpload, createClub);
router.put("/:id", requireAdminAuth, bannerUpload, updateClub);
router.put("/:id/assign-heads", requireAdminAuth, assignHeads);
router.put("/:id/remove-member", requireAdminAuth, removeMember);

module.exports = router;

