require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/user.model");

async function createTestUser() {
    try {
        console.log("Connecting to database...");
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected!");

        // Check if user already exists
        const existingUser = await User.findOne({ email: "test@college.edu" });
        if (existingUser) {
            console.log("Test user already exists!");
            console.log("User details:", {
                name: existingUser.name,
                email: existingUser.email,
                role: existingUser.role
            });
            mongoose.disconnect();
            return;
        }

        // Create test user with college email
        const testUser = new User({
            name: "Test User",
            email: "test@college.edu",
            password: "test123", // Will be hashed automatically by the model
            role: "general",
            mobile: "1234567890"
        });

        await testUser.save();
        console.log("\n✓ Test user created successfully!");
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.log("Email: test@college.edu");
        console.log("Password: test123");
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
        
        // Verify it was saved
        const savedUser = await User.findOne({ email: "test@college.edu" });
        console.log("Verified in database:", savedUser ? "✓ Yes" : "✗ No");
        
    } catch (error) {
        console.error("Error creating user:", error.message);
        if (error.errors) {
            console.error("Validation errors:", error.errors);
        }
    } finally {
        mongoose.disconnect();
    }
}

createTestUser();
