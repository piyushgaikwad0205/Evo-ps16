import { API, handleApiError } from "./utils";

export const getSurveys = async (params) => {
  try {
    const res = await API.get("/surveys", { params });
    return { error: null, data: res.data };
  } catch (error) {
    return handleApiError(error);
  }
};

export const getSurveyById = async (id) => {
  try {
    const res = await API.get(`/surveys/${id}`);
    return { error: null, data: res.data };
  } catch (error) {
    return handleApiError(error);
  }
};

export const submitSurveyResponse = async (id, answers) => {
  try {
    const res = await API.post(`/surveys/${id}/respond`, { answers });
    return { error: null, data: res.data };
  } catch (error) {
    return handleApiError(error);
  }
};

export const getSurveyAnalytics = async (id) => {
  try {
    const res = await API.get(`/surveys/${id}/analytics`);
    return { error: null, data: res.data };
  } catch (error) {
    return handleApiError(error);
  }
};