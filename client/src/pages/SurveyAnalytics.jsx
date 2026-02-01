import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getSurveyById, getSurveyAnalytics } from '../redux/api/surveyAPI';
import { useTheme } from '../contexts/ThemeContext';
import {
  ArrowLeft,
  Users,
  TrendingUp,
  HelpCircle,
  BarChart3,
  PieChart,
  AlertCircle,
  Lock,
  Star
} from 'lucide-react';
import CommonLoading from '../components/loader/CommonLoading';

const SurveyAnalytics = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const { userData: user } = useSelector((state) => state.auth);

  const [survey, setSurvey] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch survey details
        const surveyResponse = await getSurveyById(id);
        if (surveyResponse.error) {
          throw new Error(surveyResponse.error);
        }
        setSurvey(surveyResponse.data);

        // Fetch analytics
        const analyticsResponse = await getSurveyAnalytics(id);
        if (analyticsResponse.error) {
          throw new Error(analyticsResponse.error);
        }
        setAnalytics(analyticsResponse.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

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
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`rounded-xl border p-6 ${isDarkMode ? "bg-dark-bg-secondary border-white/10" : "bg-white border-gray-200"}`}>
            <div className="text-center py-12">
              <AlertCircle className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? "text-red-400" : "text-red-500"}`} />
              <h3 className={`text-lg font-bold mb-2 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                Error Loading Analytics
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

  if (!survey || !analytics) {
    return (
      <div className={`min-h-screen ${isDarkMode ? "bg-dark-bg" : "bg-gray-50"} py-8`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`rounded-xl border p-6 ${isDarkMode ? "bg-dark-bg-secondary border-white/10" : "bg-white border-gray-200"}`}>
            <div className="text-center py-12">
              <BarChart3 className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? "text-gray-600" : "text-gray-400"}`} />
              <h3 className={`text-lg font-bold mb-2 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                Analytics Not Found
              </h3>
              <p className={`mb-6 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                The analytics data you're looking for doesn't exist or is not accessible.
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

  // Check if user has permission to view analytics
  const canViewAnalytics = user?.role === 'admin' || survey.createdBy?._id === user?.id;

  if (!canViewAnalytics) {
    return (
      <div className={`min-h-screen ${isDarkMode ? "bg-dark-bg" : "bg-gray-50"} py-8`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`rounded-xl border p-6 ${isDarkMode ? "bg-dark-bg-secondary border-white/10" : "bg-white border-gray-200"}`}>
            <div className="text-center py-12">
              <Lock className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? "text-gray-600" : "text-gray-400"}`} />
              <h3 className={`text-lg font-bold mb-2 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                Access Denied
              </h3>
              <p className={`mb-6 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                You don't have permission to view analytics for this survey.
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(`/surveys/${id}`)}
          className={`inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-xl font-semibold text-sm transition-all ${isDarkMode
              ? "text-orange-400 hover:bg-white/5"
              : "text-orange-600 hover:bg-orange-50"
            }`}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Survey
        </button>

        {/* Header */}
        <div className={`rounded-xl border mb-6 ${isDarkMode ? "bg-dark-bg-secondary border-white/10" : "bg-white border-gray-200"}`}>
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-3 rounded-xl ${isDarkMode ? "bg-gradient-to-r from-orange-600/20 via-red-500/20 to-yellow-500/20 border border-orange-500/30" : "bg-gradient-to-r from-orange-100 to-yellow-100 border border-orange-300"}`}>
                <BarChart3 className={`w-6 h-6 ${isDarkMode ? "text-orange-400" : "text-orange-600"}`} />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                  {survey.title} - Analytics
                </h1>
                <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                  Detailed insights and statistics for this survey
                </p>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
              <div className={`p-4 rounded-xl border ${isDarkMode ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-200"}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Users className={`w-5 h-5 ${isDarkMode ? "text-orange-400" : "text-orange-600"}`} />
                  <h3 className={`text-xs font-semibold uppercase tracking-wider ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                    Total Responses
                  </h3>
                </div>
                <p className={`text-3xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                  {analytics.totalResponses}
                </p>
              </div>

              <div className={`p-4 rounded-xl border ${isDarkMode ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-200"}`}>
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className={`w-5 h-5 ${isDarkMode ? "text-orange-400" : "text-orange-600"}`} />
                  <h3 className={`text-xs font-semibold uppercase tracking-wider ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                    Response Rate
                  </h3>
                </div>
                <p className={`text-3xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                  {analytics.responseRate}
                </p>
              </div>

              <div className={`p-4 rounded-xl border ${isDarkMode ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-200"}`}>
                <div className="flex items-center gap-2 mb-2">
                  <HelpCircle className={`w-5 h-5 ${isDarkMode ? "text-orange-400" : "text-orange-600"}`} />
                  <h3 className={`text-xs font-semibold uppercase tracking-wider ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                    Questions
                  </h3>
                </div>
                <p className={`text-3xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                  {survey.questions?.length || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Demographics */}
        <div className={`rounded-xl border mb-6 ${isDarkMode ? "bg-dark-bg-secondary border-white/10" : "bg-white border-gray-200"}`}>
          <div className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <PieChart className={`w-5 h-5 ${isDarkMode ? "text-orange-400" : "text-orange-600"}`} />
              <h2 className={`text-xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                Demographics
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* By Graduation Year */}
              <div>
                <h3 className={`font-bold mb-4 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                  By Graduation Year
                </h3>
                {Object.keys(analytics.demographics.byGraduationYear).length > 0 ? (
                  <div className="space-y-3">
                    {Object.entries(analytics.demographics.byGraduationYear)
                      .sort((a, b) => b[1] - a[1])
                      .map(([year, count]) => {
                        const total = Object.values(analytics.demographics.byGraduationYear).reduce((a, b) => a + b, 0);
                        const percentage = Math.round((count / total) * 100);
                        return (
                          <div key={year}>
                            <div className="flex justify-between mb-1">
                              <span className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>{year}</span>
                              <span className={`text-sm font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>{count} ({percentage}%)</span>
                            </div>
                            <div className={`w-full rounded-full h-2 ${isDarkMode ? "bg-white/10" : "bg-gray-200"}`}>
                              <div
                                className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                ) : (
                  <p className={`text-sm ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>No data available</p>
                )}
              </div>

              {/* By Department */}
              <div>
                <h3 className={`font-bold mb-4 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                  By Department
                </h3>
                {Object.keys(analytics.demographics.byDepartment).length > 0 ? (
                  <div className="space-y-3">
                    {Object.entries(analytics.demographics.byDepartment)
                      .sort((a, b) => b[1] - a[1])
                      .map(([department, count]) => {
                        const total = Object.values(analytics.demographics.byDepartment).reduce((a, b) => a + b, 0);
                        const percentage = Math.round((count / total) * 100);
                        return (
                          <div key={department}>
                            <div className="flex justify-between mb-1">
                              <span className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>{department}</span>
                              <span className={`text-sm font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>{count} ({percentage}%)</span>
                            </div>
                            <div className={`w-full rounded-full h-2 ${isDarkMode ? "bg-white/10" : "bg-gray-200"}`}>
                              <div
                                className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                ) : (
                  <p className={`text-sm ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>No data available</p>
                )}
              </div>

              {/* By Role */}
              <div>
                <h3 className={`font-bold mb-4 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                  By Role
                </h3>
                {Object.keys(analytics.demographics.byRole).length > 0 ? (
                  <div className="space-y-3">
                    {Object.entries(analytics.demographics.byRole)
                      .sort((a, b) => b[1] - a[1])
                      .map(([role, count]) => {
                        const total = Object.values(analytics.demographics.byRole).reduce((a, b) => a + b, 0);
                        const percentage = Math.round((count / total) * 100);
                        return (
                          <div key={role}>
                            <div className="flex justify-between mb-1">
                              <span className={`text-sm capitalize ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>{role}</span>
                              <span className={`text-sm font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>{count} ({percentage}%)</span>
                            </div>
                            <div className={`w-full rounded-full h-2 ${isDarkMode ? "bg-white/10" : "bg-gray-200"}`}>
                              <div
                                className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                ) : (
                  <p className={`text-sm ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>No data available</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Question Analytics */}
        <div className={`rounded-xl border ${isDarkMode ? "bg-dark-bg-secondary border-white/10" : "bg-white border-gray-200"}`}>
          <div className="p-6">
            <h2 className={`text-xl font-bold mb-6 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
              Question Analytics
            </h2>

            <div className="space-y-6">
              {analytics.questionAnalytics.map((question, index) => (
                <div
                  key={question.questionId}
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
                      <h3 className={`font-bold mb-1 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                        {question.questionText}
                      </h3>
                      <div className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                        Type: {question.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} •
                        Responses: {question.totalResponses} ({question.responseRate})
                      </div>
                    </div>
                  </div>

                  <div className="ml-11">
                    {/* Multiple Choice */}
                    {question.type === 'multiple_choice' && question.optionCounts && (
                      <div className="space-y-3">
                        {Object.entries(question.optionCounts)
                          .sort((a, b) => b[1] - a[1])
                          .map(([option, count]) => {
                            const percentage = question.totalResponses > 0
                              ? Math.round((count / question.totalResponses) * 100)
                              : 0;
                            return (
                              <div key={option}>
                                <div className="flex justify-between mb-1">
                                  <span className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>{option}</span>
                                  <span className={`text-sm font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>{count} ({percentage}%)</span>
                                </div>
                                <div className={`w-full rounded-full h-3 ${isDarkMode ? "bg-white/10" : "bg-gray-200"}`}>
                                  <div
                                    className="bg-gradient-to-r from-orange-500 to-red-500 h-3 rounded-full transition-all duration-500"
                                    style={{ width: `${percentage}%` }}
                                  ></div>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    )}

                    {/* Rating */}
                    {question.type === 'rating' && question.ratingCounts && (
                      <div>
                        <div className={`flex items-center gap-2 mb-4 p-3 rounded-lg ${isDarkMode ? "bg-white/5" : "bg-white"}`}>
                          <Star className={`w-5 h-5 ${isDarkMode ? "text-yellow-400" : "text-yellow-500"}`} />
                          <span className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>Average Rating:</span>
                          <span className={`text-lg font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>{question.averageRating}/5</span>
                        </div>
                        <div className="grid grid-cols-5 gap-3">
                          {[1, 2, 3, 4, 5].map(rating => {
                            const count = question.ratingCounts[rating] || 0;
                            const percentage = question.totalResponses > 0
                              ? Math.round((count / question.totalResponses) * 100)
                              : 0;
                            return (
                              <div key={rating} className={`text-center p-3 rounded-lg ${isDarkMode ? "bg-white/5" : "bg-white"}`}>
                                <div className={`text-xs font-semibold mb-1 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>{rating}★</div>
                                <div className={`text-2xl font-bold mb-2 ${isDarkMode ? "text-white" : "text-gray-900"}`}>{count}</div>
                                <div className={`w-full rounded-full h-2 ${isDarkMode ? "bg-white/10" : "bg-gray-200"}`}>
                                  <div
                                    className="bg-gradient-to-r from-yellow-400 to-yellow-600 h-2 rounded-full transition-all duration-500"
                                    style={{ width: `${percentage}%` }}
                                  ></div>
                                </div>
                                <div className={`text-xs mt-1 ${isDarkMode ? "text-gray-500" : "text-gray-500"}`}>{percentage}%</div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Text/Other */}
                    {question.type !== 'multiple_choice' && question.type !== 'rating' && (
                      <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                        Total Responses: {question.totalResponses}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SurveyAnalytics;