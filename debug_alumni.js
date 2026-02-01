require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./server/models/user.model');

const run = async () => {
    try {
        await mongoose.connect(process.env.CONNECTION_URL || 'mongodb+srv://campusconnect:campusconnect@cluster0.8k75n.mongodb.net/campus-connect?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true });

        console.log("Connected to DB");

        const alumni = await User.find({ role: 'alumni' }).select('name email collegeId');
        console.log("Total Alumni Found:", alumni.length);
        console.log("Alumni Data:");
        alumni.forEach(a => {
            console.log(`- ${a.name} (${a.email}): collegeId=${a.collegeId}`);
        });

    } catch (e) {
        console.error(e);
    } finally {
        mongoose.disconnect();
    }
};

run();
