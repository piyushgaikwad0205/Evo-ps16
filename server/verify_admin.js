const mongoose = require("mongoose");
const Admin = require("./models/admin.model");
const College = require("./models/college.model");
require("dotenv").config({ path: "./.env" });

const verifyAdminData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to DB");

        const username = "JD12345";
        const admin = await Admin.findOne({ username }).populate("college");

        if (!admin) {
            console.log(`❌ Admin '${username}' NOT FOUND.`);
        } else {
            console.log(`✅ Admin Found: ${admin.username}`);
            console.log(`   Role: ${admin.role}`); // Preserve this line

            if (admin.college) {
                console.log(`   Current Linked College:`);
                console.log(`   - Name: ${admin.college.name}`);
                console.log(`   - Code: ${admin.college.code}`);
            } else {
                console.log(`❌ Admin has NO linked college.`);
            }

            // Check if the expected college exists
            const jdCollege = await College.findOne({ name: { $regex: "JD College", $options: "i" } });
            if (jdCollege) {
                console.log(`ℹ️ Found Expected College: ${jdCollege.name} (ID: ${jdCollege._id})`);

                if (!admin.college || admin.college._id.toString() !== jdCollege._id.toString()) {
                    console.log(`⚠️ Mismatch detected! Updating Admin to link to JD College...`);
                    admin.college = jdCollege._id;
                    await admin.save();
                    console.log(`✅ Admin updated! Now linked to: ${jdCollege.name}`);
                } else {
                    console.log(`✅ Admin is already correctly linked.`);
                }
            } else {
                console.log(`❌ Could not find a college matching 'JD College'.`);
            }
        }

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await mongoose.disconnect();
    }
};

verifyAdminData();
