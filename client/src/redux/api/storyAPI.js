import { API } from "./utils";

export const getStoryFeed = () => API.get("/stories/feed");
export const createTextStory = (data) => API.post("/stories/text", data);
export const createMediaStory = (formData) => API.post("/stories/media", formData, {
    headers: { "Content-Type": "multipart/form-data" }
});
export const viewStory = (id) => API.post(`/stories/${id}/view`);
export const deleteStory = (id) => API.delete(`/stories/${id}`);
export const reactToStory = (id, emoji) => API.post(`/stories/${id}/react`, { emoji });
export const votePoll = (id, optionIndex) => API.post(`/stories/${id}/vote`, { optionIndex });

export const getHighlights = (userId) => API.get(`/stories/highlights/${userId}`);
export const createHighlight = (data) => API.post("/stories/highlights", data);
export const updateHighlight = (id, data) => API.put(`/stories/highlights/${id}`, data);
export const deleteHighlight = (id) => API.delete(`/stories/highlights/${id}`);
