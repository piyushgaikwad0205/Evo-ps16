const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const applicantSchema = new Schema(
	{
		user: { type: Schema.Types.ObjectId, ref: "User", required: true },
		message: { type: String, default: "" },
		status: { type: String, enum: ["pending", "accepted", "declined"], default: "pending" },
		appliedAt: { type: Date, default: Date.now },
	},
	{ _id: false }
);

const collabSchema = new Schema(
	{
		title: { type: String, required: true, trim: true },
		description: { type: String, required: true, trim: true },
		categories: { type: [String], default: [] },
		requiredSkills: { type: [String], default: [] },
		lookingForRoles: { type: [String], default: [] },
		isRemote: { type: Boolean, default: true },
		location: { type: String, default: "" },
		community: { type: Schema.Types.ObjectId, ref: "Community", default: null },
		user: { type: Schema.Types.ObjectId, ref: "User", required: true },
		status: { type: String, enum: ["open", "closed"], default: "open" },
		interestedUsers: [{ type: Schema.Types.ObjectId, ref: "User" }],
		bookmarkedBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
		hashtags: { type: [String], default: [] },
		category: {
			type: String,
			enum: ["Project", "Hackathon", "Startup", "Research", "Club Activity", "Event"],
			default: "Project",
		},
		skillsNeeded: { type: [String], default: [] },
		teamSizeNeeded: { type: String, default: "" },
		deadline: { type: Date, default: null },
		visibility: { type: String, enum: ["public", "alumni", "club"], default: "public" },
		club: { type: Schema.Types.ObjectId, ref: "Club", default: null },
		applicants: { type: [applicantSchema], default: [] },
		teamConversation: { type: Schema.Types.ObjectId, ref: "Conversation", default: null },
	},
	{ timestamps: true }
);

collabSchema.index({ title: "text", description: "text" });
collabSchema.index({ hashtags: 1 });
collabSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model("Collab", collabSchema);