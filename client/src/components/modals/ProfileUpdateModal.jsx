import { Fragment, useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import {
  getUserAction,
} from "../../redux/actions/userActions";
import { useDispatch } from "react-redux";
import ButtonLoadingSpinner from "../loader/ButtonLoadingSpinner";
import { FiUser, FiMapPin, FiEdit, FiImage } from "react-icons/fi";
import { API } from "../../redux/api/utils";
import { setUserData } from "../../redux/actions/authActions";
import { useTheme } from "../../contexts/ThemeContext";

const suggestedInterests = [
  "🎨 Art",
  "📚 Books",
  "💼 Business",
  "🚗 Cars",
  "📖 Comics",
  "🌍 Culture",
  "✏️ Design",
  "🍽️ Food",
  "🎮 Gaming",
  "🎶 Music",
  "🏋️ Fitness",
  "🏞️ Travel",
  "🎯 Sports",
  "🎬 Movies",
  "📺 TV Shows",
  "📷 Photography",
  "💻 Technology",
  "🧘‍♀️ Yoga",
  "🌱 Sustainability",
  "📝 Writing",
];

const ProfileUpdateModal = ({ user, isOpen, onClose }) => {
  const dispatch = useDispatch();
  const { isDarkMode } = useTheme();

  const [isUpdating, setIsUpdating] = useState(false);
  const [username, setUsername] = useState(user.username ? user.username : "");
  const [bio, setBio] = useState(user.bio ? user.bio : "");
  const [location, setLocation] = useState(user.location ? user.location : "");
  const [interests, setInterests] = useState(
    user.interests ? user.interests : ""
  );
  const [avatar, setAvatar] = useState(null);
  const [avatarError, setAvatarError] = useState(null);

  const [colleges, setColleges] = useState([]);
  const [collegeId, setCollegeId] = useState(user.collegeId || "");

  useEffect(() => {
    const fetchColleges = async () => {
      try {
        const { data } = await API.get("/colleges");
        setColleges(data);
      } catch (e) {
        console.error("Error fetching colleges", e);
      }
    };
    fetchColleges();
  }, []);

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) { setAvatar(null); setAvatarError(null); return; }
    if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
      setAvatar(null); setAvatarError('Please upload jpeg/jpg/png only'); return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setAvatar(null);
      setAvatarError(`File too large (${(file.size / 1024 / 1024).toFixed(2)}MB). Max 10MB`);
      return;
    }
    setAvatar(file); setAvatarError(null);
  };

  const handleUpdateProfile = async () => {
    setIsUpdating(true);

    try {
      let updatedResponse;
      if (avatar) {
        // Handle avatar upload with FormData
        const formData = new FormData();
        formData.append('bio', bio);
        formData.append('location', location);
        formData.append('interests', interests);
        formData.append('username', username);
        if (collegeId) formData.append('collegeId', collegeId);
        formData.append('avatar', avatar);

        console.log('Uploading profile with avatar:', { bio, location, interests, username, avatarName: avatar.name });

        const { data } = await API.put(`/users/profile`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        updatedResponse = data;
        console.log('Profile update response with avatar:', data);
      } else {
        // Handle text-only update
        const payload = { bio, location, interests, username, collegeId };
        console.log('Uploading profile without avatar:', payload);

        const { data } = await API.put(`/users/profile`, payload);
        updatedResponse = data;
        console.log('Profile update response without avatar:', data);
      }

      // Sync auth store and localStorage quickly so UI shows new avatar/username immediately
      try {
        const stored = JSON.parse(localStorage.getItem('profile')) || null;
        if (stored && updatedResponse) {
          const nextUser = { ...stored.user };
          if (typeof updatedResponse.avatar !== 'undefined') nextUser.avatar = updatedResponse.avatar;
          if (typeof updatedResponse.username !== 'undefined') nextUser.username = updatedResponse.username;
          if (typeof updatedResponse.bio !== 'undefined') nextUser.bio = updatedResponse.bio;
          if (typeof updatedResponse.location !== 'undefined') nextUser.location = updatedResponse.location;
          if (typeof updatedResponse.interests !== 'undefined') nextUser.interests = updatedResponse.interests;
          if (typeof updatedResponse.collegeId !== 'undefined') nextUser.collegeId = updatedResponse.collegeId;
          const nextProfile = { ...stored, user: nextUser };
          localStorage.setItem('profile', JSON.stringify(nextProfile));
          await dispatch(setUserData(nextUser));
          console.log('Updated localStorage and Redux store:', nextUser);
        }
      } catch (syncError) {
        console.error('Error syncing profile to store:', syncError);
      }

      // Refresh user data
      await dispatch(getUserAction(user._id));

      // Keep current values; modal closes
      setAvatar(null);
      setAvatarError(null);
      setIsUpdating(false);
      onClose();
    } catch (error) {
      console.error('Profile update failed:', error);
      console.error('Error details:', error.response?.data || error.message);

      // Show error to user
      const serverError = error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to update profile';
      setAvatarError(serverError);
      setIsUpdating(false);
      // Keep the modal open on error so user can try again
    }
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="fixed inset-0 z-50" onClose={onClose}>
        <div className="flex min-h-screen items-center justify-center px-4 pt-4 text-center sm:block sm:p-0 md:pb-20">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-30" />
          </Transition.Child>

          <span
            className="hidden sm:inline-block sm:h-screen sm:align-middle"
            aria-hidden="true"
          >
            &#8203;
          </span>

          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <div className={`inline-block w-full transform overflow-hidden rounded-md px-4 pb-4 pt-5 text-left align-bottom shadow-xl transition-all sm:my-8 sm:p-6 sm:align-middle md:max-w-xl ${isDarkMode
              ? 'bg-dark-bg-secondary border border-dark-border'
              : 'bg-white'
              }`}>
              <div className="w-full">
                <div className="mt-3 text-center sm:mt-0 sm:text-left">
                  <Dialog.Title
                    as="h3"
                    className={`text-lg font-medium leading-6 ${isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}
                  >
                    Update Profile
                  </Dialog.Title>

                  <div className="mt-4">
                    <div className="flex items-center space-x-2">
                      <FiImage className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        }`} />
                      <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                        Profile Photo
                      </label>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      className={`mt-1 block w-full rounded-md border p-2 transition-colors duration-200 ${isDarkMode
                        ? 'bg-dark-bg border-dark-border text-white file:bg-dark-bg-tertiary file:text-white file:border-dark-border'
                        : 'bg-white border-gray-300 text-gray-900 file:bg-gray-100 file:text-gray-700 file:border-gray-300'
                        }`}
                      onChange={handleAvatarChange}
                    />
                    {avatarError && <p className="text-xs text-red-600 mt-1">{avatarError}</p>}
                    {avatar && (
                      <div className="mt-2">
                        <p className="text-xs text-green-600">✓ {avatar.name} selected</p>
                      </div>
                    )}
                  </div>

                  <div className="mt-4">
                    <div className="flex items-center space-x-2">
                      <FiUser className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        }`} />
                      <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                        Username
                      </label>
                    </div>
                    <input
                      type="text"
                      className={`mt-1 block w-full rounded-md border-b p-2 outline-none transition-colors duration-200 ${isDarkMode
                        ? 'bg-transparent border-dark-border text-white placeholder-gray-500'
                        : 'border-gray-300 text-gray-900 placeholder-gray-500'
                        }`}
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase())}
                      maxLength={30}
                    />
                  </div>

                  <div className="mt-4">
                    <div className="flex items-center space-x-2">
                      <FiUser className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        }`} />
                      <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                        Bio
                      </label>
                    </div>
                    <input
                      type="text"
                      className={`mt-1 block w-full rounded-md border-b p-2 outline-none transition-colors duration-200 ${isDarkMode
                        ? 'bg-transparent border-dark-border text-white placeholder-gray-500'
                        : 'border-gray-300 text-gray-900 placeholder-gray-500'
                        }`}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                    />
                  </div>

                  <div className="mt-4">
                    <div className="flex items-center space-x-2">
                      <FiMapPin className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                      <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        College
                      </label>
                    </div>
                    <select
                      className={`mt-1 block w-full rounded-md border-b p-2 outline-none transition-colors duration-200 ${isDarkMode
                        ? 'bg-transparent border-dark-border text-white placeholder-gray-500'
                        : 'border-gray-300 text-gray-900 placeholder-gray-500'
                        }`}
                      value={collegeId}
                      onChange={(e) => setCollegeId(e.target.value)}
                    >
                      <option value="">Select College</option>
                      {colleges.map(c => (
                        <option key={c._id} value={c._id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="mt-4">
                    <div className="flex items-center space-x-2">
                      <FiMapPin className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        }`} />
                      <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                        Location
                      </label>
                    </div>
                    <input
                      type="text"
                      className={`mt-1 block w-full rounded-md border-b p-2 outline-none transition-colors duration-200 ${isDarkMode
                        ? 'bg-transparent border-dark-border text-white placeholder-gray-500'
                        : 'border-gray-300 text-gray-900 placeholder-gray-500'
                        }`}
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                  </div>

                  <div className="mt-4">
                    <div className="flex items-center space-x-2">
                      <FiEdit className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        }`} />
                      <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                        Interests (Separated by comma)
                      </label>
                    </div>
                    <input
                      type="text"
                      className={`mt-1 block w-full rounded-md border-b p-2 outline-none transition-colors duration-200 ${isDarkMode
                        ? 'bg-transparent border-dark-border text-white placeholder-gray-500'
                        : 'border-gray-300 text-gray-900 placeholder-gray-500'
                        }`}
                      value={interests}
                      onChange={(e) => {
                        if (e.target.value.length <= 50) {
                          setInterests(e.target.value);
                        }
                      }}
                      maxLength={50}
                    />

                    <div className="mt-4 h-20 overflow-y-auto">
                      <div className="flex flex-wrap gap-2">
                        {suggestedInterests.map((interest, index) => (
                          <button
                            key={index}
                            type="button"
                            disabled={isUpdating || interests.length >= 50}
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors duration-200 ${isDarkMode
                              ? 'bg-dark-bg-tertiary text-gray-300 hover:bg-dark-bg hover:text-white'
                              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                            onClick={() =>
                              setInterests(
                                interests === ""
                                  ? interest
                                  : interests + ", " + interest
                              )
                            }
                          >
                            {interest}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                <button
                  disabled={isUpdating}
                  type="button"
                  className={`inline-flex w-full justify-center rounded-md border border-transparent px-4 py-2 text-base font-medium text-white shadow-sm focus:outline-none sm:ml-3 sm:w-auto sm:text-sm transition-colors duration-200 ${isUpdating
                    ? "cursor-not-allowed bg-gray-400"
                    : "bg-blue-500 hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    }`}
                  onClick={handleUpdateProfile}
                >
                  {isUpdating ? (
                    <ButtonLoadingSpinner loadingText={"Updating..."} />
                  ) : (
                    <span>Update</span>
                  )}
                </button>
                <button
                  type="button"
                  className={`mt-3 inline-flex w-full justify-center rounded-md border px-4 py-2 text-base font-medium shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:ml-3 sm:mt-0 sm:w-auto sm:text-sm transition-colors duration-200 ${isDarkMode
                    ? 'border-dark-border bg-dark-bg text-gray-300 hover:bg-dark-bg-tertiary'
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  onClick={onClose}
                >
                  Cancel
                </button>
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default ProfileUpdateModal;
