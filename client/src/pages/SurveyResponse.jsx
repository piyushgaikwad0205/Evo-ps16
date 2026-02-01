import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getSurveyById, submitSurveyResponse } from '../redux/api/surveyAPI';
import { useTheme } from '../contexts/ThemeContext';
import {
  ArrowLeft,
  Clock,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  FileText,
  Lock,
  Send
} from 'lucide-react';
import CommonLoading from '../components/loader/CommonLoading';

const SurveyResponse = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();

  const [survey, setSurvey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [answers, setAnswers] = useState({});

  useEffect(() => {
    const fetchSurvey = async () => {
      try {
        setLoading(true);
        const { error, data } = await getSurveyById(id);

        if (error) {
          throw new Error(error);
        }

        setSurvey(data);

        // Initialize answers state
        const initialAnswers = {};
        data.questions.forEach(question => {
          initialAnswers[question._id] = '';
        });
        setAnswers(initialAnswers);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchSurvey();
    }
  }, [id]);

  const handleAnswerChange = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required questions
    const requiredQuestions = survey.questions.filter(q => q.required);
    for (const question of requiredQuestions) {
      if (!answers[question._id] || answers[question._id].trim() === '') {
        alert(`Please answer the required question: ${question.questionText}`);
        return;
      }
    }

    // Prepare answers for submission
    const answersArray = Object.keys(answers).map(questionId => ({
      questionId,
      answer: answers[questionId]
    }));

    try {
      setSubmitting(true);
      const { error } = await submitSurveyResponse(id, answersArray);

      if (error) {
        throw new Error(error);
      }

      setSuccess(true);
      setTimeout(() => {
        navigate(`/surveys/${id}`);
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? "bg-dark-bg" : "bg-gray-50"}`}>
        <CommonLoading />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen ${isDarkMode ? "bg-dark-bg" : "bg-gray-50"} py-8`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`rounded-xl border p-6 ${isDarkMode ? "bg-dark-bg-secondary border-white/10" : "bg-white border-gray-200"}`}>
            <div className="text-center py-12">
              <AlertCircle className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? "text-red-400" : "text-red-500"}`} />
              <h3 className={`text-lg font-bold mb-2 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                Error Loading Survey
              </h3>
              <p className={`mb-6 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>{error}</p>
              <Link
                to="/surveys"
                className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all ${isDarkMode
                    ? "bg-gradient-to-r from-orange-600/20 via-red-500/20 to-yellow-500/20 hover:from-orange-600/30 hover:via-red-500/30 hover:to-yellow-500/30 text-orange-400 border-2 border-orange-500/30 hover:border-orange-500/50"
                    : "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg hover:shadow-xl"
                  }`}
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Surveys
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!survey) {
    return (
      <div className={`min-h-screen ${isDarkMode ? "bg-dark-bg" : "bg-gray-50"} py-8`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`rounded-xl border p-6 ${isDarkMode ? "bg-dark-bg-secondary border-white/10" : "bg-white border-gray-200"}`}>
            <div className="text-center py-12">
              <FileText className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? "text-gray-600" : "text-gray-400"}`} />
              <h3 className={`text-lg font-bold mb-2 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                Survey Not Found
              </h3>
              <p className={`mb-6 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                The survey you're looking for doesn't exist or has been removed.
              </p>
              <Link
                to="/surveys"
                className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all ${isDarkMode
                    ? "bg-gradient-to-r from-orange-600/20 via-red-500/20 to-yellow-500/20 hover:from-orange-600/30 hover:via-red-500/30 hover:to-yellow-500/30 text-orange-400 border-2 border-orange-500/30 hover:border-orange-500/50"
                    : "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg hover:shadow-xl"
                  }`}
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Surveys
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className={`min-h-screen ${isDarkMode ? "bg-dark-bg" : "bg-gray-50"} py-8`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`rounded-xl border p-6 ${isDarkMode ? "bg-dark-bg-secondary border-white/10" : "bg-white border-gray-200"}`}>
            <div className="text-center py-12">
              <CheckCircle2 className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? "text-green-400" : "text-green-500"}`} />
              <h3 className={`text-lg font-bold mb-2 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                Survey Submitted Successfully!
              </h3>
              <p className={`mb-4 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                Thank you for completing this survey. Your response has been recorded.
              </p>
              <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                Redirecting to survey details...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Check if user can respond
  const canRespond = () => {
    if (survey.status !== 'active') return false;
    if (new Date(survey.endDate) < new Date()) return false;
    if (survey.maxResponses && survey.responseCount >= survey.maxResponses) return false;
    if (survey.hasResponded) return false;
    return true;
  };

  if (!canRespond()) {
    return (
      <div className={`min-h-screen ${isDarkMode ? "bg-dark-bg" : "bg-gray-50"} py-8`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`rounded-xl border p-6 ${isDarkMode ? "bg-dark-bg-secondary border-white/10" : "bg-white border-gray-200"}`}>
            <div className="text-center py-12">
              <Lock className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? "text-gray-600" : "text-gray-400"}`} />
              <h3 className={`text-lg font-bold mb-2 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                Survey Not Available
              </h3>
              <p className={`mb-6 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                {survey.hasResponded
                  ? "You've already completed this survey."
                  : "This survey is not currently accepting responses."
                }
              </p>
              <Link
                to={`/surveys/${id}`}
                className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all ${isDarkMode
                    ? "bg-gradient-to-r from-orange-600/20 via-red-500/20 to-yellow-500/20 hover:from-orange-600/30 hover:via-red-500/30 hover:to-yellow-500/30 text-orange-400 border-2 border-orange-500/30 hover:border-orange-500/50"
                    : "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg hover:shadow-xl"
                  }`}
              >
                View Survey Details
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? "bg-dark-bg" : "bg-gray-50"} transition-colors py-8`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(`/surveys/${id}`)}
          className={`inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-xl font-semibold text-sm transition-all ${isDarkMode
              ? "text-orange-400 hover:bg-white/5"
              : "text-orange-600 hover:bg-orange-50"
            }`}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Survey Details
        </button>

        {/* Header Card */}
        <div className={`rounded-xl border mb-6 ${isDarkMode ? "bg-dark-bg-secondary border-white/10" : "bg-white border-gray-200"}`}>
          <div className="p-6">
            <h1 className={`text-3xl font-bold mb-3 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
              {survey.title}
            </h1>
            <p className={`text-base leading-relaxed mb-6 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
              {survey.description}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className={`p-4 rounded-xl border ${isDarkMode ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-200"}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Clock className={`w-4 h-4 ${isDarkMode ? "text-orange-400" : "text-orange-600"}`} />
                  <h3 className={`text-xs font-semibold uppercase tracking-wider ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                    End Date
                  </h3>
                </div>
                <p className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                  {formatDate(survey.endDate)}
                </p>
              </div>

              <div className={`p-4 rounded-xl border ${isDarkMode ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-200"}`}>
                <div className="flex items-center gap-2 mb-2">
                  <HelpCircle className={`w-4 h-4 ${isDarkMode ? "text-orange-400" : "text-orange-600"}`} />
                  <h3 className={`text-xs font-semibold uppercase tracking-wider ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                    Questions
                  </h3>
                </div>
                <p className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                  {survey.questions?.length || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Survey Form */}
        <div className={`rounded-xl border ${isDarkMode ? "bg-dark-bg-secondary border-white/10" : "bg-white border-gray-200"}`}>
          <div className="p-6">
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                {survey.questions && survey.questions.map((question, index) => (
                  <div
                    key={question._id}
                    className={`p-5 rounded-xl border ${isDarkMode ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-200"}`}
                  >
                    <div className="flex items-start gap-3 mb-4">
                      <span className={`flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-lg font-bold text-sm ${isDarkMode
                          ? "bg-orange-500/20 text-orange-400"
                          : "bg-orange-100 text-orange-700"
                        }`}>
                        {index + 1}
                      </span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className={`font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                            {question.questionText}
                          </h3>
                          {question.required && (
                            <span className="text-xs font-semibold text-red-500">* Required</span>
                          )}
                        </div>
                        <div className={`text-xs font-semibold mt-1 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                          {question.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </div>
                      </div>
                    </div>

                    <div className="ml-11">
                      {question.type === 'text' && (
                        <input
                          type="text"
                          value={answers[question._id] || ''}
                          onChange={(e) => handleAnswerChange(question._id, e.target.value)}
                          className={`w-full px-4 py-3 rounded-xl border transition-all ${isDarkMode
                              ? "bg-dark-bg border-white/10 text-white placeholder-gray-500 focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20"
                              : "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                            }`}
                          placeholder="Enter your answer..."
                        />
                      )}

                      {question.type === 'long_text' && (
                        <textarea
                          rows={4}
                          value={answers[question._id] || ''}
                          onChange={(e) => handleAnswerChange(question._id, e.target.value)}
                          className={`w-full px-4 py-3 rounded-xl border transition-all ${isDarkMode
                              ? "bg-dark-bg border-white/10 text-white placeholder-gray-500 focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20"
                              : "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                            }`}
                          placeholder="Enter your detailed answer..."
                        />
                      )}

                      {question.type === 'multiple_choice' && question.options && (
                        <div className="space-y-3">
                          {question.options.map((option, optionIndex) => (
                            <label key={optionIndex} className={`flex items-center p-3 rounded-lg cursor-pointer transition-all ${answers[question._id] === option
                                ? isDarkMode
                                  ? "bg-orange-500/20 border-2 border-orange-500/40"
                                  : "bg-orange-50 border-2 border-orange-300"
                                : isDarkMode
                                  ? "hover:bg-white/5 border-2 border-transparent"
                                  : "hover:bg-gray-100 border-2 border-transparent"
                              }`}>
                              <input
                                type="radio"
                                name={`question-${question._id}`}
                                value={option}
                                checked={answers[question._id] === option}
                                onChange={(e) => handleAnswerChange(question._id, e.target.value)}
                                className="h-4 w-4 text-orange-600 focus:ring-orange-500"
                              />
                              <span className={`ml-3 ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}>
                                {option}
                              </span>
                            </label>
                          ))}
                        </div>
                      )}

                      {question.type === 'rating' && (
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map(rating => (
                            <label key={rating} className={`flex-1 text-center p-3 rounded-lg cursor-pointer transition-all ${parseInt(answers[question._id]) === rating
                                ? isDarkMode
                                  ? "bg-orange-500/20 border-2 border-orange-500/40"
                                  : "bg-orange-50 border-2 border-orange-300"
                                : isDarkMode
                                  ? "hover:bg-white/5 border-2 border-white/10"
                                  : "hover:bg-gray-100 border-2 border-gray-200"
                              }`}>
                              <input
                                type="radio"
                                name={`question-${question._id}`}
                                value={rating}
                                checked={parseInt(answers[question._id]) === rating}
                                onChange={(e) => handleAnswerChange(question._id, e.target.value)}
                                className="sr-only"
                              />
                              <span className={`font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                                {rating}
                              </span>
                            </label>
                          ))}
                        </div>
                      )}

                      {question.type === 'yes_no' && (
                        <div className="flex gap-4">
                          {['Yes', 'No'].map(option => (
                            <label key={option} className={`flex-1 text-center p-3 rounded-lg cursor-pointer transition-all ${answers[question._id] === option
                                ? isDarkMode
                                  ? "bg-orange-500/20 border-2 border-orange-500/40"
                                  : "bg-orange-50 border-2 border-orange-300"
                                : isDarkMode
                                  ? "hover:bg-white/5 border-2 border-white/10"
                                  : "hover:bg-gray-100 border-2 border-gray-200"
                              }`}>
                              <input
                                type="radio"
                                name={`question-${question._id}`}
                                value={option}
                                checked={answers[question._id] === option}
                                onChange={(e) => handleAnswerChange(question._id, e.target.value)}
                                className="sr-only"
                              />
                              <span className={`font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                                {option}
                              </span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className={`mt-8 pt-6 border-t ${isDarkMode ? "border-white/10" : "border-gray-200"} flex justify-end`}>
                <button
                  type="submit"
                  disabled={submitting}
                  className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-sm transition-all ${submitting
                      ? isDarkMode
                        ? "bg-gray-500/20 text-gray-500 cursor-not-allowed border-2 border-gray-500/40"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : isDarkMode
                        ? "bg-gradient-to-r from-orange-600/20 via-red-500/20 to-yellow-500/20 hover:from-orange-600/30 hover:via-red-500/30 hover:to-yellow-500/30 text-orange-400 border-2 border-orange-500/30 hover:border-orange-500/50"
                        : "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg hover:shadow-xl"
                    }`}
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Submit Survey
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SurveyResponse;