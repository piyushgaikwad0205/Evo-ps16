import { API, handleApiError } from "./utils";

export const sendConnectionRequest = async (requestData) => {
  try {
    const { data } = await API.post("/connections/request", requestData);
    return { error: null, data };
  } catch (error) {
    return handleApiError(error);
  }
};

export const getMyConnections = async () => {
  try {
    const { data } = await API.get("/connections/my-connections");
    return { error: null, data };
  } catch (error) {
    return handleApiError(error);
  }
};

export const getPendingRequests = async () => {
  try {
    const { data } = await API.get("/connections/pending-requests");
    return { error: null, data };
  } catch (error) {
    return handleApiError(error);
  }
};

export const respondToConnectionRequest = async (connectionId, status) => {
  try {
    const { data } = await API.put(`/connections/${connectionId}/respond`, { status });
    return { error: null, data };
  } catch (error) {
    return handleApiError(error);
  }
};

export const removeConnection = async (connectionId) => {
  try {
    const { data } = await API.delete(`/connections/${connectionId}`);
    return { error: null, data };
  } catch (error) {
    return handleApiError(error);
  }
};

export const checkConnectionStatus = async (userId) => {
  try {
    const { data } = await API.get(`/connections/status/${userId}`);
    return { error: null, data };
  } catch (error) {
    return handleApiError(error);
  }
};