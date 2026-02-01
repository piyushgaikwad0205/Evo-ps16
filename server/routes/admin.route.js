const router = require("express").Router();

const {
  retrieveLogInfo,
  deleteLogInfo,
  signin,
  updateServicePreference,
  retrieveServicePreference,
  getCommunities,
  getCommunity,
  deleteCommunity,
  createCommunityAdmin,
  addModerator,
  removeModerator,
  getModerators,
  getAllAlumni,
  updateUploadPermission,
  deleteAlumni,
  createAlumni,
  getAllSurveys,
  updateSurveyStatus,
  createSurvey,
  listAlumniRequests,
  rejectAlumniRequest,
  approveAlumniRequest
} = require("../controllers/admin.controller");

const {
  createSystemNotification,
  listSystemNotifications,
  deleteSystemNotification,
} = require("../controllers/notification.controller");


const requireAdminAuth = require("../middlewares/auth/adminAuth");
const restrictToCollege = require("../middlewares/auth/restrictToCollege");
const {
  configLimiter,
  logLimiter,
  signUpSignInLimiter,
} = require("../middlewares/limiter/limiter");

const fileUpload = require("../middlewares/post/fileUpload");

router.post("/signin", signUpSignInLimiter, signin);

const {
  createCollege,
  getAllColleges,
  getCollegeById,
  updateCollege,
  deleteCollege,
  createInitialSuperAdmin
} = require("../controllers/college.controller");

const {
  getGlobalStats,
  updateCollegeStatus,
  createCollegeAdmin,
  getCollegeAdmins,
  deleteCollegeAdmin,
  getGlobalSettings,
  updateGlobalSettings,
  getGlobalLogs,
  getGlobalUsers,
  createGlobalNotification,
  getCollegesList,
  updateUserStatus,
  updateUser: updateGlobalUser,
  getCollegeOverview
} = require("../controllers/superAdmin.controller");

router.post("/create-super-admin", createInitialSuperAdmin);

router.use(requireAdminAuth);

// College management routes (superadmin only)
router.get("/colleges", getAllColleges);
router.get("/colleges/:id", getCollegeById);
router.post("/colleges", fileUpload, createCollege);
router.put("/colleges/:id", fileUpload, updateCollege);
router.delete("/colleges/:id", deleteCollege);

// Super Admin specific routes
router.get("/super/stats", getGlobalStats);
router.put("/super/colleges/:id/status", updateCollegeStatus);
router.post("/super/colleges/:id/admins", createCollegeAdmin);
router.get("/super/colleges/:id/admins", getCollegeAdmins);
router.get("/super/colleges/:id/overview", getCollegeOverview);
router.delete("/super/admins/:id", deleteCollegeAdmin);
router.get("/super/settings", getGlobalSettings);
router.put("/super/settings", updateGlobalSettings);
router.get("/super/logs", getGlobalLogs);
router.get("/super/users", getGlobalUsers);
router.post("/super/notifications", createGlobalNotification);
router.get("/super/colleges/list", getCollegesList);
router.put("/super/users/:id/status", updateUserStatus);
router.put("/super/users/:id", updateGlobalUser);

// Enforce College Isolation for all subsequent routes
router.use(restrictToCollege);

router.get("/community/:communityId", getCommunity);
router.get("/communities", getCommunities);
router.post("/communities", createCommunityAdmin);
router.delete("/community/:communityId", deleteCommunity);
router.get("/moderators", getModerators);

router.patch("/add-moderators", addModerator);
router.patch("/remove-moderators", removeModerator);

router
  .route("/preferences")
  .get(configLimiter, retrieveServicePreference)
  .put(configLimiter, updateServicePreference);
router
  .route("/logs")
  .get(logLimiter, retrieveLogInfo)
  .delete(logLimiter, deleteLogInfo);

// Alumni management routes
router.get("/alumni", getAllAlumni);
router.put("/alumni/:id/upload-permission", updateUploadPermission);
router.delete("/alumni/:id", deleteAlumni);
router.post("/alumni", createAlumni);
// Alumni requests routes
router.get("/alumni-requests", listAlumniRequests);
router.put("/alumni-requests/:id/reject", rejectAlumniRequest);
router.put("/alumni-requests/:id/approve", approveAlumniRequest);

// Survey management routes
router.get("/surveys", getAllSurveys);
router.post("/surveys", createSurvey);
router.put("/surveys/:id/status", updateSurveyStatus);

// Notifications management routes
router.get("/notifications", listSystemNotifications);
router.post("/notifications", createSystemNotification);
router.delete("/notifications/:id", deleteSystemNotification);

// Club management routes (admin)
const { listClubs, createClub, updateClub, assignHeads, deleteClub } = require("../controllers/club.controller");
const bannerUpload = require("../middlewares/clubs/bannerUpload");

router.get("/clubs", listClubs);
router.post("/clubs", bannerUpload, createClub);
router.put("/clubs/:id", bannerUpload, updateClub);
router.put("/clubs/:id/assign-heads", assignHeads);
router.delete("/clubs/:id", deleteClub);

// User management routes (admin)
const {
  getAllUsers,
  getUserById,
  updateUser,
  suspendUser,
  deleteUser,
  getUserStats
} = require("../controllers/admin.user.controller");

router.get("/users", getAllUsers);
router.get("/users/:id", getUserById);
router.patch("/users/:id", updateUser);
router.patch("/users/:id/suspend", suspendUser);
router.delete("/users/:id", deleteUser);
router.get("/stats", getUserStats);

// Department management routes (admin)
const {
  getAllDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getDepartmentStats
} = require("../controllers/department.controller");

router.get("/departments", getAllDepartments);
router.get("/departments/stats", getDepartmentStats);
router.get("/departments/:id", getDepartmentById);
router.post("/departments", createDepartment);
router.put("/departments/:id", updateDepartment);
router.delete("/departments/:id", deleteDepartment);

// HOD management routes (admin)
const {
  getAllHODs,
  getHODById,
  createHOD,
  updateHOD,
  deleteHOD,
  getHODStats
} = require("../controllers/hod.controller");

router.get("/hods", getAllHODs);
router.get("/hods/stats", getHODStats);
router.get("/hods/:id", getHODById);
router.post("/hods", createHOD);
router.put("/hods/:id", updateHOD);
router.delete("/hods/:id", deleteHOD);

// Teacher management routes (admin)
const {
  getAllTeachers,
  getTeacherById,
  createTeacher,
  updateTeacher,
  deleteTeacher,
  getTeacherStats
} = require("../controllers/teacher.controller");

router.get("/teachers", getAllTeachers);
router.get("/teachers/stats", getTeacherStats);
router.get("/teachers/:id", getTeacherById);
router.post("/teachers", createTeacher);
router.put("/teachers/:id", updateTeacher);
router.delete("/teachers/:id", deleteTeacher);

// Staff management routes (admin)
const {
  getAllStaff,
  getStaffById,
  createStaff,
  updateStaff,
  deleteStaff,
  getStaffStats
} = require("../controllers/staff.controller");

router.get("/staff", getAllStaff);
router.get("/staff/stats", getStaffStats);
router.get("/staff/:id", getStaffById);
router.post("/staff", createStaff);
router.put("/staff/:id", updateStaff);
router.delete("/staff/:id", deleteStaff);

// Class management routes (admin)
const {
  getAllClasses,
  createClass,
  updateClass,
  deleteClass
} = require("../controllers/class.controller");

router.get("/classes", getAllClasses);
router.post("/classes", createClass);
router.put("/classes/:id", updateClass);
router.delete("/classes/:id", deleteClass);

// Section management routes (admin)
const {
  getAllSections,
  createSection,
  updateSection,
  deleteSection,
  moveStudents,
  getSectionStats,
  getSectionStudents
} = require("../controllers/section.controller");

router.get("/sections", getAllSections);
router.get("/sections/stats", getSectionStats);
router.get("/sections/:id/students", getSectionStudents);
router.post("/sections", createSection);
router.put("/sections/move-students", moveStudents);
router.put("/sections/:id", updateSection);
router.delete("/sections/:id", deleteSection);

module.exports = router;
