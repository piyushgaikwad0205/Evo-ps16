const mongoose = require("mongoose");
mongoose.set("strictQuery", false);
class Database {
  constructor(uri, options) {
    this.uri = uri || process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/socialecho";
    this.options = options || { useNewUrlParser: true, useUnifiedTopology: true };
  }

  async connect() {
    try {
      if (!this.uri || typeof this.uri !== "string" || this.uri.trim().length === 0) {
        throw new Error("MONGODB_URI is not set. Please configure your database connection string in the environment.");
      }

      await mongoose.connect(this.uri, this.options);
      console.log(
        `Connected to database: ${mongoose.connection?.db?.databaseName || "unknown"}`
      );

      mongoose.connection.on("error", (err) => {
        console.error("MongoDB connection error:", err?.message || err);
      });
      mongoose.connection.on("disconnected", () => {
        console.warn("MongoDB disconnected");
      });
    } catch (error) {
      console.error("Failed to connect to MongoDB:", error?.message || error);
      throw error;
    }
  }

  async disconnect() {
    try {
      await mongoose.disconnect();
      console.log(
        `Disconnected from database: ${mongoose.connection?.db?.databaseName || "unknown"}`
      );
    } catch (error) {
      throw error;
    }
  }

  isConnected() {
    return mongoose.connection.readyState === 1;
  }
}

module.exports = Database;
