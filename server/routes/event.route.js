const router = require("express").Router();
const passport = require("passport");
const requireAdminAuth = require("../middlewares/auth/adminAuth");
const eventFileUpload = require("../middlewares/event/eventFileUpload");
const decodeToken = require("../middlewares/auth/decodeToken");

const {
    createEvent,
    getAllEvents,
    getEventById,
    registerForEvent,
    getEventRegistrations,
    updateRegistrationStatus,
    deleteEvent,
    getUserRegistrations,
    checkUserRegistration,
} = require("../controllers/event.controller");

const requireUserAuth = passport.authenticate("jwt", { session: false }, null);

// Public routes
router.get("/", getAllEvents);
router.get("/:id", getEventById);

// User routes
router.post(
    "/:eventId/register",
    requireUserAuth,
    decodeToken,
    eventFileUpload,
    registerForEvent
);
router.get("/user/registrations", requireUserAuth, decodeToken, getUserRegistrations);
router.get("/:eventId/check-registration", requireUserAuth, decodeToken, checkUserRegistration);

// Admin routes
router.post("/", requireAdminAuth, eventFileUpload, createEvent);
router.delete("/:id", requireAdminAuth, deleteEvent);
router.get("/:eventId/registrations", requireAdminAuth, getEventRegistrations);
router.patch(
    "/registrations/:registrationId",
    requireAdminAuth,
    updateRegistrationStatus
);

module.exports = router;
