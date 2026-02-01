require("dotenv").config();
const mongoose = require("mongoose");
const Admin = require("./models/admin.model");

async function createAdmin() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const username = "supertest";
        const password = "password123";

        // Remove existing if any to reset
        await Admin.deleteOne({ username });

        const admin = new Admin({
            username,
            password,
            role: "superadmin"
        });

        await admin.save();
        console.log("Super Admin created: supertest / password123");
    } catch (e) {
        console.error(e);
    } finally {
        mongoose.disconnect();
    }
}
createAdmin();
