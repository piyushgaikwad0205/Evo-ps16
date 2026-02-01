const axios = require('axios');

async function test() {
    try {
        // Login
        const loginRes = await axios.post('http://localhost:4000/admin/signin', {
            username: 'supertest',
            password: 'password123'
        });
        const token = loginRes.data.accessToken;
        console.log("Login successful, token obtained.");

        // Get Colleges
        const collegesRes = await axios.get('http://localhost:4000/admin/colleges', { // or /super/colleges/list
            headers: { Authorization: `Bearer ${token}` }
        });
        const collegeId = collegesRes.data[0]?._id;
        console.log("Using College ID:", collegeId);

        if (!collegeId) throw new Error("No colleges found");

        try {
            const res = await axios.post('http://localhost:4000/admin/super/notifications', {
                title: "Test Notif Script",
                message: "Hello from script",
                targetAudience: "college",
                targetCollege: collegeId
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log("Create valid notif success:", res.data);
        } catch (e) {
            console.error("Create notif failed:", e.response ? e.response.data : e.message);
        }

    } catch (e) {
        console.error("Login failed:", e.response ? e.response.data : e.message);
    }
}
test();
