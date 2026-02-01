import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { API } from '../redux/api/utils';
import { useTheme } from '../contexts/ThemeContext';

const CreateSuccessStory = () => {
  const navigate = useNavigate();
  const { userData: user } = useSelector((state) => state.auth);
  const { isDarkMode } = useTheme();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'career_achievement',
    companyName: '',
    achievementYear: '',
    tags: '',
    media: []
  });
  const [errors, setErrors] = useState({});

  const categories = [
    { value: 'career_achievement', label: 'Career Achievement' },
    { value: 'entrepreneurship', label: 'Entrepreneurship' },
    { value: 'social_impact', label: 'Social Impact' },
    { value: 'academic_excellence', label: 'Academic Excellence' },
    { value: 'innovation', label: 'Innovation' },
    { value: 'leadership', label: 'Leadership' },
    { value: 'other', label: 'Other' }
  ];

  const currentYear = new Date().getFullYear();
  const achievementYears = Array.from({ length: 20 }, (_, i) => currentYear - i);

  // Check if user is alumni and has upload permission
  if (!user || user.role !== 'alumni') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-4">
            Only alumni can submit success stories.
          </p>
          <button
            onClick={() => navigate('/success-stories')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            View Success Stories
          </button>
        </div>
      </div>
    );
  }


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        setErrors(prev => ({ ...prev, media: 'File size must be less than 10MB' }));
        return false;
      }
      return true;
    });

    setFormData(prev => ({
      ...prev,
      media: validFiles
    }));
    setErrors(prev => ({ ...prev, media: '' }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (formData.title.length > 200) newErrors.title = 'Title must be less than 200 characters';
    if (formData.description.length > 2000) newErrors.description = 'Description must be less than 2000 characters';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const submitData = new FormData();

      // Append form data
      Object.keys(formData).forEach(key => {
        if (key === 'media') {
          formData[key].forEach(file => {
            submitData.append('media', file);
          });
        } else if (key === 'tags' && formData[key]) {
          submitData.append(key, formData[key]);
        } else if (formData[key]) {
          submitData.append(key, formData[key]);
        }
      });

      await API.post('/success-stories', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      alert('Success story published successfully!');
      navigate('/success-stories');

    } catch (error) {
      console.error('Error submitting success story:', error);

      if (error.response?.data?.message) {
        setErrors({ submit: error.response.data.message });
      } else {
        setErrors({ submit: 'Failed to submit success story. Please try again.' });
      }
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-dark-bg dark:via-dark-bg-secondary dark:to-dark-bg py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 mb-4 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Share Your Success Story
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Inspire fellow alumni by sharing your achievements, experiences, and the journey that shaped your success
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white dark:bg-dark-bg-secondary rounded-3xl shadow-2xl border border-gray-100 dark:border-white/10 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6">
            <h2 className="text-2xl font-bold text-white">Your Story Details</h2>
            <p className="text-blue-100 mt-1">Fill in the details below to share your inspiring journey</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {/* Title */}
            <div className="group">
              <label htmlFor="title" className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                Story Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., From Student to Tech Leader at Google"
                className={`w - full px - 4 py - 3.5 bg - gray - 50 dark: bg - dark - bg border - 2 rounded - xl shadow - sm transition - all duration - 200 focus: outline - none focus: ring - 4 focus: ring - blue - 500 / 20 focus: border - blue - 500 dark: text - white dark: placeholder - gray - 500 ${errors.title ? 'border-red-300 dark:border-red-500' : 'border-gray-200 dark:border-white/10'
                  } `}
              />
              {errors.title && <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.title}
              </p>}
            </div>

            {/* Category */}
            <div className="group">
              <label htmlFor="category" className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-3.5 bg-gray-50 dark:bg-dark-bg border-2 border-gray-200 dark:border-white/10 rounded-xl shadow-sm transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 dark:text-white"
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div className="group">
              <label htmlFor="description" className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                Your Story <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                rows={10}
                value={formData.description}
                onChange={handleChange}
                placeholder="Share your journey, challenges, achievements, and lessons learned... Be detailed and authentic!"
                className={`w - full px - 4 py - 3.5 bg - gray - 50 dark: bg - dark - bg border - 2 rounded - xl shadow - sm transition - all duration - 200 focus: outline - none focus: ring - 4 focus: ring - blue - 500 / 20 focus: border - blue - 500 dark: text - white dark: placeholder - gray - 500 resize - none ${errors.description ? 'border-red-300 dark:border-red-500' : 'border-gray-200 dark:border-white/10'
                  } `}
              />
              <div className="flex justify-between items-center mt-2">
                {errors.description && <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.description}
                </p>}
                <p className={`text - sm ml - auto ${formData.description.length > 1800 ? 'text-orange-600' : 'text-gray-500 dark:text-gray-400'} `}>
                  {formData.description.length}/2000 characters
                </p>
              </div>
            </div>

            {/* Company and Year */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="group">
                <label htmlFor="companyName" className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                  Company/Organization
                </label>
                <input
                  type="text"
                  id="companyName"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  placeholder="e.g., Google, Microsoft, Your Startup"
                  className="w-full px-4 py-3.5 bg-gray-50 dark:bg-dark-bg border-2 border-gray-200 dark:border-white/10 rounded-xl shadow-sm transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 dark:text-white dark:placeholder-gray-500"
                />
              </div>

              <div className="group">
                <label htmlFor="achievementYear" className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                  Achievement Year
                </label>
                <select
                  id="achievementYear"
                  name="achievementYear"
                  value={formData.achievementYear}
                  onChange={handleChange}
                  className="w-full px-4 py-3.5 bg-gray-50 dark:bg-dark-bg border-2 border-gray-200 dark:border-white/10 rounded-xl shadow-sm transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 dark:text-white"
                >
                  <option value="">Select year</option>
                  {achievementYears.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Tags */}
            <div className="group">
              <label htmlFor="tags" className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                Tags
              </label>
              <input
                type="text"
                id="tags"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                placeholder="e.g., leadership, innovation, mentorship, technology"
                className="w-full px-4 py-3.5 bg-gray-50 dark:bg-dark-bg border-2 border-gray-200 dark:border-white/10 rounded-xl shadow-sm transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 dark:text-white dark:placeholder-gray-500"
              />
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Add relevant tags to help others find your story
              </p>
            </div>

            {/* Media Upload */}
            <div className="group">
              <label htmlFor="media" className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                Media (optional)
              </label>
              <div className="relative">
                <input
                  type="file"
                  id="media"
                  name="media"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleFileChange}
                  className="w-full px-4 py-3.5 bg-gray-50 dark:bg-dark-bg border-2 border-dashed border-gray-300 dark:border-white/20 rounded-xl shadow-sm transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/30 dark:file:text-blue-400"
                />
              </div>
              {errors.media && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.media}</p>}
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Upload images or videos related to your story (max 10MB per file)
              </p>
            </div>

            {/* Submit Error */}
            {errors.submit && (
              <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-500/50 rounded-xl p-4 flex items-start gap-3">
                <svg className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-red-600 dark:text-red-400 font-medium">{errors.submit}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200 dark:border-white/10">
              <button
                type="button"
                onClick={() => navigate('/success-stories')}
                className="flex-1 px-8 py-4 border-2 border-gray-300 dark:border-white/20 rounded-xl text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-white/5 transition-all duration-200 shadow-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transform hover:-translate-y-0.5 disabled:transform-none flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Publishing...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Publish Story</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-500/30 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-blue-900 dark:text-blue-300 mb-3 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            Tips for a Great Story
          </h3>
          <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-300">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
              <span>Be authentic and share both challenges and triumphs</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
              <span>Include specific examples and measurable achievements</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
              <span>Share lessons learned that can help others</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
              <span>Add relevant media to make your story more engaging</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CreateSuccessStory; 