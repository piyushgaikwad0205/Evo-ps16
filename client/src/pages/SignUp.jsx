import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { HiEye, HiEyeOff } from "react-icons/hi";
import { RxCross1 } from "react-icons/rx";

import { signUpAction, clearMessage } from "../redux/actions/authActions";
import { API } from "../redux/api/utils";
import ContextAuthModal from "../components/modals/ContextAuthModal";
import ButtonLoadingSpinner from "../components/loader/ButtonLoadingSpinner";
import Banner from "../assets/Campus-Connects.png";
import { useTheme } from "../contexts/ThemeContext";

export default function SignUpNew() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();

  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [btid, setBtid] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [avatarError, setAvatarError] = useState(null);
  const [clientError, setClientError] = useState(null);

  // Academic Details States
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [department, setDepartment] = useState("");
  const [course, setCourse] = useState("");
  const [yearOfStudy, setYearOfStudy] = useState("");
  const [academicClass, setAcademicClass] = useState("");
  const [semester, setSemester] = useState("");
  const [section, setSection] = useState("");
  const [enrollmentNumber, setEnrollmentNumber] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [branchSpecification, setBranchSpecification] = useState("");
  const [admissionType, setAdmissionType] = useState("Regular");
  const [bloodGroup, setBloodGroup] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);


  const [isConsentGiven, setIsConsentGiven] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModerator, setIsModerator] = useState(false);

  // College Selection
  const [colleges, setColleges] = useState([]);
  const [collegeId, setCollegeId] = useState("");

  useEffect(() => {
    const fetchColleges = async () => {
      try {
        // Fetch colleges from public endpoint
        const { data } = await API.get("/colleges");
        setColleges(data);
      } catch (err) {
        console.error("Failed to fetch colleges", err);
      }
    };
    fetchColleges();
  }, []);

  const signUpError = useSelector((state) => state.auth?.signUpError);

  const handleEmailChange = (e) => {
    const v = e.target.value;
    setEmail(v);
    setIsModerator(v.includes("mod.socialecho.com"));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return setAvatar(null);

    const allowed = ["image/jpeg", "image/png", "image/jpg"];
    if (!allowed.includes(file.type)) {
      setAvatar(null);
      setAvatarError("Please upload a valid image file (jpeg, jpg, png)");
    } else if (file.size > 10 * 1024 * 1024) {
      setAvatar(null);
      setAvatarError("Please upload an image less than 10MB");
    } else {
      setAvatar(file);
      setAvatarError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setClientError(null);

    // Validate required fields
    if (!name.trim() || !email.trim() || !btid.trim() || !password) {
      return setClientError("Please fill all required fields");
    }
    if (!department || !course || !yearOfStudy) {
      return setClientError("Please fill all academic details");
    }
    if (password !== confirmPassword) {
      return setClientError("Passwords do not match");
    }

    setLoading(true);
    setLoadingText("Signing up...");

    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("btid", btid.toUpperCase());
    if (mobile.trim()) formData.append("mobile", mobile);
    formData.append("password", password);
    if (avatar) formData.append("avatar", avatar);
    formData.append("role", "general");
    if (collegeId) formData.append("collegeId", collegeId);
    formData.append("isConsentGiven", isConsentGiven.toString());

    // Academic Details
    if (dateOfBirth) formData.append("dateOfBirth", dateOfBirth);
    if (gender) formData.append("gender", gender);
    formData.append("department", department);
    formData.append("course", course);
    formData.append("yearOfStudy", yearOfStudy);
    if (academicClass) formData.append("academicClass", academicClass);
    if (semester) formData.append("semester", semester);
    if (section) formData.append("section", section.toUpperCase());
    if (enrollmentNumber) formData.append("enrollmentNumber", enrollmentNumber.toUpperCase());
    if (rollNumber) formData.append("rollNumber", rollNumber.toUpperCase());
    if (branchSpecification) formData.append("branchSpecification", branchSpecification);
    formData.append("admissionType", admissionType);
    if (bloodGroup) formData.append("bloodGroup", bloodGroup);

    const timeout = setTimeout(() => {
      setLoadingText(
        "This is taking longer than usual. Please wait while backend services load."
      );
    }, 5000);

    await dispatch(signUpAction(formData, navigate, isConsentGiven, email));

    clearTimeout(timeout);
    setLoading(false);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-white dark:bg-gray-900 relative overflow-hidden md:py-0">
      {/* Background Elements - Desktop Only */}
      <div className="hidden md:block absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-blue-500/10 blur-[100px] animate-float" />
        <div className="absolute top-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-blue-400/10 blur-[100px] animate-float" style={{ animationDelay: '2s' }} />
      </div>

      <div className="w-full h-screen md:h-auto md:max-w-5xl bg-white dark:bg-gray-900 md:backdrop-blur-xl md:rounded-3xl md:shadow-2xl overflow-hidden md:grid md:grid-cols-2 md:border md:border-gray-200 md:dark:border-gray-700 md:mx-4 z-10 md:h-[700px]">
        {/* Left Section - Desktop Only */}
        <div className="hidden md:flex flex-col items-center justify-center bg-gradient-to-br from-blue-600 to-blue-700 p-12 relative overflow-hidden h-full">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent to-black/20"></div>

          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="w-32 h-32 bg-white/10 backdrop-blur-md rounded-3xl flex items-center justify-center mb-8 shadow-inner border border-white/20">
              <img src={Banner} alt="Campus" className="w-24 drop-shadow-xl" />
            </div>
            <h1 className="text-white text-4xl font-bold tracking-tight mb-4 font-outfit">Join Campus Connect</h1>
            <p className="text-blue-100 text-lg max-w-xs font-light">
              Create your student profile and enter the community.
            </p>
          </div>
        </div>

        {/* Right Section - Full Screen on Mobile */}
        <form
          className="h-screen md:h-auto flex flex-col justify-start p-6 md:p-12 overflow-y-auto custom-scrollbar"
          onSubmit={handleSubmit}
        >
          {/* Mobile Logo - Only visible on mobile */}
          <div className="md:hidden text-center mb-8">
            <img
              src={Banner}
              alt="Campus Connect"
              className="h-16 mx-auto mb-4"
            />
            <p className="text-gray-600 dark:text-gray-400">Welcome to Campus Connect</p>
          </div>

          <div className="mb-4 md:mb-6">
            <h2 className="hidden md:block text-3xl font-bold text-gray-900 dark:text-white mb-2 font-outfit">Create Account</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm text-center md:text-left">
              Sign up to get started with <span className="font-semibold text-blue-600 dark:text-blue-400">Campus Connect</span>
            </p>
          </div>

          {signUpError &&
            Array.isArray(signUpError) &&
            signUpError.map((err, i) => (
              <div key={i} className="mb-4 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm border border-red-100 dark:border-red-900/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                  <span>{err}</span>
                </div>
                <button
                  type="button"
                  className="text-red-500 hover:text-red-700 dark:hover:text-red-300 transition-colors"
                  onClick={() => dispatch(clearMessage())}
                >
                  <RxCross1 className="h-4 w-4" />
                </button>
              </div>
            ))}

          {clientError && (
            <div className="mb-4 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm border border-red-100 dark:border-red-900/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                <span>{clientError}</span>
              </div>
              <button
                type="button"
                className="text-red-500 hover:text-red-700 dark:hover:text-red-300 transition-colors"
                onClick={() => setClientError(null)}
              >
                <RxCross1 className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* College Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Select College <span className="text-gray-400 font-normal">(Optional)</span></label>
            <select
              value={collegeId}
              onChange={(e) => setCollegeId(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg-tertiary text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
            >
              <option value="">-- Select Your College (Optional) --</option>
              {colleges.map((college) => (
                <option key={college._id} value={college._id}>
                  {college.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Select if your college is listed, otherwise skip this field</p>
          </div>

          {/* Name */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg-tertiary text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
            />
          </div>

          {/* Avatar */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Profile Photo</label>
            <label htmlFor="avatar" className="flex cursor-pointer items-center justify-center w-full rounded-xl border-2 border-dashed border-gray-300 dark:border-dark-border bg-gray-50 dark:bg-dark-bg-tertiary hover:bg-gray-100 dark:hover:bg-dark-bg-secondary transition-colors px-4 py-6 text-center">
              <div className="flex flex-col items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                <span className="text-sm text-gray-500 dark:text-gray-400">Click to upload image</span>
              </div>
              <input id="avatar" type="file" className="hidden" onChange={handleAvatarChange} />
            </label>
            {avatar && <div className="text-blue-600 dark:text-blue-400 text-center mt-2 text-sm font-medium">{avatar.name}</div>}
            {avatarError && <div className="text-red-500 text-center mt-2 text-sm">{avatarError}</div>}
          </div>

          {/* Email */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={handleEmailChange}
              placeholder="you@college.com"
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg-tertiary text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
            />
          </div>

          {/* Mobile Number */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Mobile Number <span className="text-gray-400 font-normal">(Optional)</span></label>
            <input
              type="tel"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              placeholder="1234567890"
              pattern="[0-9]{10}"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg-tertiary text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">For 2FA/OTP features (10 digits)</p>
          </div>

          {/* BTID */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">BTID <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={btid}
              onChange={(e) => setBtid(e.target.value)}
              placeholder="BT123456"
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg-tertiary text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all uppercase"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Your unique student identification number</p>
          </div>

          {/* Academic Details Section */}
          <div className={`mb-4 p-4 rounded-xl border ${isDarkMode ? "border-white/10 bg-dark-bg" : "border-gray-200 bg-gray-50"}`}>
            <h3 className={`text-sm font-semibold mb-3 ${isDarkMode ? "text-white" : "text-gray-900"}`}>📚 Academic Details</h3>

            <div className="grid grid-cols-2 gap-3">
              {/* Date of Birth */}
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-sm border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-bg-tertiary text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                />
              </div>

              {/* Gender */}
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-sm border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-bg-tertiary text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>

              {/* Department */}
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Department <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g., Computer Science"
                  required
                  className="w-full px-3 py-2 rounded-lg text-sm border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-bg-tertiary text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                />
              </div>

              {/* Course */}
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Course/Program <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  placeholder="e.g., B.Tech, BCA"
                  required
                  className="w-full px-3 py-2 rounded-lg text-sm border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-bg-tertiary text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                />
              </div>

              {/* Year of Study */}
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Year of Study <span className="text-red-500">*</span></label>
                <select
                  value={yearOfStudy}
                  onChange={(e) => setYearOfStudy(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-lg text-sm border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-bg-tertiary text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                >
                  <option value="">Select Year</option>
                  <option value="1">1st Year</option>
                  <option value="2">2nd Year</option>
                  <option value="3">3rd Year</option>
                  <option value="4">4th Year</option>
                  <option value="5">5th Year</option>
                </select>
              </div>

              {/* Academic Class */}
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Academic Class</label>
                <input
                  type="text"
                  value={academicClass}
                  onChange={(e) => setAcademicClass(e.target.value)}
                  placeholder="e.g., FY, SY, TY"
                  className="w-full px-3 py-2 rounded-lg text-sm border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-bg-tertiary text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                />
              </div>

              {/* Semester */}
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Semester</label>
                <select
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-sm border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-bg-tertiary text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                >
                  <option value="">Select Semester</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(sem => (
                    <option key={sem} value={sem}>Semester {sem}</option>
                  ))}
                </select>
              </div>

              {/* Section */}
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Section</label>
                <input
                  type="text"
                  value={section}
                  onChange={(e) => setSection(e.target.value)}
                  placeholder="e.g., A, B, C"
                  maxLength="2"
                  className="w-full px-3 py-2 rounded-lg text-sm border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-bg-tertiary text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none uppercase"
                />
              </div>

              {/* Enrollment Number */}
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Enrollment Number</label>
                <input
                  type="text"
                  value={enrollmentNumber}
                  onChange={(e) => setEnrollmentNumber(e.target.value)}
                  placeholder="College PRN"
                  className="w-full px-3 py-2 rounded-lg text-sm border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-bg-tertiary text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none uppercase"
                />
              </div>

              {/* Roll Number */}
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Roll Number</label>
                <input
                  type="text"
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value)}
                  placeholder="Class Roll No"
                  className="w-full px-3 py-2 rounded-lg text-sm border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-bg-tertiary text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none uppercase"
                />
              </div>

              {/* Branch Specification */}
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Branch Specification</label>
                <input
                  type="text"
                  value={branchSpecification}
                  onChange={(e) => setBranchSpecification(e.target.value)}
                  placeholder="e.g., AI/ML, Cyber Security"
                  className="w-full px-3 py-2 rounded-lg text-sm border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-bg-tertiary text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                />
              </div>

              {/* Admission Type */}
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Admission Type</label>
                <select
                  value={admissionType}
                  onChange={(e) => setAdmissionType(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-sm border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-bg-tertiary text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                >
                  <option value="Regular">Regular</option>
                  <option value="Lateral Entry">Lateral Entry</option>
                  <option value="Diploma to Degree">Diploma to Degree</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Blood Group */}
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Blood Group</label>
                <select
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-sm border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-bg-tertiary text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                >
                  <option value="">Select Blood Group</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
            </div>
          </div>

          {/* Password */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg-tertiary text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                {showPassword ? <HiEyeOff size={20} /> : <HiEye size={20} />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Confirm Password</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg-tertiary text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all pr-12"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                {showConfirmPassword ? <HiEyeOff size={20} /> : <HiEye size={20} />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            disabled={loading}
            type="submit"
            className={`w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 active:scale-[0.98] transition-all duration-200 ${loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
          >
            {loading ? <ButtonLoadingSpinner loadingText={loadingText} /> : "Create Account"}
          </button>

          {/* Consent */}
          <div onClick={() => setIsModalOpen(true)} className="mt-4 cursor-pointer text-center text-xs font-medium text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-dark-border rounded-lg py-2 hover:bg-gray-50 dark:hover:bg-dark-bg-tertiary transition-colors">
            {isConsentGiven && !isModerator ? "Context-Based Authentication is enabled" : "Context-Based Authentication is disabled"}
          </div>

          <ContextAuthModal
            isModalOpen={isModalOpen}
            setIsModalOpen={setIsModalOpen}
            setIsConsentGiven={setIsConsentGiven}
            isModerator={isModerator}
          />

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
            Already have an account? <Link to="/signin" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">Sign In</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
