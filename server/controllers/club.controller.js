const Club = require("../models/club.model");
const User = require("../models/user.model");
const { constructImageUrl } = require("../utils/imageUtils");

const listClubs = async (req, res) => {
  try {
    let filterCollegeId = null;

    // Check if Admin
    if (req.adminRole) {
      if (req.collegeId) {
        filterCollegeId = req.collegeId;
      } else if (req.adminRole === 'superadmin' && req.query.collegeId) {
        filterCollegeId = req.query.collegeId;
      }
      // If Super Admin and no query, filterCollegeId is null => Show All
    } else if (req.userId) {
      // User path
      const user = await User.findById(req.userId).select("collegeId");
      if (!user || !user.collegeId) {
        return res.status(200).json([]);
      }
      filterCollegeId = user.collegeId;
    } else {
      // Unauthenticated or unknown
      return res.status(401).json({ message: "Unauthorized" });
    }

    const query = { isActive: true };
    if (filterCollegeId) {
      query.collegeId = filterCollegeId;
    }

    const clubs = await Club.find(query)
      .select("_id name description banner icon head coHead members collegeId")
      .populate("head", "_id name avatar")
      .populate("coHead", "_id name avatar")
      .sort({ createdAt: -1 })
      .lean();
    return res.status(200).json(clubs);
  } catch (error) {
    return res.status(500).json({ message: "Error retrieving clubs" });
  }
};

const getClub = async (req, res) => {
  try {
    const { id } = req.params;
    const club = await Club.findById(id)
      .populate("head", "_id name avatar email")
      .populate("coHead", "_id name avatar email")
      .populate("members", "_id name avatar")
      .lean();
    if (!club) return res.status(404).json({ message: "Club not found" });

    // Access Control
    if (req.adminRole) {
      if (req.adminRole !== 'superadmin' && req.collegeId && club.collegeId && club.collegeId.toString() !== req.collegeId.toString()) {
        return res.status(403).json({ message: "Access denied. Club belongs to another college." });
      }
    } else if (req.userId) {
      const user = await User.findById(req.userId).select("collegeId");
      if (!user.collegeId || (club.collegeId && club.collegeId.toString() !== user.collegeId.toString())) {
        return res.status(403).json({ message: "Access denied. This club belongs to another college." });
      }
    }

    return res.status(200).json(club);
  } catch (error) {
    return res.status(500).json({ message: "Error retrieving club" });
  }
};

const createClub = async (req, res) => {
  try {
    const { name, description } = req.body;
    const existing = await Club.findOne({ name });
    if (existing) return res.status(400).json({ message: "Club already exists" });

    let banner = "";
    let icon = "";

    // Handle multiple file uploads
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        if (file.fieldname === 'banner') {
          banner = constructImageUrl(req, file.filename, "clubBanners");
        } else if (file.fieldname === 'icon') {
          icon = constructImageUrl(req, file.filename, "clubBanners");
        }
      });
    }

    let collegeId = null;

    if (req.adminRole) {
      collegeId = req.collegeId || req.body.collegeId;
      if (!collegeId) return res.status(400).json({ message: "College ID is required" });
    } else if (req.userId) {
      const user = await User.findById(req.userId).select("collegeId");
      if (!user || !user.collegeId) {
        return res.status(403).json({ message: "You must be associated with a college to create a club." });
      }
      collegeId = user.collegeId;
    } else {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const club = await Club.create({ name, description, banner, icon, collegeId });
    return res.status(201).json(club);
  } catch (error) {
    console.error('Club creation error:', error);
    return res.status(500).json({ message: "Error creating club" });
  }
};

const updateClub = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, isActive } = req.body;

    let banner = "";
    let icon = "";

    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        if (file.fieldname === 'banner') {
          banner = constructImageUrl(req, file.filename, "clubBanners");
        } else if (file.fieldname === 'icon') {
          icon = constructImageUrl(req, file.filename, "clubBanners");
        }
      });
    }

    const updateData = { name, description, isActive };
    if (banner) updateData.banner = banner;
    if (icon) updateData.icon = icon;

    const clubToUpdate = await Club.findById(id);
    if (!clubToUpdate) return res.status(404).json({ message: "Club not found" });

    // Access Control
    if (req.adminRole) {
      if (req.adminRole !== 'superadmin' && req.collegeId && clubToUpdate.collegeId && clubToUpdate.collegeId.toString() !== req.collegeId.toString()) {
        return res.status(403).json({ message: "Access denied. Cannot update club from another college." });
      }
    } else if (req.userId) {
      const user = await User.findById(req.userId).select("collegeId");
      if (!user.collegeId || (clubToUpdate.collegeId && clubToUpdate.collegeId.toString() !== user.collegeId.toString())) {
        return res.status(403).json({ message: "Access denied. Cannot update club from another college." });
      }
    }

    const updated = await Club.findByIdAndUpdate(id, updateData, { new: true });
    return res.status(200).json(updated);
  } catch (error) {
    console.error('Club update error:', error);
    return res.status(500).json({ message: "Error updating club" });
  }
};

// Join a club (any authenticated user)
const joinClub = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const club = await Club.findById(id).select("members");
    if (!club) return res.status(404).json({ message: "Club not found" });
    const already = club.members.some((m) => m.toString() === userId);
    if (already) return res.status(200).json({ message: "Already a member" });
    club.members.push(userId);
    await club.save();
    return res.status(200).json({ message: "Joined club" });
  } catch (error) {
    return res.status(500).json({ message: "Error joining club" });
  }
};

// Leave a club (any authenticated user)
const leaveClub = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const club = await Club.findById(id).select("members");
    if (!club) return res.status(404).json({ message: "Club not found" });
    club.members = club.members.filter((m) => m.toString() !== userId);
    await club.save();
    return res.status(200).json({ message: "Left club" });
  } catch (error) {
    return res.status(500).json({ message: "Error leaving club" });
  }
};

const assignHeads = async (req, res) => {
  try {
    const { id } = req.params;
    const { headId, coHeadId } = req.body;

    const club = await Club.findById(id);
    if (!club) return res.status(404).json({ message: "Club not found" });

    // Access Check (Admin only usually, but let's handle both just in case)
    if (req.adminRole) {
      if (req.adminRole !== 'superadmin' && req.collegeId && club.collegeId && club.collegeId.toString() !== req.collegeId.toString()) {
        return res.status(403).json({ message: "Access denied." });
      }
    }

    // Validate users
    const users = await User.find({ _id: { $in: [headId, coHeadId].filter(Boolean) } }).select("_id");
    const validIds = users.map((u) => u._id.toString());

    if (headId && !validIds.includes(headId)) {
      return res.status(400).json({ message: "Invalid head user" });
    }
    if (coHeadId && !validIds.includes(coHeadId)) {
      return res.status(400).json({ message: "Invalid co-head user" });
    }

    club.head = headId || null;
    club.coHead = coHeadId || null;
    await club.save();

    const populated = await Club.findById(id)
      .populate("head", "_id name avatar")
      .populate("coHead", "_id name avatar")
      .lean();

    return res.status(200).json({ message: "Heads updated", club: populated });
  } catch (error) {
    return res.status(500).json({ message: "Error assigning heads" });
  }
};

const deleteClub = async (req, res) => {
  try {
    const { id } = req.params;
    const club = await Club.findById(id);
    if (!club) return res.status(404).json({ message: "Club not found" });

    if (req.adminRole) {
      if (req.adminRole !== 'superadmin' && req.collegeId && club.collegeId && club.collegeId.toString() !== req.collegeId.toString()) {
        return res.status(403).json({ message: "Access denied." });
      }
    } else if (req.userId) {
      // Users shouldn't be deleting clubs typically, but if allowed:
      const user = await User.findById(req.userId).select("collegeId");
      if (!user.collegeId || (club.collegeId && club.collegeId.toString() !== user.collegeId.toString())) {
        return res.status(403).json({ message: "Access denied." });
      }
    }

    await Club.findByIdAndDelete(id);
    return res.status(200).json({ message: "Club deleted" });
  } catch (error) {
    return res.status(500).json({ message: "Error deleting club" });
  }
};

const removeMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    if (!userId) return res.status(400).json({ message: "User ID is required" });

    const club = await Club.findById(id);
    if (!club) return res.status(404).json({ message: "Club not found" });

    // Access Check
    if (req.adminRole) {
      if (req.adminRole !== 'superadmin' && req.collegeId && club.collegeId && club.collegeId.toString() !== req.collegeId.toString()) {
        return res.status(403).json({ message: "Access denied." });
      }
    }

    club.members = club.members.filter(m => m.toString() !== userId);

    // Also remove from head/coHead if applicable
    if (club.head?.toString() === userId) club.head = null;
    if (club.coHead?.toString() === userId) club.coHead = null;

    await club.save();

    const populated = await Club.findById(id)
      .populate("head", "_id name avatar")
      .populate("coHead", "_id name avatar")
      .populate("members", "_id name avatar email")
      .lean();

    return res.status(200).json({ message: "Member removed", club: populated });
  } catch (error) {
    console.error("Error removing member:", error);
    return res.status(500).json({ message: "Error removing member" });
  }
};

module.exports = {
  listClubs,
  getClub,
  createClub,
  updateClub,
  assignHeads,
  joinClub,
  leaveClub,
  deleteClub,
  removeMember
};

