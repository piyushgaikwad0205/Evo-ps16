require("dotenv").config();
const axios = require("axios");
const FormData = require("form-data");

async function testSignup() {
    try {
        console.log("Testing signup endpoint...\n");
        
        const formData = new FormData();
        formData.append("name", "Test Student");
        formData.append("email", "teststudent99@college.edu");
        formData.append("password", "test123456");
        formData.append("btid", "BT999999");
        formData.append("department", "Computer Science");
        formData.append("course", "B.Tech");
        formData.append("yearOfStudy", "2");
        formData.append("role", "general");
        formData.append("isConsentGiven", "false");

        console.log("Sending data to http://localhost:4000/users/signup");
        
        const response = await axios.post("http://localhost:4000/users/signup", formData, {
            headers: {
                ...formData.getHeaders(),
            },
            maxBodyLength: Infinity,
            maxContentLength: Infinity
        });

        console.log("✓ Signup successful!");
        console.log("Response:", response.data);
        console.log("\n✓ User should now be in the database!");
        
    } catch (error) {
        console.error("✗ Signup failed!");
        if (error.response) {
            console.error("Status:", error.response.status);
            console.error("Error:", JSON.stringify(error.response.data, null, 2));
            console.log("\nDebugging - Request data being sent:");
            console.log("Check if the server is parsing multipart/form-data correctly");
        } else {
            console.error("Error:", error.message);
        }
    }
}

testSignup();
