import { useState } from "react";
import { API } from "../redux/api/utils";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";

// Maharashtra major cities
const maharashtraCities = [
  "Mumbai", "Pune", "Nagpur", "Nashik", "Thane",
  "Aurangabad", "Solapur", "Kolhapur", "Amravati",
  "Nanded", "Sangli", "Jalgaon", "Akola", "Latur", "Panvel"
];

const categories = ['Academic', 'Research', 'Project', 'Startup', 'Competition', 'Hackathon', 'Workshop', 'Other'];

export default function CollabCreate() {
  const { isDarkMode } = useTheme();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isRemote, setIsRemote] = useState(true);
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("Project");
  const [skillsNeeded, setSkillsNeeded] = useState("");
  const [teamSizeNeeded, setTeamSizeNeeded] = useState("");
  const [deadline, setDeadline] = useState("");
  const [visibility, setVisibility] = useState("public");
  const [clubId, setClubId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();

  const submit = async () => {
    if (!title.trim() || !description.trim()) {
      alert("Title and Description are required.");
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        isRemote,
        location: isRemote ? "" : location,
        category,
        skillsNeeded: skillsNeeded.split(",").map((s) => s.trim()).filter(Boolean),
        teamSizeNeeded: teamSizeNeeded ? Number(teamSizeNeeded) : undefined,
        deadline: deadline || null,
        visibility,
        clubId: visibility === "club" ? clubId || null : null,
      };
      await API.post(`/collabs`, payload);
      navigate(`/collabs`);
    } catch (e) {
      console.error(e);
      alert("Failed to create collaboration. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? "bg-dark-bg" : "bg-gray-50"} py-8 px-4`}>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/collabs')}
            className={`flex items-center gap-2 mb-4 text-sm font-medium ${isDarkMode ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-gray-900"} transition-colors`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Collaborations
          </button>
          <h1 className={`text-3xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"} mb-2`}>
            Create Collaboration
          </h1>
          <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
            Find the perfect teammates for your next project
          </p>
        </div>

        {/* Form */}
        <div className={`${isDarkMode ? "bg-dark-bg-secondary border-white/5" : "bg-white border-gray-200"} rounded-2xl border-2 p-6 md:p-8 space-y-6`}>
          {/* Title */}
          <div>
            <label className={`block text-sm font-bold mb-2 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Looking for Full-Stack Developer for EdTech Startup"
              className={`w-full px-4 py-3 border-2 ${isDarkMode ? "bg-dark-bg border-white/10 text-white placeholder-gray-500" : "bg-white border-gray-200 text-gray-900 placeholder-gray-400"} rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all`}
            />
          </div>

          {/* Description */}
          <div>
            <label className={`block text-sm font-bold mb-2 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={6}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your project, goals, and what you're looking for in a collaborator..."
              className={`w-full px-4 py-3 border-2 ${isDarkMode ? "bg-dark-bg border-white/10 text-white placeholder-gray-500" : "bg-white border-gray-200 text-gray-900 placeholder-gray-400"} rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all resize-none`}
            />
          </div>

          {/* Category & Team Size */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-bold mb-2 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={`w-full px-4 py-3 border-2 ${isDarkMode ? "bg-dark-bg border-white/10 text-white" : "bg-white border-gray-200 text-gray-900"} rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all appearance-none cursor-pointer`}
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={`block text-sm font-bold mb-2 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                Team Size Needed
              </label>
              <input
                type="number"
                value={teamSizeNeeded}
                onChange={(e) => setTeamSizeNeeded(e.target.value)}
                placeholder="e.g., 3"
                min="1"
                className={`w-full px-4 py-3 border-2 ${isDarkMode ? "bg-dark-bg border-white/10 text-white placeholder-gray-500" : "bg-white border-gray-200 text-gray-900 placeholder-gray-400"} rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all`}
              />
            </div>
          </div>

          {/* Skills Needed */}
          <div>
            <label className={`block text-sm font-bold mb-2 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
              Required Skills
            </label>
            <input
              type="text"
              value={skillsNeeded}
              onChange={(e) => setSkillsNeeded(e.target.value)}
              placeholder="React, Node.js, MongoDB, UI/UX Design (comma-separated)"
              className={`w-full px-4 py-3 border-2 ${isDarkMode ? "bg-dark-bg border-white/10 text-white placeholder-gray-500" : "bg-white border-gray-200 text-gray-900 placeholder-gray-400"} rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all`}
            />
            <p className={`text-xs mt-1.5 ${isDarkMode ? "text-gray-500" : "text-gray-500"}`}>
              Separate skills with commas
            </p>
          </div>

          {/* Deadline */}
          <div>
            <label className={`block text-sm font-bold mb-2 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
              Deadline
            </label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className={`w-full px-4 py-3 border-2 ${isDarkMode ? "bg-dark-bg border-white/10 text-white" : "bg-white border-gray-200 text-gray-900"} rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all`}
            />
          </div>

          {/* Location Section */}
          <div className={`p-4 ${isDarkMode ? "bg-white/5" : "bg-gray-50"} rounded-xl space-y-4`}>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="remote"
                checked={isRemote}
                onChange={(e) => setIsRemote(e.target.checked)}
                className="w-5 h-5 rounded border-2 border-orange-500 text-orange-500 focus:ring-2 focus:ring-orange-500 cursor-pointer"
              />
              <label htmlFor="remote" className={`text-sm font-bold cursor-pointer ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                Remote Collaboration
              </label>
            </div>

            {!isRemote && (
              <div>
                <label className={`block text-sm font-bold mb-2 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                  Location
                </label>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className={`w-full px-4 py-3 border-2 ${isDarkMode ? "bg-dark-bg border-white/10 text-white" : "bg-white border-gray-200 text-gray-900"} rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all appearance-none cursor-pointer`}
                >
                  <option value="">Select city</option>
                  {maharashtraCities.map((city) => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Visibility */}
          <div>
            <label className={`block text-sm font-bold mb-2 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
              Visibility
            </label>
            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value)}
              className={`w-full px-4 py-3 border-2 ${isDarkMode ? "bg-dark-bg border-white/10 text-white" : "bg-white border-gray-200 text-gray-900"} rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all appearance-none cursor-pointer`}
            >
              <option value="public">Public - Everyone can see</option>
              <option value="alumni">Alumni Only</option>
              <option value="club">Club Only</option>
            </select>
          </div>

          {visibility === "club" && (
            <div>
              <label className={`block text-sm font-bold mb-2 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                Club ID
              </label>
              <input
                type="text"
                placeholder="Enter club ID"
                value={clubId}
                onChange={(e) => setClubId(e.target.value)}
                className={`w-full px-4 py-3 border-2 ${isDarkMode ? "bg-dark-bg border-white/10 text-white placeholder-gray-500" : "bg-white border-gray-200 text-gray-900 placeholder-gray-400"} rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all`}
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              onClick={() => navigate('/collabs')}
              className={`flex-1 px-6 py-3 border-2 ${isDarkMode ? "border-white/10 text-white hover:bg-white/5" : "border-gray-200 text-gray-700 hover:bg-gray-50"} rounded-xl transition-all font-bold text-sm`}
            >
              Cancel
            </button>
            <button
              onClick={submit}
              disabled={submitting || !title.trim() || !description.trim()}
              className={`flex-1 px-6 py-3 bg-gradient-to-r from-orange-600 via-red-500 to-yellow-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-orange-500/30 transition-all ${submitting || !title.trim() || !description.trim()
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:opacity-90"
                }`}
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Publishing...
                </span>
              ) : (
                "Publish Collaboration"
              )}
            </button>
          </div>
        </div>

        {/* Tips Section */}
        <div className={`mt-6 p-4 ${isDarkMode ? "bg-orange-500/10 border-orange-500/20" : "bg-orange-50 border-orange-200"} border-2 rounded-xl`}>
          <h3 className={`text-sm font-bold mb-2 ${isDarkMode ? "text-orange-400" : "text-orange-700"}`}>
            💡 Tips for a Great Collaboration Post
          </h3>
          <ul className={`text-xs space-y-1 ${isDarkMode ? "text-orange-300/80" : "text-orange-600"}`}>
            <li>• Be specific about your project goals and requirements</li>
            <li>• List the exact skills you're looking for</li>
            <li>• Mention the time commitment expected</li>
            <li>• Include any relevant links or resources</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
