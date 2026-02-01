import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getSurveyById, submitSurveyResponse } from '../redux/api/surveyAPI';
import { useTheme } from '../contexts/ThemeContext';
import {
    ArrowLeft,
    User,
    HelpCircle,
    Users,
    Calendar,
    Clock,
    Tag,
    BarChart3,
    CheckCircle2,
    AlertCircle,
    FileText,
    Lock,
    Send
} from 'lucide-react';
import CommonLoading from '../components/loader/CommonLoading';

const SurveyDetailsResponse = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isDarkMode } = useTheme();
    const { userData: user } = useSelector((state) => state.auth);

    const [survey, setSurvey] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [answers, setAnswers] = useState({});
    const [showResponseForm, setShowResponseForm] = useState(false);

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
            setShowResponseForm(false);
            // Refresh survey data
            const { data } = await getSurveyById(id);
            setSurvey(data);
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

    const getStatusColor = (status) => {
        switch (status) {
            case 'active':
                return isDarkMode
                    ? 'bg-green-500/20 text-green-400 border-green-500/40'
                    : 'bg-green-100 text-green-800 border-green-300';
            case 'draft':
                return isDarkMode
                    ? 'bg-gray-500/20 text-gray-400 border-gray-500/40'
                    : 'bg-gray-100 text-gray-800 border-gray-300';
            case 'paused':
                return isDarkMode
                    ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40'
                    : 'bg-yellow-100 text-yellow-800 border-yellow-300';
            case 'closed':
                return isDarkMode
                    ? 'bg-red-500/20 text-red-400 border-red-500/40'
                    : 'bg-red-100 text-red-800 border-red-300';
            default:
                return isDarkMode
                    ? 'bg-gray-500/20 text-gray-400 border-gray-500/40'
                    : 'bg-gray-100 text-gray-800 border-gray-300';
        }
    };

    const canUserRespond = () => {
        if (!survey || !user) return false;
        if (survey.status !== 'active') return false;
        if (new Date(survey.endDate) < new Date()) return false;
        if (survey.maxResponses && survey.responseCount >= survey.maxResponses) return false;
        return !survey.hasResponded;
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
                    {/* Back Button */}
                    <button
                        onClick={() => navigate('/surveys')}
                        className={`inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-xl font-semibold text-sm transition-all ${isDarkMode
                                ? "text-orange-400 hover:bg-white/5"
                                : "text-orange-600 hover:bg-orange-50"
                            }`}
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Surveys
                    </button>

                    <div className={`rounded-xl border p-6 ${isDarkMode ? "bg-dark-bg-secondary border-white/10" : "bg-white border-gray-200"}`}>
                        <div className="text-center py-12">
                            <div className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center ${isDarkMode
                                    ? "bg-green-500/20 border-2 border-green-500/40"
                                    : "bg-green-100 border-2 border-green-300"
                                }`}>
                                <CheckCircle2 className={`w-12 h-12 ${isDarkMode ? "text-green-400" : "text-green-600"}`} />
                            </div>

                            <h3 className={`text-2xl font-bold mb-3 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                                Survey Submitted Successfully!
                            </h3>

                            <p className={`text-base mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                                Thank you for completing this survey.
                            </p>

                            <p className={`text-sm mb-8 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                                Your response has been recorded and cannot be changed.
                            </p>

                            <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm border-2 mb-6 ${isDarkMode
                                    ? "bg-green-500/20 text-green-400 border-green-500/40"
                                    : "bg-green-100 text-green-800 border-green-300"
                                }`}>
                                <CheckCircle2 className="w-5 h-5" />
                                Response Submitted - No Retakes Allowed
                            </div>

                            <div>
                                <Link
                                    to="/surveys"
                                    className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all ${isDarkMode
                                            ? "bg-gradient-to-r from-orange-600/20 via-red-500/20 to-yellow-500/20 hover:from-orange-600/30 hover:via-red-500/30 hover:to-yellow-500/30 text-orange-400 border-2 border-orange-500/30 hover:border-orange-500/50"
                                            : "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg hover:shadow-xl"
                                        }`}
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    Back to All Surveys
                                </Link>
                            </div>
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
                    onClick={() => navigate('/surveys')}
                    className={`inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-xl font-semibold text-sm transition-all ${isDarkMode
                        ? "text-orange-400 hover:bg-white/5"
                        : "text-orange-600 hover:bg-orange-50"
                        }`}
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Surveys
                </button>

                {/* Header Card */}
                <div className={`rounded-xl border mb-6 overflow-hidden ${isDarkMode ? "bg-dark-bg-secondary border-white/10" : "bg-white border-gray-200"}`}>
                    <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex-1">
                                <h1 className={`text-3xl font-bold mb-3 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                                    {survey.title}
                                </h1>
                                <p className={`text-base leading-relaxed ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                                    {survey.description}
                                </p>
                            </div>
                            <span className={`px-4 py-2 rounded-xl text-sm font-bold border-2 whitespace-nowrap ml-4 ${getStatusColor(survey.status)}`}>
                                {survey.status.charAt(0).toUpperCase() + survey.status.slice(1)}
                            </span>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                            <div className={`p-4 rounded-xl border ${isDarkMode ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-200"}`}>
                                <div className="flex items-center gap-2 mb-2">
                                    <User className={`w-4 h-4 ${isDarkMode ? "text-orange-400" : "text-orange-600"}`} />
                                    <h3 className={`text-xs font-semibold uppercase tracking-wider ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                                        Created By
                                    </h3>
                                </div>
                                <p className={`font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                                    {survey.createdBy?.name || 'Admin'}
                                </p>
                            </div>

                            <div className={`p-4 rounded-xl border ${isDarkMode ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-200"}`}>
                                <div className="flex items-center gap-2 mb-2">
                                    <HelpCircle className={`w-4 h-4 ${isDarkMode ? "text-orange-400" : "text-orange-600"}`} />
                                    <h3 className={`text-xs font-semibold uppercase tracking-wider ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                                        Questions
                                    </h3>
                                </div>
                                <p className={`font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                                    {survey.questions?.length || 0}
                                </p>
                            </div>

                            <div className={`p-4 rounded-xl border ${isDarkMode ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-200"}`}>
                                <div className="flex items-center gap-2 mb-2">
                                    <Users className={`w-4 h-4 ${isDarkMode ? "text-orange-400" : "text-orange-600"}`} />
                                    <h3 className={`text-xs font-semibold uppercase tracking-wider ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                                        Responses
                                    </h3>
                                </div>
                                <p className={`font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                                    {survey.responseCount || 0}
                                </p>
                            </div>
                        </div>

                        {/* Timeline */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                            <div className={`p-4 rounded-xl border ${isDarkMode ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-200"}`}>
                                <div className="flex items-center gap-2 mb-2">
                                    <Calendar className={`w-4 h-4 ${isDarkMode ? "text-orange-400" : "text-orange-600"}`} />
                                    <h3 className={`text-xs font-semibold uppercase tracking-wider ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                                        Start Date
                                    </h3>
                                </div>
                                <p className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                                    {formatDate(survey.createdAt)}
                                </p>
                            </div>

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
                        </div>

                        {/* Tags */}
                        {survey.tags && survey.tags.length > 0 && (
                            <div className="mt-6">
                                <div className="flex items-center gap-2 mb-3">
                                    <Tag className={`w-4 h-4 ${isDarkMode ? "text-orange-400" : "text-orange-600"}`} />
                                    <h3 className={`text-xs font-semibold uppercase tracking-wider ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                                        Tags
                                    </h3>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {survey.tags.map((tag, index) => (
                                        <span
                                            key={index}
                                            className={`px-3 py-1 rounded-lg text-xs font-semibold ${isDarkMode
                                                ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                                                : "bg-orange-100 text-orange-700 border border-orange-200"
                                                }`}
                                        >
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Actions */}
                        <div className={`flex flex-wrap gap-3 mt-8 pt-6 border-t ${isDarkMode ? 'border-white/10' : 'border-gray-200'}`}>
                            {canUserRespond() && !showResponseForm && (
                                <button
                                    onClick={() => setShowResponseForm(true)}
                                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all ${isDarkMode
                                        ? "bg-gradient-to-r from-orange-600/20 via-red-500/20 to-yellow-500/20 hover:from-orange-600/30 hover:via-red-500/30 hover:to-yellow-500/30 text-orange-400 border-2 border-orange-500/30 hover:border-orange-500/50"
                                        : "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg hover:shadow-xl"
                                        }`}
                                >
                                    <FileText className="w-4 h-4" />
                                    Take Survey
                                </button>
                            )}

                            {survey.hasResponded && (
                                <span className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm border-2 ${isDarkMode
                                    ? "bg-green-500/20 text-green-400 border-green-500/40"
                                    : "bg-green-100 text-green-800 border-green-300"
                                    }`}>
                                    <CheckCircle2 className="w-4 h-4" />
                                    You've completed this survey
                                </span>
                            )}

                            {!canUserRespond() && !survey.hasResponded && (
                                <span className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm border-2 ${isDarkMode
                                    ? "bg-gray-500/20 text-gray-400 border-gray-500/40"
                                    : "bg-gray-100 text-gray-600 border-gray-300"
                                    }`}>
                                    <Lock className="w-4 h-4" />
                                    Survey Not Available
                                </span>
                            )}

                            {user?.role === 'admin' && (
                                <Link
                                    to={`/surveys/${survey._id}/analytics`}
                                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all border-2 ${isDarkMode
                                        ? "bg-white/5 hover:bg-white/10 text-orange-400 border-orange-500/30 hover:border-orange-500/50"
                                        : "bg-white hover:bg-orange-50 text-orange-600 border-orange-300 hover:border-orange-400"
                                        }`}
                                >
                                    <BarChart3 className="w-4 h-4" />
                                    View Analytics
                                </Link>
                            )}
                        </div>
                    </div>
                </div>

                {/* Response Form (Conditional) */}
                {showResponseForm && canUserRespond() ? (
                    <div className={`rounded-xl border ${isDarkMode ? "bg-dark-bg-secondary border-white/10" : "bg-white border-gray-200"}`}>
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                                    Your Response
                                </h2>
                                <button
                                    onClick={() => setShowResponseForm(false)}
                                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${isDarkMode
                                        ? "text-gray-400 hover:text-white hover:bg-white/5"
                                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                                        }`}
                                >
                                    Cancel
                                </button>
                            </div>

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

                                <div className={`mt-8 pt-6 border-t ${isDarkMode ? "border-white/10" : "border-gray-200"} flex justify-end gap-3`}>
                                    <button
                                        type="button"
                                        onClick={() => setShowResponseForm(false)}
                                        className={`px-6 py-3 rounded-xl font-bold text-sm transition-all border-2 ${isDarkMode
                                            ? "bg-white/5 hover:bg-white/10 text-gray-400 border-white/10 hover:border-white/20"
                                            : "bg-white hover:bg-gray-50 text-gray-600 border-gray-300 hover:border-gray-400"
                                            }`}
                                    >
                                        Cancel
                                    </button>
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
                ) : (
                    /* Questions Preview */
                    <div className={`rounded-xl border ${isDarkMode ? "bg-dark-bg-secondary border-white/10" : "bg-white border-gray-200"}`}>
                        <div className="p-6">
                            <h2 className={`text-2xl font-bold mb-6 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                                Survey Questions
                            </h2>

                            <div className="space-y-4">
                                {survey.questions && survey.questions.map((question, index) => (
                                    <div
                                        key={question._id}
                                        className={`p-5 rounded-xl border ${isDarkMode ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-200"}`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <span className={`flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-lg font-bold text-sm ${isDarkMode
                                                ? "bg-orange-500/20 text-orange-400"
                                                : "bg-orange-100 text-orange-700"
                                                }`}>
                                                {index + 1}
                                            </span>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <h3 className={`font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                                                        {question.questionText}
                                                    </h3>
                                                    {question.required && (
                                                        <span className="text-xs font-semibold text-red-500">* Required</span>
                                                    )}
                                                </div>

                                                <div className={`text-xs font-semibold mb-3 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                                                    Type: {question.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                </div>

                                                {question.type === 'multiple_choice' && question.options && (
                                                    <div className="space-y-2">
                                                        {question.options.map((option, optionIndex) => (
                                                            <label key={optionIndex} className="flex items-center cursor-not-allowed">
                                                                <input
                                                                    type="radio"
                                                                    className="h-4 w-4 text-orange-600 focus:ring-orange-500"
                                                                    disabled
                                                                />
                                                                <span className={`ml-3 text-sm ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                                                                    {option}
                                                                </span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SurveyDetailsResponse;
