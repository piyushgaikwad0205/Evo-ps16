const mongoose = require('mongoose');
const Admin = require('./models/admin.model');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const run = async () => {
    try {
        const uri = process.env.MONGODB_URI || process.env.CONNECTION_URL;
        await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

        console.log("Connected.");

        // Target college ID that has users (Sagar ALumni, etc.)
        const targetCollegeId = "694e0ccbe54f04aabf84428b";

        const admin = await Admin.findOne({ username: 'JD1234' });
        if (admin) {
            console.log(`Updating JD1234 from ${admin.college} to ${targetCollegeId}`);
            admin.college = targetCollegeId;
            await admin.save();
            console.log("Update successful.");
        } else {
            console.log("Admin JD1234 not found.");
        }

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
};

run();
