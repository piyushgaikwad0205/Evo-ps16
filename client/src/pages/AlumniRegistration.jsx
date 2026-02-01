import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API } from '../redux/api/utils';
import logo from '../assets/Campus-Connects.png';
import { GraduationCap, ArrowLeft, ArrowRight, Check, Upload } from 'lucide-react';

const InputField = ({ label, name, type = "text", placeholder, required = false, as = "input", options = [], rows = 3, formData, handleChange, errors }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{label}</label>
    {as === "select" ? (
      <select
        name={name}
        value={formData[name]}
        onChange={handleChange}
        required={required}
        className="w-full px-4 py-3.5 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg-tertiary text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
      >
        <option value="">Select {label}</option>
        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    ) : as === "textarea" ? (
      <textarea
        name={name}
        value={formData[name]}
        onChange={handleChange}
        placeholder={placeholder}
        required={required}
        rows={rows}
        className="w-full px-4 py-3.5 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg-tertiary text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none"
      />
    ) : (
      <input
        type={type}
        name={name}
        value={formData[name]}
        onChange={handleChange}
        placeholder={placeholder}
        required={required}
        className="w-full px-4 py-3.5 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg-tertiary text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
      />
    )}
    {errors[name] && <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">{errors[name]}</p>}
  </div>
);

export default function AlumniRegistrationMultiStep() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef(null);

  const currentYear = new Date().getFullYear();
  const graduationYears = Array.from({ length: 50 }, (_, i) => currentYear - i);

  const departments = [
    'Computer Science', 'Information Technology', 'Electronics and Communication',
    'Mechanical Engineering', 'Civil Engineering', 'Chemical Engineering',
    'Biotechnology', 'Business Administration', 'Management Studies',
    'Commerce', 'Arts', 'Science', 'Other'
  ];

  const industries = [
    'Technology/Software', 'Finance/Banking', 'Healthcare/Medical',
    'Education/Academia', 'Manufacturing', 'Consulting',
    'Government/Public Sector', 'Non-profit/NGO', 'Retail/E-commerce',
    'Media/Entertainment', 'Real Estate', 'Transportation/Logistics',
    'Energy/Utilities', 'Telecommunications', 'Other'
  ];

  const [formData, setFormData] = useState({
    name: '', email: '', graduationYear: '', department: '',
    currentEmployer: '', position: '', linkedinUrl: '', githubUrl: '',
    skills: '', industry: '', experience: '', bio: '',
    location: '', interests: '', isConsentGiven: true,
    collegeId: ''
  });

  const [colleges, setColleges] = useState([]);

  useEffect(() => {
    const fetchColleges = async () => {
      try {
        const { data } = await API.get('/colleges');
        setColleges(data);
      } catch (error) {
        console.error("Failed to fetch colleges:", error);
      }
    };
    fetchColleges();
  }, []);

  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, avatar: 'File size must be less than 5MB' }));
      return;
    }
    setAvatar(file);
    setAvatarPreview(URL.createObjectURL(file));
    setErrors(prev => ({ ...prev, avatar: '' }));
  };

  const isValidUrl = (string) => {
    try {
      if (!string) return true;
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const validateStep = (s = step) => {
    const newErrors = {};
    if (s === 1) {
      if (!formData.name.trim()) newErrors.name = 'Name is required';
      if (!formData.email.trim()) newErrors.email = 'Email is required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Enter a valid email';
    }
    if (s === 2) {
      if (!formData.graduationYear) newErrors.graduationYear = 'Graduation year is required';
      if (!formData.department) newErrors.department = 'Department is required';
      if (!formData.collegeId) newErrors.collegeId = 'College is required';
    }
    if (s === 3) {
      if (formData.linkedinUrl && !isValidUrl(formData.linkedinUrl)) newErrors.linkedinUrl = 'Enter a valid URL';
      if (formData.githubUrl && !isValidUrl(formData.githubUrl)) newErrors.githubUrl = 'Enter a valid URL';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const next = () => {
    if (validateStep(step)) setStep(prev => Math.min(prev + 1, 4));
  };

  const prev = () => setStep(prev => Math.max(prev - 1, 1));

  const handleSubmit = async (e) => {
    e.preventDefault();
    let allValid = true;
    for (let s = 1; s <= 3; s++) {
      if (!validateStep(s)) {
        allValid = false;
        setStep(s);
        break;
      }
    }
    if (!allValid) return;

    setLoading(true);
    try {
      const submitData = new FormData();
      Object.keys(formData).forEach(key => {
        submitData.append(key, formData[key] === undefined || formData[key] === null ? '' : formData[key].toString());
      });
      if (avatar) submitData.append('avatar', avatar);

      await API.post('/alumni/register', submitData, { headers: { 'Content-Type': 'multipart/form-data' } });
      alert('Request submitted! Admin will review and email your credentials upon approval.');
      navigate('/');
    } catch (error) {
      console.error('Registration error:', error);
      setErrors(prev => ({ ...prev, submit: error?.response?.data?.message || 'Registration failed. Please try again.' }));
    }
    setLoading(false);
  };

  const progress = ((step - 1) / 3) * 100;



  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-white dark:bg-gray-900 relative overflow-hidden md:py-0">
      {/* Background Elements - Desktop Only */}
      <div className="hidden md:block absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-blue-500/10 blur-[100px] animate-float" />
        <div className="absolute top-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-blue-400/10 blur-[100px] animate-float" style={{ animationDelay: '2s' }} />
      </div>

      <div className="w-full h-screen md:h-auto md:max-w-6xl bg-white dark:bg-gray-900 md:backdrop-blur-xl md:rounded-3xl md:shadow-2xl overflow-hidden md:grid md:grid-cols-2 md:border md:border-gray-200 md:dark:border-gray-700 md:mx-4 z-10">

        {/* Left Branding Section - Desktop Only */}
        <div className="hidden md:flex flex-col items-center justify-center bg-gradient-to-br from-blue-600 to-blue-700 p-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent to-black/20"></div>

          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="w-32 h-32 bg-white/10 backdrop-blur-md rounded-3xl flex items-center justify-center mb-8 shadow-inner border border-white/20">
              <img src={logo} alt="Campus Connect Logo" className="w-24 h-auto drop-shadow-xl" />
            </div>
            <div className="flex items-center gap-3 mb-4">
              <GraduationCap className="w-10 h-10 text-white" />
              <h1 className="text-white text-4xl font-bold tracking-tight font-outfit">Alumni Portal</h1>
            </div>
            <p className="text-blue-100 text-lg max-w-xs font-light">
              Join the Campus Connect alumni network and stay connected.
            </p>

            {/* Progress Indicator */}
            <div className="mt-12 w-full max-w-xs">
              <div className="flex justify-between mb-2">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${step >= i ? 'bg-white text-blue-600 border-white' : 'border-white/30 text-white/50'} font-semibold transition-all`}>
                    {step > i ? <Check size={20} /> : i}
                  </div>
                ))}
              </div>
              <div className="w-full bg-white/20 rounded-full h-2">
                <div className="bg-white h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Right Form Section - Full Screen on Mobile */}
        <div className="h-screen md:h-auto p-6 md:p-12 lg:p-16 overflow-y-auto">
          {/* Mobile Logo - Only visible on mobile */}
          <div className="md:hidden text-center mb-8">
            <img
              src={logo}
              alt="Campus Connect"
              className="h-16 mx-auto mb-4"
            />
            <p className="text-gray-600 dark:text-gray-400">Alumni Registration</p>
          </div>

          {/* Mobile Progress Indicator */}
          <div className="md:hidden mb-6">
            <div className="flex justify-between mb-2">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className={`flex items-center justify-center w-8 h-8 rounded-full text-xs border-2 ${step >= i ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 dark:border-gray-600 text-gray-400'} font-semibold transition-all`}>
                  {step > i ? <Check size={14} /> : i}
                </div>
              ))}
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
              <div className="bg-blue-600 h-1.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2 font-outfit">
              {step === 1 && "Basic Information"}
              {step === 2 && "Academic Details"}
              {step === 3 && "Professional Info"}
              {step === 4 && "Review & Submit"}
            </h2>
            <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
              Step {step} of 4 • {step === 4 ? "Almost there!" : "Fill in your details"}
            </p>
          </div>

          {errors.submit && (
            <div className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm border border-red-200 dark:border-red-800">
              {errors.submit}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Step 1: Basic Info */}
            {step === 1 && (
              <>
                <InputField label="Full Name" name="name" placeholder="John Doe" required formData={formData} handleChange={handleChange} errors={errors} />
                <InputField label="Email Address" name="email" type="email" placeholder="john@example.com" required formData={formData} handleChange={handleChange} errors={errors} />
                <InputField label="Location" name="location" placeholder="City, Country" formData={formData} handleChange={handleChange} errors={errors} />

                {/* Avatar Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Profile Picture</label>
                  <div className="flex items-center gap-4">
                    {avatarPreview && (
                      <img src={avatarPreview} alt="Preview" className="w-20 h-20 rounded-full object-cover border-2 border-gray-200 dark:border-dark-border" />
                    )}
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      className="px-4 py-2.5 bg-gray-100 dark:bg-dark-bg-tertiary text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-dark-bg transition-colors flex items-center gap-2"
                    >
                      <Upload size={18} />
                      {avatar ? 'Change Photo' : 'Upload Photo'}
                    </button>
                    <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                  </div>
                  {errors.avatar && <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">{errors.avatar}</p>}
                </div>
              </>
            )}

            {/* Step 2: Academic */}
            {step === 2 && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Select College</label>
                  <select
                    name="collegeId"
                    value={formData.collegeId}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3.5 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg-tertiary text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  >
                    <option value="">Select your College</option>
                    {colleges.map((college) => (
                      <option key={college._id} value={college._id}>
                        {college.name}
                      </option>
                    ))}
                  </select>
                  {errors.collegeId && <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">{errors.collegeId}</p>}
                </div>

                <InputField label="Graduation Year" name="graduationYear" as="select" options={graduationYears} required formData={formData} handleChange={handleChange} errors={errors} />
                <InputField label="Department" name="department" as="select" options={departments} required formData={formData} handleChange={handleChange} errors={errors} />
                <InputField label="Interests" name="interests" placeholder="AI, Web Development, etc." formData={formData} handleChange={handleChange} errors={errors} />
                <InputField label="Bio" name="bio" as="textarea" placeholder="Tell us about yourself..." rows={4} formData={formData} handleChange={handleChange} errors={errors} />
              </>
            )}

            {/* Step 3: Professional */}
            {step === 3 && (
              <>
                <InputField label="Current Employer" name="currentEmployer" placeholder="Company Name" formData={formData} handleChange={handleChange} errors={errors} />
                <InputField label="Position" name="position" placeholder="Software Engineer" formData={formData} handleChange={handleChange} errors={errors} />
                <InputField label="Industry" name="industry" as="select" options={industries} formData={formData} handleChange={handleChange} errors={errors} />
                <InputField label="Years of Experience" name="experience" type="number" placeholder="5" formData={formData} handleChange={handleChange} errors={errors} />
                <InputField label="Skills" name="skills" placeholder="JavaScript, React, Node.js" formData={formData} handleChange={handleChange} errors={errors} />
                <InputField label="LinkedIn URL" name="linkedinUrl" type="url" placeholder="https://linkedin.com/in/username" formData={formData} handleChange={handleChange} errors={errors} />
                <InputField label="GitHub URL" name="githubUrl" type="url" placeholder="https://github.com/username" formData={formData} handleChange={handleChange} errors={errors} />
              </>
            )}

            {/* Step 4: Review */}
            {step === 4 && (
              <div className="space-y-4">
                <div className="p-6 bg-gray-50 dark:bg-dark-bg-tertiary rounded-xl space-y-3">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Review Your Information</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div><span className="text-gray-500 dark:text-gray-400">Name:</span> <span className="font-medium text-gray-900 dark:text-white">{formData.name}</span></div>
                    <div><span className="text-gray-500 dark:text-gray-400">Email:</span> <span className="font-medium text-gray-900 dark:text-white">{formData.email}</span></div>
                    <div><span className="text-gray-500 dark:text-gray-400">Graduation:</span> <span className="font-medium text-gray-900 dark:text-white">{formData.graduationYear}</span></div>
                    <div><span className="text-gray-500 dark:text-gray-400">Department:</span> <span className="font-medium text-gray-900 dark:text-white">{formData.department}</span></div>
                    <div><span className="text-gray-500 dark:text-gray-400">College:</span> <span className="font-medium text-gray-900 dark:text-white">{colleges.find(c => c._id === formData.collegeId)?.name || 'N/A'}</span></div>
                    {formData.currentEmployer && <div><span className="text-gray-500 dark:text-gray-400">Employer:</span> <span className="font-medium text-gray-900 dark:text-white">{formData.currentEmployer}</span></div>}
                    {formData.position && <div><span className="text-gray-500 dark:text-gray-400">Position:</span> <span className="font-medium text-gray-900 dark:text-white">{formData.position}</span></div>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" name="isConsentGiven" checked={formData.isConsentGiven} onChange={handleChange} className="w-4 h-4 text-blue-600 rounded" />
                  <label className="text-sm text-gray-600 dark:text-gray-400">I agree to share my information with the alumni network</label>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-3 pt-4">
              {step > 1 && (
                <button type="button" onClick={prev} className="flex-1 px-4 py-3.5 rounded-xl border border-gray-200 dark:border-dark-border text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-dark-bg-tertiary transition-all flex items-center justify-center gap-2">
                  <ArrowLeft size={18} /> Previous
                </button>
              )}
              {step < 4 ? (
                <button type="button" onClick={next} className="flex-1 px-4 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-orange-600 hover:from-blue-700 hover:to-orange-700 text-white font-semibold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                  Next <ArrowRight size={18} />
                </button>
              ) : (
                <button type="submit" disabled={loading} className={`flex-1 px-4 py-3.5 rounded-xl bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold shadow-lg shadow-green-500/30 hover:shadow-green-500/40 active:scale-[0.98] transition-all ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}>
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Submitting...
                    </div>
                  ) : 'Submit Registration'}
                </button>
              )}
            </div>
          </form>

          {/* Back to Sign In */}
          <button
            type="button"
            onClick={() => navigate('/signin')}
            className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 mt-8 transition-colors w-full"
          >
            <ArrowLeft size={16} />
            <span>Back to Sign In</span>
          </button>
        </div>
      </div>
    </div>
  );
}
