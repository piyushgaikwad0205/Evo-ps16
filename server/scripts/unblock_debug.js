const mongoose = require('mongoose');
const User = require('../models/user.model');
require('dotenv').config();

const unblockUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connected to DB');

        const senderId = '692204f95527a87261cb888b';
        const targetId = '691f71cc9c894e3e1612c1d9';

        // Remove sender from target's blocked list
        await User.findByIdAndUpdate(targetId, {
            $pull: { blockedUsers: senderId }
        });
        console.log(`Removed ${senderId} from ${targetId}'s blocked list`);

        // Remove target from sender's blocked list (just in case)
        await User.findByIdAndUpdate(senderId, {
            $pull: { blockedUsers: targetId }
        });
        console.log(`Removed ${targetId} from ${senderId}'s blocked list`);

        console.log('Done');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

unblockUsers();
