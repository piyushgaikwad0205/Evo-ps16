const Collab = require("../models/collab.model");
const { extractHashtags } = require("../utils/textParsing");
const dayjs = require("dayjs");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const Club = require("../models/club.model");
const Conversation = require("../models/conversation.model");

const createCollab = async (req, res) => {
	try {
		const {
			title,
			description,
			categories = [],
			requiredSkills = [],
			lookingForRoles = [],
			isRemote = true,
			location = "",
			communityId = null,
			category = "Project",
			skillsNeeded = [],
			teamSizeNeeded = "",
			deadline = null,
			visibility = "public",
			clubId = null,
		} = req.body;

		if (visibility === "club" && !clubId) {
			return res.status(400).json({ message: "clubId is required for club visibility" });
		}

		const collab = await Collab.create({
			user: req.userId,
			title,
			description,
			categories,
			requiredSkills,
			lookingForRoles,
			isRemote,
			location,
			community: communityId,
			hashtags: extractHashtags(`${title} ${description}`),
			category,
			skillsNeeded,
			teamSizeNeeded,
			deadline: deadline ? new Date(deadline) : null,
			visibility,
			club: clubId,
		});
		res.status(201).json(collab);
	} catch (err) {
		res.status(500).json({ message: "Error creating collab" });
	}
};

// Public: create a user (general) and collab in one step
const createUserAndCollab = async (req, res) => {
	try {
		const {
			name,
			email,
			password,
			title,
			description,
			categories = [],
			requiredSkills = [],
			lookingForRoles = [],
			isRemote = true,
			location = "",
			communityId = null,
			category = "Project",
			skillsNeeded = [],
			teamSizeNeeded = "",
			deadline = null,
			visibility = "public",
			clubId = null,
		} = req.body;

		if (!name || !email || !password || !title || !description) {
			return res.status(400).json({ message: "Missing required fields" });
		}

		let user = await User.findOne({ email: email });
		let isNewUser = false;
		if (!user) {
			const hashedPassword = await bcrypt.hash(password, 10);
			const defaultAvatar = "https://raw.githubusercontent.com/nz-m/public-files/main/dp.jpg";
			user = await User.create({
				name,
				email,
				password: hashedPassword,
				role: "general",
				avatar: defaultAvatar,
			});
			isNewUser = true;
		}

		const collab = await Collab.create({
			user: user._id,
			title,
			description,
			categories,
			requiredSkills,
			lookingForRoles,
			isRemote,
			location,
			community: communityId,
			hashtags: extractHashtags(`${title} ${description}`),
			category,
			skillsNeeded,
			teamSizeNeeded,
			deadline: deadline ? new Date(deadline) : null,
			visibility,
			club: clubId,
		});

		const payload = { id: user._id, email: user.email };
		const accessToken = jwt.sign(
			payload,
			process.env.SECRET || "dev_secret_change_me",
			{ expiresIn: "6h" }
		);

		return res.status(isNewUser ? 201 : 200).json({
			message: isNewUser ? "User and collab created" : "Collab created for existing user",
			user: { _id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
			collab,
			accessToken,
		});
	} catch (err) {
		return res.status(500).json({ message: "Error creating user and collab" });
	}
};

const listCollabs = async (req, res) => {
	try {
		const { q = "", status = "open", limit = 20, skip = 0, tag, category, skills, role, year, branch } = req.query;
		const filter = { status };
		if (q) filter.$text = { $search: q };
		if (tag) filter.hashtags = tag.toLowerCase();
		if (category) filter.category = category;
		if (skills) {
			const skillsArr = skills.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
			if (skillsArr.length) filter.$or = [{ skillsNeeded: { $in: skillsArr } }, { requiredSkills: { $in: skillsArr } }];
		}

		// Role/year/branch user filtering
		let userFilterIds = null;
		if (role || year || branch) {
			const uf = {};
			if (role === "alumni") uf.role = "alumni";
			if (role === "student") uf.role = "general";
			if (year) uf.graduationYear = Number(year);
			if (branch) uf.department = branch;
			const users = await User.find(uf).select("_id");
			userFilterIds = users.map((u) => u._id);
		}
		if (userFilterIds) filter.user = { $in: userFilterIds };

		// Visibility enforcement
		const viewerId = req.userId;
		const viewer = await User.findById(viewerId).select("role");
		const isAlumni = viewer?.role === "alumni";
		const myClubIds = await Club.find({ members: viewerId }).distinct("_id");
		filter.$and = [
			{
				$or: [
					{ visibility: "public" },
					isAlumni ? { visibility: "alumni" } : { _id: { $exists: true } },
					{ visibility: "club", club: { $in: myClubIds } },
				],
			},
		];

		const collabs = await Collab.find(filter)
			.sort({ createdAt: -1 })
			.limit(Number(limit))
			.skip(Number(skip))
			.populate("user", "name email avatar role graduationYear department")
			.populate("interestedUsers", "name email avatar role")
			.lean();

		const formatted = collabs.map((c) => ({
			...c,
			createdAt: dayjs(c.createdAt).fromNow(),
		}));
		res.json(formatted);
	} catch (err) {
		res.status(500).json({ message: "Error fetching collabs" });
	}
};

const getCollab = async (req, res) => {
	try {
		const collab = await Collab.findById(req.params.id)
			.populate("user", "name email avatar role graduationYear department")
			.populate("interestedUsers", "name email avatar role")
			.lean();
		if (!collab) return res.status(404).json({ message: "Not found" });
		res.json(collab);
	} catch (err) {
		res.status(500).json({ message: "Error fetching collab" });
	}
};

// Apply to a collab
const applyToCollab = async (req, res) => {
	try {
		const { id } = req.params;
		const { message = "" } = req.body;
		const userId = req.userId;
		const collab = await Collab.findById(id);
		if (!collab) return res.status(404).json({ message: "Not found" });
		if (String(collab.user) === String(userId)) return res.status(400).json({ message: "Cannot apply to own request" });
		const existing = collab.applicants.find((a) => String(a.user) === String(userId));
		if (existing) {
			existing.message = message;
			existing.status = "pending";
		} else {
			collab.applicants.push({ user: userId, message, status: "pending" });
		}
		await collab.save();
		res.json({ message: "Application submitted" });
	} catch (err) {
		res.status(500).json({ message: "Error applying" });
	}
};

// Accept or decline an applicant
const decideApplicant = async (req, res) => {
	try {
		const { id, applicantId } = req.params;
		const { decision } = req.body; // "accept" | "decline"
		const userId = req.userId;
		const collab = await Collab.findById(id);
		if (!collab) return res.status(404).json({ message: "Not found" });
		if (String(collab.user) !== String(userId)) return res.status(403).json({ message: "Unauthorized" });
		const applicant = collab.applicants.find((a) => String(a.user) === String(applicantId));
		if (!applicant) return res.status(404).json({ message: "Applicant not found" });
		if (decision === "accept") {
			applicant.status = "accepted";
			// create/update team conversation
			let convoId = collab.teamConversation;
			if (!convoId) {
				const participants = Array.from(new Set([collab.user, applicant.user]));
				const convo = await Conversation.create({ type: "group", name: collab.title, participants, createdBy: collab.user });
				convoId = convo._id;
				collab.teamConversation = convoId;
			} else {
				await Conversation.updateOne({ _id: convoId }, { $addToSet: { participants: applicant.user } });
			}
		} else if (decision === "decline") {
			applicant.status = "declined";
		} else {
			return res.status(400).json({ message: "Invalid decision" });
		}
		await collab.save();
		res.json({ message: `Applicant ${decision}ed` });
	} catch (err) {
		res.status(500).json({ message: "Error updating applicant" });
	}
};

const listApplicants = async (req, res) => {
	try {
		const { id } = req.params;
		const userId = req.userId;
		const collab = await Collab.findById(id).populate("applicants.user", "name avatar role");
		if (!collab) return res.status(404).json({ message: "Not found" });
		if (String(collab.user) !== String(userId)) return res.status(403).json({ message: "Unauthorized" });
		res.json(collab.applicants || []);
	} catch (err) {
		res.status(500).json({ message: "Error listing applicants" });
	}
};

const toggleInterest = async (req, res) => {
	try {
		const id = req.params.id;
		const userId = req.userId;
		const exists = await Collab.findOne({ _id: id, interestedUsers: userId });
		const update = exists
			? { $pull: { interestedUsers: userId } }
			: { $addToSet: { interestedUsers: userId } };
		await Collab.updateOne({ _id: id }, update);
		res.json({ message: exists ? "Interest removed" : "Interest added" });
	} catch (err) {
		res.status(500).json({ message: "Error updating interest" });
	}
};

const toggleBookmark = async (req, res) => {
	try {
		const id = req.params.id;
		const userId = req.userId;
		const exists = await Collab.findOne({ _id: id, bookmarkedBy: userId });
		const update = exists
			? { $pull: { bookmarkedBy: userId } }
			: { $addToSet: { bookmarkedBy: userId } };
		await Collab.updateOne({ _id: id }, update);
		res.json({ message: exists ? "Bookmark removed" : "Bookmarked" });
	} catch (err) {
		res.status(500).json({ message: "Error updating bookmark" });
	}
};

const closeCollab = async (req, res) => {
	try {
		const id = req.params.id;
		const userId = req.userId;
		const collab = await Collab.findById(id);
		if (!collab) return res.status(404).json({ message: "Not found" });
		if (String(collab.user) !== String(userId))
			return res.status(403).json({ message: "Unauthorized" });
		collab.status = "closed";
		await collab.save();
		res.json({ message: "Closed" });
	} catch (err) {
		res.status(500).json({ message: "Error closing collab" });
	}
};

module.exports = { createCollab, createUserAndCollab, listCollabs, getCollab, applyToCollab, decideApplicant, listApplicants, toggleInterest, toggleBookmark, closeCollab };