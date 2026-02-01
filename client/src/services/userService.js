import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:4000";

const searchUsers = async (query, token) => {
    const response = await axios.get(`${BASE_URL}/user/search`, {
        params: { q: query },
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};

const userService = {
    searchUsers,
};

export default userService;
