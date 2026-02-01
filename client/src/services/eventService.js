import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:4000";

const getEvents = async () => {
    const response = await axios.get(`${BASE_URL}/events`);
    return response.data;
};

const getEventById = async (id) => {
    const response = await axios.get(`${BASE_URL}/events/${id}`);
    return response.data;
};

const createEvent = async (eventData, token) => {
    const response = await axios.post(`${BASE_URL}/events`, eventData, {
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
        },
    });
    return response.data;
};

const registerForEvent = async (eventId, registrationData, token) => {
    const response = await axios.post(
        `${BASE_URL}/events/${eventId}/register`,
        registrationData,
        {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data",
            },
        }
    );
    return response.data;
};

const getEventRegistrations = async (eventId, token) => {
    const response = await axios.get(
        `${BASE_URL}/events/${eventId}/registrations`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );
    return response.data;
};

const updateRegistrationStatus = async (registrationId, status, token) => {
    const response = await axios.patch(
        `${BASE_URL}/events/registrations/${registrationId}`,
        { status },
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );
    return response.data;
};

const deleteEvent = async (id, token) => {
    const response = await axios.delete(`${BASE_URL}/events/${id}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};

const getUserRegistrations = async (token) => {
    const response = await axios.get(`${BASE_URL}/events/user/registrations`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};

const checkUserRegistration = async (eventId, token) => {
    const response = await axios.get(`${BASE_URL}/events/${eventId}/check-registration`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};

const eventService = {
    getEvents,
    getEventById,
    createEvent,
    registerForEvent,
    getEventRegistrations,
    updateRegistrationStatus,
    deleteEvent,
    getUserRegistrations,
    checkUserRegistration,
};

export default eventService;
