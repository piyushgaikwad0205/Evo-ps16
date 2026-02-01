import { ADMIN_API, handleApiError } from "./utils";

export const signIn = async (credential) => {
  try {
    const res = await ADMIN_API.post("/signin", credential);
    return { error: null, data: res.data };
  } catch (error) {
    return handleApiError(error);
  }
};

export const getServicePreferences = async () => {
  try {
    const res = await ADMIN_API.get("/preferences");
    return { error: null, data: res.data };
  } catch (error) {
    return handleApiError(error);
  }
};

export const updateServicePreferences = async (preferences) => {
  try {
    await ADMIN_API.put("/preferences", preferences);
  } catch (error) {
    return handleApiError(error);
  }
};

export const getLogs = async () => {
  try {
    const res = await ADMIN_API.get("/logs");
    return { error: null, data: res.data };
  } catch (error) {
    return handleApiError(error);
  }
};

export const deleteLogs = async () => {
  try {
    await ADMIN_API.delete("/logs");
  } catch (error) {
    return handleApiError(error);
  }
};

export const getCommunities = async () => {
  try {
    const res = await ADMIN_API.get("/communities");
    return { error: null, data: res.data };
  } catch (error) {
    return handleApiError(error);
  }
};

// Communities are managed by verifyAdminAuth on the server, ensuring only Super Admin can create them
// We must step out of the /admin base URL to hit /communities, but keep the admin auth headers
export const createCommunity = async (payload) => {
  try {
    const res = await ADMIN_API.post("/../communities", payload);
    return { error: null, data: res.data };
  } catch (error) {
    return handleApiError(error);
  }
};

export const getCommunity = async (communityId) => {
  try {
    const res = await ADMIN_API.get(`/community/${communityId}`);
    return { error: null, data: res.data };
  } catch (error) {
    return handleApiError(error);
  }
};

export const getModerators = async () => {
  try {
    const res = await ADMIN_API.get("/moderators");
    return { error: null, data: res.data };
  } catch (error) {
    return handleApiError(error);
  }
};

export const addModerator = async (communityId, moderatorId) => {
  try {
    await ADMIN_API.patch("/add-moderators", null, {
      params: { communityId, moderatorId },
    });
  } catch (error) {
    return handleApiError(error);
  }
};

export const removeModerator = async (communityId, moderatorId) => {
  try {
    await ADMIN_API.patch("/remove-moderators", null, {
      params: { communityId, moderatorId },
    });
  } catch (error) {
    return handleApiError(error);
  }
};

// Alumni Management APIs
export const getAllAlumni = async () => {
  try {
    const res = await ADMIN_API.get("/alumni");
    return { error: null, data: res.data };
  } catch (error) {
    return handleApiError(error);
  }
};

export const createAlumni = async (payload) => {
  try {
    const res = await ADMIN_API.post("/alumni", payload);
    return { error: null, data: res.data };
  } catch (error) {
    return handleApiError(error);
  }
};

export const updateAlumniUploadPermission = async (alumniId, uploadPermission) => {
  try {
    const res = await ADMIN_API.put(`/alumni/${alumniId}/upload-permission`, { uploadPermission });
    return { error: null, data: res.data };
  } catch (error) {
    return handleApiError(error);
  }
};

// Survey Management APIs
export const getAllSurveys = async () => {
  try {
    const res = await ADMIN_API.get("/surveys");
    return { error: null, data: res.data };
  } catch (error) {
    return handleApiError(error);
  }
};

export const updateSurveyStatus = async (surveyId, status) => {
  try {
    const res = await ADMIN_API.put(`/surveys/${surveyId}/status`, { status });
    return { error: null, data: res.data };
  } catch (error) {
    return handleApiError(error);
  }
};

export const createSurvey = async (surveyData) => {
  try {
    const res = await ADMIN_API.post("/surveys", surveyData);
    return { error: null, data: res.data };
  } catch (error) {
    return handleApiError(error);
  }
};

export const deleteSurvey = async (surveyId) => {
  try {
    await ADMIN_API.delete(`/surveys/${surveyId}`);
    return { error: null };
  } catch (error) {
    return handleApiError(error);
  }
};

// Notifications APIs
export const getNotifications = async () => {
  try {
    const res = await ADMIN_API.get(`/notifications`);
    return { error: null, data: res.data };
  } catch (error) {
    return handleApiError(error);
  }
};

export const createNotification = async (payload) => {
  try {
    const res = await ADMIN_API.post(`/notifications`, payload);
    return { error: null, data: res.data };
  } catch (error) {
    return handleApiError(error);
  }
};

export const deleteNotification = async (id) => {
  try {
    await ADMIN_API.delete(`/notifications/${id}`);
    return { error: null };
  } catch (error) {
    return handleApiError(error);
  }
};

// Clubs APIs
export const getClubs = async () => {
  try {
    const res = await ADMIN_API.get(`/clubs`);
    return { error: null, data: res.data };
  } catch (error) {
    return handleApiError(error);
  }
};

export const createClub = async (payload) => {
  try {
    const res = await ADMIN_API.post(`/clubs`, payload);
    return { error: null, data: res.data };
  } catch (error) {
    return handleApiError(error);
  }
};

export const updateClub = async (id, payload) => {
  try {
    const res = await ADMIN_API.put(`/clubs/${id}`, payload);
    return { error: null, data: res.data };
  } catch (error) {
    return handleApiError(error);
  }
};

export const assignClubHeads = async (id, payload) => {
  try {
    const res = await ADMIN_API.put(`/clubs/${id}/assign-heads`, payload);
    return { error: null, data: res.data };
  } catch (error) {
    return handleApiError(error);
  }
};

export const deleteClub = async (id) => {
  try {
    await ADMIN_API.delete(`/clubs/${id}`);
    return { error: null };
  } catch (error) {
    return handleApiError(error);
  }
};

export const removeClubMember = async (clubId, userId) => {
  try {
    const res = await ADMIN_API.put(`/clubs/${clubId}/remove-member`, { userId });
    return { error: null, data: res.data };
  } catch (error) {
    return handleApiError(error);
  }
};

export const suspendUser = async (userId) => {
  try {
    const res = await ADMIN_API.patch(`/users/${userId}/suspend`);
    return { error: null, data: res.data };
  } catch (error) {
    return handleApiError(error);
  }
};

export const deleteCommunity = async (communityId) => {
  try {
    await ADMIN_API.delete(`/community/${communityId}`);
    return { error: null };
  } catch (error) {
    return handleApiError(error);
  }
};

export const deleteAlumni = async (alumniId) => {
  try {
    await ADMIN_API.delete(`/alumni/${alumniId}`);
    return { error: null };
  } catch (error) {
    return handleApiError(error);
  }
};

export const getAlumniRequests = async (status = "pending") => {
  try {
    const res = await ADMIN_API.get(`/alumni-requests`, { params: { status } });
    return { error: null, data: res.data };
  } catch (error) {
    return handleApiError(error);
  }
};

export const rejectAlumniRequest = async (id) => {
  try {
    const res = await ADMIN_API.put(`/alumni-requests/${id}/reject`);
    return { error: null, data: res.data };
  } catch (error) {
    return handleApiError(error);
  }
};

export const approveAlumniRequest = async (id) => {
  try {
    const res = await ADMIN_API.put(`/alumni-requests/${id}/approve`);
    return { error: null, data: res.data };
  } catch (error) {
    return handleApiError(error);
  }
};

export const updateAdminProfile = async (profileData) => {
  try {
    const res = await ADMIN_API.put("/profile", profileData);
    return { error: null, data: res.data };
  } catch (error) {
    return handleApiError(error);
  }
};
// Super Admin APIs
export const getGlobalStats = async () => {
  try {
    const res = await ADMIN_API.get("/super/stats");
    return { error: null, data: res.data };
  } catch (error) {
    return handleApiError(error);
  }
};

export const getGlobalLogs = async (params) => {
  try {
    const res = await ADMIN_API.get("/super/logs", { params });
    return { error: null, data: res.data };
  } catch (error) {
    return handleApiError(error);
  }
};

export const getGlobalUsers = async (params) => {
  try {
    const res = await ADMIN_API.get("/super/users", { params });
    return { error: null, data: res.data };
  } catch (error) {
    return handleApiError(error);
  }
};

export const createGlobalNotification = async (payload) => {
  try {
    const res = await ADMIN_API.post("/super/notifications", payload);
    return { error: null, data: res.data };
  } catch (error) {
    return handleApiError(error);
  }
};

export const getCollegesList = async () => {
  try {
    const res = await ADMIN_API.get("/super/colleges/list");
    return { error: null, data: res.data };
  } catch (error) {
    return handleApiError(error);
  }
};

export const updateGlobalUserStatus = async (userId, payload) => {
  try {
    const res = await ADMIN_API.put(`/super/users/${userId}/status`, payload);
    return { error: null, data: res.data };
  } catch (error) {
    return handleApiError(error);
  }
};

export const updateGlobalUser = async (userId, payload) => {
  try {
    const res = await ADMIN_API.put(`/super/users/${userId}`, payload);
    return { error: null, data: res.data };
  } catch (error) {
    return handleApiError(error);
  }
};
