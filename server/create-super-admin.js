require("dotenv").config();
const mongoose = require("mongoose");
const Admin = require("./models/admin.model");

async function createSuperAdmin() {
    try {
        console.log("Connecting to database...");
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected!");

        // Set your desired credentials here
        const username = "admin";  // Change this
        const password = "admin123";  // Change this

        // Check if admin already exists
        const existingAdmin = await Admin.findOne({ username });
        if (existingAdmin) {
            console.log(`Admin with username "${username}" already exists!`);
            console.log("Delete it first or use a different username.");
            mongoose.disconnect();
            return;
        }

        // Create super admin
        const admin = new Admin({
            username,
            password,
            role: "superadmin"
        });

        await admin.save();
        console.log("\n✓ Super Admin created successfully!");
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.log(`Username: ${username}`);
        console.log(`Password: ${password}`);
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
        console.log("You can now login with these credentials.");
    } catch (error) {
        console.error("Error creating admin:", error.message);
    } finally {
        mongoose.disconnect();
    }
}

createSuperAdmin();
