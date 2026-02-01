const mongoose = require('mongoose');
const User = require('./models/user.model');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const run = async () => {
    try {
        const uri = process.env.MONGODB_URI || process.env.CONNECTION_URL;
        if (!uri) {
            console.log("URI missing");
            return;
        }

        await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

        console.log("Connected. Fetching users...");
        const users = await User.find({}).select('name email role collegeId');

        const result = {
            total: users.length,
            users: users.map(u => ({
                id: u._id,
                name: u.name,
                email: u.email,
                role: u.role,
                collegeId: u.collegeId
            }))
        };

        fs.writeFileSync('debug_users_list.json', JSON.stringify(result, null, 2));
        console.log("Written to debug_users_list.json");

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
};

run();
