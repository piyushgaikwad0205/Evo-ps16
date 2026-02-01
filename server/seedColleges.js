const mongoose = require("mongoose");
const College = require("./models/college.model");
const dotenv = require("dotenv");

// Adjust path to env
dotenv.config({ path: "./.env" });

const colleges = [
  {
    name: "Indian Institute of Technology, Bombay",
    code: "IITB",
    city: "Mumbai",
    state: "Maharashtra",
    country: "India",
    domain: "iitb.ac.in"
  },
  {
    name: "Delhi Technological University",
    code: "DTU",
    city: "Delhi",
    state: "Delhi",
    country: "India",
    domain: "dtu.ac.in"
  },
  {
    name: "National Institute of Technology, Trichy",
    code: "NITT",
    city: "Tiruchirappalli",
    state: "Tamil Nadu",
    country: "India",
    domain: "nitt.edu"
  }
];

mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(async () => {
    console.log("Connected to MongoDB");
    
    for (const college of colleges) {
      const exists = await College.findOne({ code: college.code });
      if (!exists) {
        await College.create({...college, status: 'approved'});
        console.log(`✓ Created college: ${college.name}`);
      } else {
        console.log(`  College already exists: ${college.name}`);
      }
    }
    
    const count = await College.countDocuments();
    console.log(`\nTotal colleges in database: ${count}`);
    console.log("Seeding complete");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Error seeding colleges:", err);
    process.exit(1);
  });
