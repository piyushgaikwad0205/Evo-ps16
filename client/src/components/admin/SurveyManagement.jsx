import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiChartPie,
  HiPlus,
  HiTrash,
  HiPause,
  HiPlay,
  HiEye,
  HiXMark,
  HiCheckCircle,
} from "react-icons/hi2";
import { getAllSurveys, createSurvey, deleteSurvey, updateSurveyStatus } from "../../redux/api/adminAPI";
import { useTheme } from "../../contexts/ThemeContext";

const SurveyManagement = () => {
  const { isDarkMode } = useTheme();
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    fetchSurveys();
  }, []);

  const fetchSurveys = async () => {
    try {
      setLoading(true);
      const { error, data } = await getAllSurveys();
      if (error) throw new Error(error);
      setSurveys(data);
    } catch (err) {
      setError("Failed to fetch surveys");
      console.error("Error fetching surveys:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSurvey = async (surveyData) => {
    try {
      const { error } = await createSurvey(surveyData);
      if (error) throw new Error(error);

      await fetchSurveys();
      setShowCreateForm(false);
      showSuccess("Survey created successfully!");
    } catch (err) {
      setError("Failed to create survey");
    }
  };

  const handleDeleteSurvey = async (surveyId) => {
    if (!window.confirm("Are you sure you want to delete this survey?")) return;

    try {
      const { error } = await deleteSurvey(surveyId);
      if (error) throw new Error(error);

      await fetchSurveys();
      showSuccess("Survey deleted successfully!");
    } catch (err) {
      setError("Failed to delete survey");
    }
  };

  const handleStatusChange = async (surveyId, status) => {
    try {
      const { error } = await updateSurveyStatus(surveyId, status);
      if (error) throw new Error(error);

      await fetchSurveys();
      showSuccess(`Survey ${status} successfully!`);
    } catch (err) {
      setError("Failed to update survey status");
    }
  };

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
            Survey Management
          </h1>
          <p className={`mt-1 text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
            Create and analyze community polls and surveys
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all"
        >
          <HiPlus className="w-5 h-5" />
          Create Survey
        </button>
      </div>

      <div className={`rounded-2xl shadow-sm border overflow-hidden ${isDarkMode ? "bg-dark-bg-secondary border-white/5" : "bg-white border-gray-200"}`}>
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
          </div>
        ) : surveys.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <HiChartPie className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg">No surveys found</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="mt-4 text-blue-600 hover:underline"
            >
              Create your first survey
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className={`text-xs uppercase tracking-wider ${isDarkMode ? "text-gray-400 border-white/5" : "text-gray-500 border-gray-100"} border-b`}>
                  <th className="p-4 font-medium">Title</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium">Audience</th>
                  <th className="p-4 font-medium">Responses</th>
                  <th className="p-4 font-medium">End Date</th>
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDarkMode ? "divide-white/5" : "divide-gray-100"}`}>
                {surveys.map((survey) => (
                  <tr key={survey._id} className={`group ${isDarkMode ? "hover:bg-white/5" : "hover:bg-gray-50"}`}>
                    <td className="p-4">
                      <div className={`font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}>{survey.title}</div>
                      <div className="text-xs text-gray-500 truncate max-w-[200px]">{survey.description}</div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${survey.status === "active"
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                        : survey.status === "draft"
                          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                          : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                        }`}>
                        {survey.status}
                      </span>
                    </td>
                    <td className={`p-4 text-sm ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                      {survey.targetAudience}
                    </td>
                    <td className={`p-4 text-sm ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                      {survey.responseCount || 0}
                    </td>
                    <td className={`p-4 text-sm ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                      {new Date(survey.endDate).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => window.open(`/surveys/${survey._id}/analytics`, '_blank')}
                          className="p-2 text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors"
                          title="View Analytics"
                        >
                          <HiEye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleStatusChange(survey._id, survey.status === "active" ? "paused" : "active")}
                          className={`p-2 rounded-lg transition-colors ${survey.status === "active"
                            ? "text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
                            : "text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20"
                            }`}
                          title={survey.status === "active" ? "Pause Survey" : "Activate Survey"}
                        >
                          {survey.status === "active" ? <HiPause className="w-5 h-5" /> : <HiPlay className="w-5 h-5" />}
                        </button>
                        <button
                          onClick={() => handleDeleteSurvey(survey._id)}
                          className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Delete Survey"
                        >
                          <HiTrash className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Modal */}
      <AnimatePresence>
        {showCreateForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={`w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl p-6 ${isDarkMode ? "bg-dark-bg-secondary" : "bg-white"}`}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className={`text-xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>Create New Survey</h3>
                <button onClick={() => setShowCreateForm(false)} className={`p-1 rounded-lg ${isDarkMode ? "hover:bg-white/10" : "hover:bg-gray-100"}`}>
                  <HiXMark className={`w-6 h-6 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`} />
                </button>
              </div>
              <CreateSurveyForm
                onSubmit={handleCreateSurvey}
                onCancel={() => setShowCreateForm(false)}
                isDarkMode={isDarkMode}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Success Toast */}
      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 right-6 px-6 py-3 rounded-xl shadow-lg font-medium bg-green-600 text-white flex items-center gap-2"
          >
            <HiCheckCircle className="w-5 h-5" />
            {successMsg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const CreateSurveyForm = ({ onSubmit, onCancel, isDarkMode }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    targetAudience: "all",
    endDate: "",
    isAnonymous: false,
    maxResponses: "",
    allowMultipleResponses: false,
    sendEmailNotification: true,
    tags: "",
    questions: [
      {
        questionText: "",
        type: "text",
        required: true,
        options: [],
      },
    ],
  });

  const questionTypes = [
    { value: "text", label: "Short Text" },
    { value: "long_text", label: "Long Text" },
    { value: "multiple_choice", label: "Multiple Choice" },
    { value: "rating", label: "Rating (1-5)" },
    { value: "yes_no", label: "Yes/No" },
  ];

  const targetAudiences = [
    { value: "all", label: "All Users" },
    { value: "alumni", label: "Alumni Only" },
    { value: "students", label: "Students Only" },
    { value: "faculty", label: "Faculty Only" },
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = [...formData.questions];
    updatedQuestions[index] = {
      ...updatedQuestions[index],
      [field]: value,
    };

    if (field === "type" && value === "multiple_choice" && !updatedQuestions[index].options.length) {
      updatedQuestions[index].options = ["Option 1", "Option 2"];
    }

    setFormData((prev) => ({
      ...prev,
      questions: updatedQuestions,
    }));
  };

  const addQuestion = () => {
    setFormData((prev) => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          questionText: "",
          type: "text",
          required: true,
          options: [],
        },
      ],
    }));
  };

  const removeQuestion = (index) => {
    if (formData.questions.length > 1) {
      setFormData((prev) => ({
        ...prev,
        questions: prev.questions.filter((_, i) => i !== index),
      }));
    }
  };

  const handleOptionChange = (questionIndex, optionIndex, value) => {
    const updatedQuestions = [...formData.questions];
    updatedQuestions[questionIndex].options[optionIndex] = value;
    setFormData((prev) => ({
      ...prev,
      questions: updatedQuestions,
    }));
  };

  const addOption = (questionIndex) => {
    const updatedQuestions = [...formData.questions];
    updatedQuestions[questionIndex].options.push(
      `Option ${updatedQuestions[questionIndex].options.length + 1}`
    );
    setFormData((prev) => ({
      ...prev,
      questions: updatedQuestions,
    }));
  };

  const removeOption = (questionIndex, optionIndex) => {
    const updatedQuestions = [...formData.questions];
    updatedQuestions[questionIndex].options.splice(optionIndex, 1);
    setFormData((prev) => ({
      ...prev,
      questions: updatedQuestions,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const inputClass = `w-full px-3 py-2 rounded-xl border ${isDarkMode ? "bg-dark-bg border-white/10 text-white" : "bg-gray-50 border-gray-200 text-gray-900"} focus:ring-2 focus:ring-blue-500 outline-none`;
  const labelClass = `block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className={`p-4 rounded-xl border ${isDarkMode ? "border-white/5 bg-white/5" : "border-gray-100 bg-gray-50"}`}>
        <h3 className={`text-lg font-medium mb-4 ${isDarkMode ? "text-white" : "text-gray-900"}`}>Basic Information</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Survey Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={inputClass}
              required
            />
          </div>

          <div>
            <label className={labelClass}>Target Audience</label>
            <select
              name="targetAudience"
              value={formData.targetAudience}
              onChange={handleChange}
              className={inputClass}
            >
              {targetAudiences.map((audience) => (
                <option key={audience.value} value={audience.value}>
                  {audience.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4">
          <label className={labelClass}>Description *</label>
          <textarea
            name="description"
            rows={3}
            value={formData.description}
            onChange={handleChange}
            className={inputClass}
            required
          />
        </div>
      </div>

      {/* Settings */}
      <div className={`p-4 rounded-xl border ${isDarkMode ? "border-white/5 bg-white/5" : "border-gray-100 bg-gray-50"}`}>
        <h3 className={`text-lg font-medium mb-4 ${isDarkMode ? "text-white" : "text-gray-900"}`}>Settings</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>End Date *</label>
            <input
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              className={inputClass}
              required
            />
          </div>
          <div className="flex flex-col justify-center gap-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="isAnonymous"
                checked={formData.isAnonymous}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Anonymous Responses</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="allowMultipleResponses"
                checked={formData.allowMultipleResponses}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Allow Multiple Responses</span>
            </label>
          </div>
        </div>
      </div>

      {/* Questions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-lg font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}>Questions</h3>
          <button
            type="button"
            onClick={addQuestion}
            className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
          >
            Add Question
          </button>
        </div>

        <div className="space-y-4">
          {formData.questions.map((q, i) => (
            <div key={i} className={`p-4 rounded-xl border ${isDarkMode ? "border-white/10 bg-dark-bg" : "border-gray-200 bg-white"}`}>
              <div className="flex justify-between mb-4">
                <span className={`text-sm font-bold ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Question {i + 1}</span>
                {formData.questions.length > 1 && (
                  <button type="button" onClick={() => removeQuestion(i)} className="text-red-500 hover:text-red-700">
                    <HiTrash className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="md:col-span-2">
                  <input
                    type="text"
                    value={q.questionText}
                    onChange={(e) => handleQuestionChange(i, "questionText", e.target.value)}
                    placeholder="Enter your question"
                    className={inputClass}
                  />
                </div>
                <div>
                  <select
                    value={q.type}
                    onChange={(e) => handleQuestionChange(i, "type", e.target.value)}
                    className={inputClass}
                  >
                    {questionTypes.map((qt) => (
                      <option key={qt.value} value={qt.value}>{qt.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {q.type === "multiple_choice" && (
                <div className="pl-4 border-l-2 border-blue-500/20 space-y-2">
                  {q.options.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => handleOptionChange(i, idx, e.target.value)}
                        className={`flex-1 px-2 py-1 text-sm bg-transparent border-b ${isDarkMode ? "border-white/10 text-white" : "border-gray-300 text-gray-900"} focus:border-blue-500 outline-none`}
                      />
                      <button
                        type="button"
                        onClick={() => removeOption(i, idx)}
                        className="text-red-400 hover:text-red-600"
                      >
                        <HiXMark className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addOption(i)}
                    className="text-sm text-blue-500 hover:text-blue-600 font-medium mt-2"
                  >
                    + Add Option
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3 pt-4 border-t dark:border-white/10">
        <button
          type="button"
          onClick={onCancel}
          className={`flex-1 px-4 py-2 rounded-xl border ${isDarkMode ? "border-white/10 text-gray-300 hover:bg-white/5" : "border-gray-200 text-gray-700 hover:bg-gray-50"}`}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium shadow-lg shadow-blue-500/20"
        >
          Create Survey
        </button>
      </div>
    </form>
  );
};

export default SurveyManagement;