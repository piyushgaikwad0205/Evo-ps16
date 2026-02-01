import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { API, MESSAGES_API } from '../redux/api/utils';
import { useTheme } from '../contexts/ThemeContext';
import { useOnlineUsers } from '../contexts/OnlineUsersContext';
import OnlineIndicator from '../components/shared/OnlineIndicator';
import EmojiPicker, { EmojiStyle, Theme } from 'emoji-picker-react';
import {
  HiOutlinePaperAirplane,
  HiOutlineChatBubbleLeft,
  HiOutlineArrowLeft,
  HiMagnifyingGlass,
  HiEllipsisVertical,
  HiOutlineHeart,
  HiHeart,
  HiOutlinePaperClip,
  HiOutlineMicrophone,
  HiXMark,
  HiOutlineTrash,
  HiOutlineClock,
  HiOutlineLockClosed,
  HiArrowUturnLeft,
  HiClipboardDocument,
  HiOutlineCheckCircle,
  HiOutlinePlus,
  HiOutlineFaceSmile,
} from 'react-icons/hi2';
import {
  BsCheck,
  BsCheckAll,
  Bs1Circle,
} from 'react-icons/bs';
import {
  MdDeleteOutline,
  MdBlock,
  MdReport
} from 'react-icons/md';

const Messages = () => {
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);

  // States for Search and DM
  const [searchTerm, setSearchTerm] = useState('');
  const [userSearchResults, setUserSearchResults] = useState([]);
  const [isSearchingUsers, setIsSearchingUsers] = useState(false);
  const [startingDM, setStartingDM] = useState(false);

  // UI State
  const [showHeaderMenu, setShowHeaderMenu] = useState(false);
  const [activeMessageId, setActiveMessageId] = useState(null);

  // Feature States
  const [pinnedContacts, setPinnedContacts] = useState(new Set());
  const [blockedUsers, setBlockedUsers] = useState(new Set());
  const [disappearingMode, setDisappearingMode] = useState(false);
  const [isViewOnce, setIsViewOnce] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [localReactions, setLocalReactions] = useState({});

  // Typing Indicator State
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null);

  // Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const recordingIntervalRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Emoji Picker State
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Audio Playback Speed State (per message)
  const [audioPlaybackSpeeds, setAudioPlaybackSpeeds] = useState({});

  // View Once Modal State
  const [viewOnceContent, setViewOnceContent] = useState(null);

  const AVATAR_PLACEHOLDER = "https://raw.githubusercontent.com/nz-m/public-files/main/dp.jpg";

  const { userData: user } = useSelector((state) => state.auth);
  const { isDarkMode } = useTheme();
  const { onlineUsers, isUserOnline } = useOnlineUsers(); // Get onlineUsers to trigger re-renders
  const navigate = useNavigate();
  const location = useLocation();
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);
  const fileInputRef = useRef(null);

  const [uploadingFile, setUploadingFile] = useState(false);
  const [longPressedConvo, setLongPressedConvo] = useState(null);
  const longPressTimerRef = useRef(null);
  const selectedConversationIdRef = useRef(null);

  // Use React Query for conversations - automatic caching, no reload on tab switch
  const { data: conversationsData, isLoading: loading, refetch: refetchConversations } = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const response = await MESSAGES_API.get('/conversations');
      return response.data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - data stays fresh
    cacheTime: 30 * 60 * 1000, // 30 minutes - cache persists
    refetchOnWindowFocus: false, // Don't refetch when switching tabs
  });

  // Use cached data or empty array
  const conversations = conversationsData || [];


  // Utility Functions
  const getOtherParticipant = (conversation) => {
    return conversation.participants?.find(p => p._id !== user._id) || {};
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDuration = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const getMessageStatus = (message) => {
    if (message.isOwn) {
      const otherUserHasRead = message.readBy && message.readBy.length > 1;
      const isDelivered = message._id && !String(message._id).startsWith('temp-');

      if (message.isOpened) return <BsCheckAll className="w-4 h-4 text-orange-500" title="Opened" />;
      if (otherUserHasRead) return <BsCheckAll className="w-4 h-4 text-orange-500" title="Read" />;
      if (isDelivered) return <BsCheckAll className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} title="Delivered" />;
      return <BsCheck className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} title="Sent" />;
    }
    return null;
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
  };

  // Actions
  const togglePinContact = async (otherUserId) => {
    setPinnedContacts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(otherUserId)) newSet.delete(otherUserId);
      else newSet.add(otherUserId);
      return newSet;
    });
  };

  const handleDeleteConversation = async (conversationId, e) => {
    if (e) e.stopPropagation();
    if (window.confirm('Hide this chat from your recent list?')) {
      try {
        await MESSAGES_API.delete(`/conversations/${conversationId}`);
        refetchConversations(); // Refetch to update cache
        if (selectedConversation && selectedConversation._id === conversationId) {
          setSelectedConversation(null);
        }
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (window.confirm('Delete this message?')) {
      try {
        await MESSAGES_API.delete(`/messages/${messageId}`);
        setMessages(prev => prev.filter(m => m._id !== messageId));
        setActiveMessageId(null);
      } catch (error) {
        console.error('Error deleting message:', error);
      }
    }
  };

  const handleClearChat = async () => {
    if (!selectedConversation) return;
    if (window.confirm('Are you sure you want to clear all messages in this chat?')) {
      try {
        await MESSAGES_API.post(`/conversations/${selectedConversation._id}/clear`);
        setMessages([]); // Clear locally immediately
        setShowHeaderMenu(false);
      } catch (error) { console.error(error); }
    }
  };

  const handleCopy = (content) => {
    navigator.clipboard.writeText(content);
    setActiveMessageId(null);
  };

  const handleReply = (message) => {
    setReplyingTo(message);
    setActiveMessageId(null);
  };

  const toggleDisappearingMessages = () => {
    setDisappearingMode(!disappearingMode);
    setShowHeaderMenu(false);
  };

  const handleBlockToggle = async (userId) => {
    const isBlocked = blockedUsers.has(userId);
    const action = isBlocked ? "Unblock" : "Block";
    if (window.confirm(`${action} this user?`)) {
      try {
        setBlockedUsers(prev => {
          const newSet = new Set(prev);
          if (isBlocked) newSet.delete(userId);
          else newSet.add(userId);
          return newSet;
        });
        if (isBlocked) await API.post(`/users/${userId}/unblock`);
        else await API.post(`/users/${userId}/block`);

        setShowHeaderMenu(false);
      } catch (error) {
        console.error("Block error", error);
        alert("Failed to update block status");
      }
    }
  };

  const handleReportUser = async (userId) => {
    try {
      if (window.confirm("Report this user?")) {
        await API.post(`/users/${userId}/report`, { reason: 'abuse' });
        alert('User reported.');
        setShowHeaderMenu(false);
      }
    } catch (error) { console.error(error); }
  };

  const openViewOnce = (message) => {
    if ((message.sender === user._id)) return;
    if (message.isOpened) return;

    setViewOnceContent({
      id: message._id,
      type: message.type,
      content: message.content,
      url: message.fileUrl || message.mediaUrl || message.url
    });
  };

  const closeViewOnce = () => {
    if (viewOnceContent) {
      setMessages(prev => prev.map(m =>
        m._id === viewOnceContent.id ? { ...m, isOpened: true } : m
      ));
      if (viewOnceContent.id) {
        MESSAGES_API.post(`/messages/${viewOnceContent.id}/view`).catch(() => { });
      }
      setViewOnceContent(null);
    }
  };

  // Audio Playback Speed Control
  const cyclePlaybackSpeed = (messageId, audioElement) => {
    const speeds = [1, 1.5, 2, 2.5, 3];
    const currentSpeed = audioPlaybackSpeeds[messageId] || 1;
    const currentIndex = speeds.indexOf(currentSpeed);
    const nextIndex = (currentIndex + 1) % speeds.length;
    const nextSpeed = speeds[nextIndex];

    setAudioPlaybackSpeeds(prev => ({
      ...prev,
      [messageId]: nextSpeed
    }));

    if (audioElement) {
      audioElement.playbackRate = nextSpeed;
    }
  };

  // Searching logic
  const filteredConversations = conversations.filter(conv => {
    if (searchTerm.trim().length >= 2 && userSearchResults.length > 0) return false;
    const otherUser = getOtherParticipant(conv);
    if (!otherUser || !otherUser._id) return false;
    const haystack = [otherUser.name || '', otherUser.username || '', otherUser.email || ''].join(' ').toLowerCase();
    return haystack.includes(searchTerm.toLowerCase());
  });

  const pinnedConvos = filteredConversations.filter(c => pinnedContacts.has(getOtherParticipant(c)._id));
  const regularConvos = filteredConversations.filter(c => !pinnedContacts.has(getOtherParticipant(c)._id));

  const startDMWithUser = async (targetUser) => {
    if (startingDM) return;
    setStartingDM(true);
    try {
      const { data } = await MESSAGES_API.post('/dm', { targetUserId: targetUser._id });
      let convo = data;
      if (!convo.participants || convo.participants.length < 2) {
        convo = { ...data, participants: [{ _id: user._id, name: user.name, avatar: user.avatar }, targetUser] };
      }
      refetchConversations(); // Refetch to update cache
      setSelectedConversation(convo);
      setSearchTerm('');
      setUserSearchResults([]);
    } catch (e) {
      console.error(e);
      if (e.response && e.response.status === 403) {
        alert("You can only message users you are connected with.");
      } else {
        alert("Failed to start conversation.");
      }
    }
    finally { setStartingDM(false); }
  };

  const fetchMessages = async (conversationId) => {
    try {
      const response = await MESSAGES_API.get(`/conversations/${conversationId}/messages`);
      const fetchedMessages = response.data || [];
      const processedMessages = fetchedMessages.map(msg => ({
        ...msg,
        isOwn: msg.sender === user?._id || msg.sender?._id === user?._id
      }));
      setMessages(processedMessages);

      // Mark conversation as read (bulk) using new API
      MESSAGES_API.post(`/conversations/${conversationId}/read`)
        .then(() => {
          refetchConversations(); // Refetch to update unread count
        })
        .catch(err => console.error('Error marking read:', err));
    } catch (error) { console.error(error); }
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    if (!socketRef.current || !selectedConversation) return;

    socketRef.current.emit('typing:start', { conversationId: selectedConversation._id });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current.emit('typing:stop', { conversationId: selectedConversation._id });
    }, 2000);
  };

  const onEmojiClick = (emojiData) => {
    setNewMessage(prev => prev + emojiData.emoji);
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    setSending(true);
    try {
      const messageData = {
        content: newMessage,
        type: 'text',
        timestamp: new Date().toISOString(),
        isEphemeral: disappearingMode,
        isViewOnce: isViewOnce,
        replyTo: replyingTo ? replyingTo._id : null,
      };

      await MESSAGES_API.post(`/conversations/${selectedConversation._id}/messages`, messageData);
      setNewMessage('');
      setIsViewOnce(false);
      setReplyingTo(null);
    } catch (error) { console.error(error); }
    finally { setSending(false); }
  };

  // File Upload Handler
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !selectedConversation) return;

    // Check file size (50MB limit)
    if (file.size > 50 * 1024 * 1024) {
      alert('File size must be less than 50MB');
      return;
    }

    setUploadingFile(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      await MESSAGES_API.post(`/conversations/${selectedConversation._id}/attachments`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Failed to upload file. Please try again.");
    } finally {
      setUploadingFile(false);
    }
  };

  // Recording Logic
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingDuration(0);
      recordingIntervalRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Could not access microphone. Please check permissions.");
    }
  };

  const stopRecording = (shouldSend = true) => {
    if (!mediaRecorderRef.current) return;

    mediaRecorderRef.current.onstop = async () => {
      clearInterval(recordingIntervalRef.current);
      setIsRecording(false);
      setRecordingDuration(0);

      if (shouldSend && audioChunksRef.current.length > 0) {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        // Use 'voice_message.webm' and type 'audio/webm'
        const file = new File([audioBlob], "voice_message.webm", { type: 'audio/webm' });

        const formData = new FormData();
        formData.append('file', file);

        try {
          await MESSAGES_API.post(`/conversations/${selectedConversation._id}/attachments`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
        } catch (error) {
          console.error("Error sending voice message:", error);
          alert("Failed to send voice message");
        }
      }

      // Cleanup tracks
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    };

    mediaRecorderRef.current.stop();
  };

  const cancelRecording = () => {
    stopRecording(false);
  };

  // Socket and Effects
  useEffect(() => {
    // React Query handles fetching conversations automatically
    const base = process.env.REACT_APP_API_URL || 'http://localhost:4000';
    const socketUrl = base.replace(/\/$/, '');
    const stored = localStorage.getItem('profile');
    const token = stored ? JSON.parse(stored).accessToken : null;

    socketRef.current = io(socketUrl, {
      path: '/socket.io',
      auth: { token }
    });

    socketRef.current.on('message:notify', (message) => {
      // Refetch conversations to update with new message
      refetchConversations();
    });

    return () => { if (socketRef.current) socketRef.current.disconnect(); };
  }, []);

  useEffect(() => {
    selectedConversationIdRef.current = selectedConversation?._id;
    if (!selectedConversation) return;
    fetchMessages(selectedConversation._id);

    // Reset transient states
    setIsViewOnce(false);
    setActiveMessageId(null);
    setReplyingTo(null);

    if (socketRef.current) {
      socketRef.current.emit('conversation:join', { conversationId: selectedConversation._id });

      const handleMessage = (msg) => {
        if (msg.conversation === selectedConversation._id || msg.conversation?._id === selectedConversation._id) {
          const isOwn = (msg.sender === user._id) || (msg.sender?._id === user._id);
          setMessages(prev => {
            if (prev.some(m => m._id === msg._id)) return prev;
            return [...prev, { ...msg, isOwn }];
          });
          if (!isOwn) {
            MESSAGES_API.post(`/conversations/${selectedConversation._id}/read`).catch(() => { });
          }
          setTimeout(scrollToBottom, 0);
        }
      };

      socketRef.current.on('message', handleMessage);
      socketRef.current.on('message:deleted', ({ messageId }) => {
        setMessages(prev => prev.filter(m => m._id !== messageId));
      });
      socketRef.current.on('conversation:read', ({ conversationId, userId: readerId }) => {
        if (conversationId === selectedConversation._id && readerId !== user._id) {
          setMessages(prev => prev.map(m => m.isOwn ? { ...m, readBy: [...(m.readBy || []), readerId] } : m));
        }
      });
      socketRef.current.on('typing:update', ({ conversationId, userId, typing }) => {
        if (conversationId === selectedConversation._id && userId !== user._id) setIsTyping(typing);
      });

      return () => {
        socketRef.current.emit('conversation:leave', { conversationId: selectedConversation._id });
        socketRef.current.off('message', handleMessage);
        socketRef.current.off('message:deleted');
        socketRef.current.off('conversation:read');
        socketRef.current.off('typing:update');
      };
    }
  }, [selectedConversation]);

  useEffect(() => { scrollToBottom(); }, [messages]);

  // Close emoji picker and header menu on click outside or scroll
  useEffect(() => {
    const handleClickOutside = (e) => {
      // Close emoji picker if clicking outside
      if (showEmojiPicker && !e.target.closest('.emoji-picker-container') && !e.target.closest('.emoji-toggle-btn')) {
        setShowEmojiPicker(false);
      }
      // Close header menu if clicking outside
      if (showHeaderMenu && !e.target.closest('.header-menu-container') && !e.target.closest('.header-menu-btn')) {
        setShowHeaderMenu(false);
      }
    };

    const handleScroll = (e) => {
      // Don't close emoji picker if scrolling inside it
      if (showEmojiPicker && e.target.closest('.emoji-picker-container')) {
        return;
      }

      if (showEmojiPicker) setShowEmojiPicker(false);
      if (showHeaderMenu) setShowHeaderMenu(false);
    };

    if (showEmojiPicker || showHeaderMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('scroll', handleScroll, true);
      document.addEventListener('wheel', handleScroll, { passive: true });
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('scroll', handleScroll, true);
      document.removeEventListener('wheel', handleScroll);
    };
  }, [showEmojiPicker, showHeaderMenu]);

  useEffect(() => {
    const term = searchTerm.trim();
    if (term.length < 2) { setUserSearchResults([]); return; }
    const t = setTimeout(async () => {
      setIsSearchingUsers(true);
      try {
        const { data } = await API.get(`/search?q=${encodeURIComponent(term)}`);
        setUserSearchResults(data?.users?.filter(u => u._id !== user._id) || []);
      } catch (error) { setUserSearchResults([]); }
      finally { setIsSearchingUsers(false); }
    }, 250);
    return () => clearTimeout(t);
  }, [searchTerm]);

  // Handle automatic conversation opening from navigation state
  useEffect(() => {
    if (location.state?.selectedUser && conversations.length > 0) {
      const targetUser = location.state.selectedUser;
      // Start DM with the selected user
      startDMWithUser(targetUser);
      // Clear the state to prevent re-triggering
      window.history.replaceState({}, document.title);
    }
  }, [location.state, conversations]);

  // Render Helpers
  const renderConversationItem = (conversation) => {
    const otherUser = getOtherParticipant(conversation);
    const isSelected = selectedConversation?._id === conversation._id;
    const isPinned = pinnedContacts.has(otherUser._id);
    const isLongPressed = longPressedConvo === conversation._id;

    const handleLongPressStart = (e) => {
      // Clear any existing timer
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
      }

      // Start new timer for 1.5 seconds
      longPressTimerRef.current = setTimeout(() => {
        setLongPressedConvo(conversation._id);
      }, 1500);
    };

    const handleLongPressEnd = () => {
      // Clear timer if released before 1.5 seconds
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }
    };

    const handleConversationClick = () => {
      // Only select conversation if not showing action buttons
      if (!isLongPressed) {
        setSelectedConversation(conversation);
      }
    };

    return (
      <div
        key={conversation._id}
        onClick={handleConversationClick}
        onMouseDown={handleLongPressStart}
        onMouseUp={handleLongPressEnd}
        onMouseLeave={handleLongPressEnd}
        onTouchStart={handleLongPressStart}
        onTouchEnd={handleLongPressEnd}
        onTouchCancel={handleLongPressEnd}
        className={`group mx-2 mb-1 p-4 cursor-pointer transition-all duration-200 relative rounded-xl
          ${isSelected
            ? (isDarkMode ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 shadow-lg shadow-blue-500/10' : 'bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 shadow-md')
            : (isDarkMode ? 'hover:bg-white/5 border border-transparent hover:border-white/10' : 'hover:bg-gray-50 border border-transparent hover:border-gray-200')
          }`}
      >
        <div className="flex items-center space-x-3">
          <div className="relative">
            <img
              src={otherUser.avatar || AVATAR_PLACEHOLDER}
              className={`w-14 h-14 rounded-full object-cover ring-2 transition-all ${isSelected ? (isDarkMode ? 'ring-blue-500/50' : 'ring-blue-400') : (isDarkMode ? 'ring-white/10' : 'ring-gray-200')} group-hover:ring-blue-400/50`}
              onError={(e) => { e.currentTarget.src = AVATAR_PLACEHOLDER; }}
            />
            <OnlineIndicator userId={otherUser._id} size="sm" showOffline={true} />
            {isPinned && (
              <div className="absolute -top-1 -right-1 bg-gradient-to-br from-red-500 to-pink-500 rounded-full p-1 shadow-lg">
                <HiHeart className='w-3 h-3 text-white' />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <p className={`text-sm font-semibold truncate ${isSelected ? (isDarkMode ? 'text-white' : 'text-gray-900') : (isDarkMode ? 'text-gray-100' : 'text-gray-900')}`}>
                {otherUser.name || 'User'}
              </p>
              {conversation.lastMessage && (
                <span className={`text-[10px] font-medium ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  {formatTime(conversation.lastMessage.createdAt)}
                </span>
              )}
            </div>
            {conversation.lastMessage && (
              <div className="flex items-center justify-between">
                <p className={`text-xs truncate flex-1 ${isSelected ? (isDarkMode ? 'text-gray-300' : 'text-gray-600') : (isDarkMode ? 'text-gray-400' : 'text-gray-500')}`}>
                  {conversation.lastMessage.isViewOnce ? (
                    <span className="italic flex items-center gap-1">
                      <Bs1Circle size={10} /> View Once
                    </span>
                  ) : (
                    conversation.lastMessage.content
                  )}
                </p>
                {conversation.unreadCount > 0 && (
                  <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-[10px] rounded-full px-2 py-0.5 ml-2 font-bold shadow-lg shadow-orange-500/30 animate-pulse">
                    {conversation.unreadCount}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons - Shows after long press */}
        {isLongPressed && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5 bg-gradient-to-r from-gray-900/95 to-black/95 dark:from-gray-800/95 dark:to-gray-900/95 p-1.5 rounded-xl shadow-2xl border border-white/10">
            {/* Close Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setLongPressedConvo(null);
              }}
              className={`p-2 rounded-lg transition-all duration-200 hover:scale-110 ${isDarkMode
                ? 'bg-gray-700/50 hover:bg-gray-600 text-gray-300'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-600'
                }`}
              title="Close"
            >
              <HiXMark size={16} />
            </button>

            {/* Pin Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                togglePinContact(otherUser._id);
                setLongPressedConvo(null);
              }}
              className={`p-2 rounded-lg transition-all duration-200 hover:scale-110 ${isPinned
                ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg shadow-red-500/30'
                : (isDarkMode ? 'bg-gray-700/50 hover:bg-gray-600 text-gray-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-600')
                }`}
              title={isPinned ? "Unpin conversation" : "Pin conversation"}
            >
              {isPinned ? <HiHeart size={16} /> : <HiOutlineHeart size={16} />}
            </button>

            {/* Delete Button */}
            <button
              onClick={(e) => {
                handleDeleteConversation(conversation._id, e);
                setLongPressedConvo(null);
              }}
              className={`p-2 rounded-lg transition-all duration-200 hover:scale-110 ${isDarkMode
                ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400'
                : 'bg-red-100 hover:bg-red-200 text-red-600'
                }`}
              title="Delete conversation"
            >
              <HiOutlineTrash size={16} />
            </button>
          </div>
        )}
      </div>
    );
  };

  // Render
  return (
    <div className={`fixed inset-0 md:static md:h-[100dvh] flex overflow-hidden md:pt-16 ${isDarkMode ? 'bg-gray-950 text-gray-100' : 'bg-white text-gray-800'}`}>
      {/* Sidebar List */}
      <div className={`w-full md:w-96 flex flex-col h-full overflow-hidden border-r ${isDarkMode ? 'border-gray-800 bg-gray-950' : 'border-gray-200 bg-white'} ${selectedConversation ? 'hidden md:flex' : 'flex'}`}>

        {/* Mobile Header with Back Button */}
        <div className={`md:hidden flex items-center px-4 py-3 gap-3 ${isDarkMode ? 'bg-gray-950' : 'bg-white'} z-10 border-b ${isDarkMode ? 'border-gray-800' : 'border-gray-100'}`}>
          <button
            onClick={() => navigate('/home')}
            className={`p-2 rounded-full active:scale-95 transition-transform ${isDarkMode ? 'active:bg-white/10 text-white' : 'active:bg-gray-100 text-gray-900'}`}
          >
            <HiOutlineArrowLeft size={24} />
          </button>
          <h1 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Messages</h1>
        </div>

        {/* Search Bar */}
        <div className="px-4 py-3 shrink-0">
          <div className={`relative px-4 py-2.5 rounded-full flex items-center gap-3 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
            <HiMagnifyingGlass className={`${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} size={20} />
            <input
              className={`bg-transparent border-none focus:ring-0 text-sm w-full outline-none placeholder:text-sm ${isDarkMode ? 'text-white placeholder-gray-500' : 'text-gray-900 placeholder-gray-400'}`}
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                onClick={() => { setSearchTerm(''); setUserSearchResults([]); }}
                className={`p-1 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-gray-800 text-gray-500' : 'hover:bg-gray-200 text-gray-400'}`}
              >
                <HiXMark size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar min-h-0">
          {searchTerm.length >= 2 ? (
            <div className="px-2">
              {isSearchingUsers ? (
                <div className="p-8 text-center">
                  <div className="inline-block w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-2"></div>
                  <p className="text-xs text-gray-400">Searching...</p>
                </div>
              ) : userSearchResults.length > 0 ? (
                userSearchResults.map(u => (
                  <div
                    key={u._id}
                    onClick={() => startDMWithUser(u)}
                    className={`p-3 mx-2 mb-1 rounded-xl cursor-pointer transition-all hover:scale-[1.02] ${isDarkMode ? 'hover:bg-white/5 border border-transparent hover:border-white/10' : 'hover:bg-gray-50 border border-transparent hover:border-gray-200'}`}
                  >
                    <div className="flex items-center gap-3">
                      <img src={u.avatar || AVATAR_PLACEHOLDER} className="w-12 h-12 rounded-full object-cover ring-2 ring-blue-500/20" />
                      <div className="flex-1 min-w-0">
                        <p className={`font-semibold text-sm truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{u.name}</p>
                        <p className={`text-xs truncate ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>@{u.username}</p>
                      </div>
                      <HiOutlinePlus className="text-blue-500" size={20} />
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center">
                  <p className="text-sm text-gray-400">No users found</p>
                </div>
              )}
            </div>
          ) : (
            <>
              {pinnedConvos.length > 0 && (
                <div className="px-6 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
                  <HiHeart size={14} className="text-red-500" />
                  Pinned
                </div>
              )}
              {pinnedConvos.map(renderConversationItem)}

              {regularConvos.length > 0 && (
                <div className="px-6 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-400 mt-2">
                  All Messages
                </div>
              )}

              {/* Show skeleton loaders while loading */}
              {conversations.length === 0 && loading && (
                <div className="px-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className={`p-3 mx-2 mb-2 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'} animate-pulse`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
                        <div className="flex-1">
                          <div className={`h-4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded w-3/4 mb-2`}></div>
                          <div className={`h-3 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded w-1/2`}></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Show empty state only when not loading and no conversations */}
              {conversations.length === 0 && !loading && (
                <div className="p-12 text-center">
                  <HiOutlineChatBubbleLeft className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? 'text-gray-700' : 'text-gray-300'}`} />
                  <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>No messages yet</p>
                  <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>Start a conversation to get started</p>
                </div>
              )}

              {regularConvos.map(renderConversationItem)}
            </>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`flex-1 flex flex-col h-full overflow-hidden relative w-full ${!selectedConversation ? 'hidden md:flex' : 'flex'} ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        {!selectedConversation ? (
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className={`p-8 rounded-2xl ${isDarkMode ? 'bg-gray-800' : 'bg-white shadow-sm'}`}>
              <HiOutlineChatBubbleLeft className={`w-20 h-20 mx-auto mb-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-300'}`} />
              <p className={`text-lg font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Select a conversation</p>
              <p className={`text-sm mt-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Choose a chat to start messaging</p>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className={`shrink-0 px-4 py-3 flex items-center justify-between ${isDarkMode ? 'bg-gray-950' : 'bg-white'} z-40 border-b ${isDarkMode ? 'border-gray-800' : 'border-gray-100'}`}>
              <div className="flex items-center gap-3 flex-1">
                {/* Back to conversation list (mobile only) */}
                <button
                  onClick={() => setSelectedConversation(null)}
                  className={`md:hidden p-2 rounded-full active:scale-95 transition-transform ${isDarkMode ? 'active:bg-white/10 text-gray-300' : 'active:bg-gray-100 text-gray-600'}`}
                  title="Back to conversations"
                >
                  <HiOutlineArrowLeft size={22} />
                </button>

                <div className="relative">
                  <img
                    src={getOtherParticipant(selectedConversation).avatar || AVATAR_PLACEHOLDER}
                    className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full object-cover ring-2 ${isDarkMode ? 'ring-white/20' : 'ring-gray-200'}`}
                  />
                  <OnlineIndicator userId={getOtherParticipant(selectedConversation)._id} size="sm" showOffline={false} />
                </div>

                <div>
                  <h3 className={`font-bold text-sm sm:text-base flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {getOtherParticipant(selectedConversation).name}
                    {blockedUsers.has(getOtherParticipant(selectedConversation)._id) && (
                      <span className="px-2 py-0.5 bg-red-500/10 text-red-500 text-[10px] rounded-full border border-red-500/20">
                        Blocked
                      </span>
                    )}
                  </h3>
                  <span className={`text-[11px] sm:text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {isUserOnline(getOtherParticipant(selectedConversation)._id) ? 'Active now' : 'Offline'}
                  </span>
                </div>
              </div>

              <div className="relative header-menu-container">
                <button
                  onClick={() => setShowHeaderMenu(!showHeaderMenu)}
                  className={`header-menu-btn p-2.5 rounded-xl transition-all hover:scale-105 ${isDarkMode ? 'text-gray-300 hover:bg-white/10' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <HiEllipsisVertical size={20} />
                </button>
                {showHeaderMenu && (
                  <div className={`header-menu-container absolute right-0 top-12 w-52 py-2 rounded-2xl shadow-2xl border z-50 backdrop-blur-xl ${isDarkMode ? 'bg-gray-900/95 border-white/10 text-gray-200' : 'bg-white/95 border-gray-200 text-gray-700'}`}>
                    <button
                      onClick={handleClearChat}
                      className={`w-full text-left px-4 py-3 text-sm flex items-center gap-3 transition-colors ${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-gray-50'}`}
                    >
                      <HiOutlineTrash size={18} /> Clear Chat
                    </button>
                    <button
                      onClick={() => handleBlockToggle(getOtherParticipant(selectedConversation)._id)}
                      className={`w-full text-left px-4 py-3 text-sm flex items-center gap-3 text-red-500 transition-colors ${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-gray-50'}`}
                    >
                      <MdBlock size={18} /> {blockedUsers.has(getOtherParticipant(selectedConversation)._id) ? 'Unblock' : 'Block'}
                    </button>
                    <button
                      onClick={() => handleReportUser(getOtherParticipant(selectedConversation)._id)}
                      className={`w-full text-left px-4 py-3 text-sm flex items-center gap-3 text-orange-500 transition-colors ${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-gray-50'}`}
                    >
                      <MdReport size={18} /> Report
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Messages Feed */}
            <div className={`flex-1 overflow-y-auto p-4 sm:p-6 space-y-2 custom-scrollbar ${isDarkMode ? 'bg-gradient-to-b from-transparent to-black/20' : 'bg-gradient-to-b from-transparent to-gray-50/50'}`}>
              {messages.map((msg, i) => {
                const isOwn = msg.isOwn;
                return (
                  <div key={msg._id || i} className={`flex gap-2 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] sm:max-w-[70%] md:max-w-[60%] group relative`}>
                      {/* Bubble */}
                      <div className={`px-3 py-2 shadow-lg relative text-[14.5px] leading-[20px] break-words transition-all hover:shadow-xl
                           ${isOwn
                          ? (isDarkMode ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-2xl rounded-tr-md' : 'bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl rounded-tr-md')
                          : (isDarkMode ? 'bg-gradient-to-br from-gray-800 to-gray-900 text-gray-100 rounded-2xl rounded-tl-md border border-white/10' : 'bg-white text-gray-900 rounded-2xl rounded-tl-md border border-gray-200')
                        }
                         `}>

                        {msg.isViewOnce ? (
                          <button
                            onClick={() => openViewOnce(msg)}
                            className={`flex items-center gap-2 font-medium py-1 px-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-black/5'}`}
                          >
                            <Bs1Circle size={16} /> {msg.isOpened ? 'Opened' : 'View Once'}
                          </button>
                        ) : (
                          <div className="flex flex-col">
                            {msg.type === 'image' && <img src={msg.mediaUrl} alt="Image" className="max-w-[280px] rounded-xl mb-2 shadow-md" />}
                            {msg.type === 'video' && <video src={msg.mediaUrl} controls className="max-w-[280px] rounded-xl mb-2 shadow-md" />}
                            {msg.type === 'audio' ? (
                              <div className="flex items-center gap-2 w-[220px] sm:w-[240px] py-2">
                                <button
                                  onClick={(e) => {
                                    const audioEl = e.currentTarget.parentElement.querySelector('audio');
                                    cyclePlaybackSpeed(msg._id, audioEl);
                                  }}
                                  className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all hover:scale-105 ${isDarkMode
                                    ? 'bg-white/20 text-white hover:bg-white/30'
                                    : 'bg-black/10 text-gray-700 hover:bg-black/20'
                                    }`}
                                  title="Change playback speed"
                                >
                                  {audioPlaybackSpeeds[msg._id] || 1}x
                                </button>
                                <audio
                                  ref={(el) => {
                                    if (el && audioPlaybackSpeeds[msg._id]) {
                                      el.playbackRate = audioPlaybackSpeeds[msg._id];
                                    }
                                  }}
                                  controls
                                  controlsList="nodownload noplaybackrate"
                                  src={msg.mediaUrl}
                                  className="flex-1 h-8"
                                />
                              </div>
                            ) : (
                              <span className="whitespace-pre-wrap">{msg.content}</span>
                            )}
                            <div className={`text-[10px] h-[14px] flex items-center justify-end gap-1.5 select-none ml-auto mt-1 ${isOwn ? 'text-white/70' : (isDarkMode ? 'text-gray-400' : 'text-gray-500')}`}>
                              <span>{formatTime(msg.createdAt)}</span>
                              {isOwn && (
                                <span className="flex items-center">
                                  {getMessageStatus(msg)}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Hover Delete Action */}
                      <button
                        onClick={() => handleDeleteMessage(msg._id)}
                        className={`absolute top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1.5 rounded-lg transition-all hover:scale-110 ${isOwn ? '-left-10' : '-right-10'} ${isDarkMode ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400' : 'bg-red-100 hover:bg-red-200 text-red-600'}`}
                      >
                        <MdDeleteOutline size={16} />
                      </button>

                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className={`shrink-0 px-2 sm:px-4 py-2 flex items-center gap-2 z-30 backdrop-blur-xl border-t ${isDarkMode ? 'bg-black/40 border-white/10' : 'bg-white/80 border-gray-200/50'}`}>

              {/* Emoji Picker */}
              {showEmojiPicker && !isRecording && (
                <div className="emoji-picker-container absolute bottom-16 left-4 z-50 shadow-2xl rounded-2xl overflow-hidden">
                  <EmojiPicker
                    theme={isDarkMode ? Theme.DARK : Theme.LIGHT}
                    emojiStyle={EmojiStyle.APPLE}
                    onEmojiClick={onEmojiClick}
                    width={300}
                    height={400}
                    searchDisabled={false}
                    skinTonesDisabled={true}
                    previewConfig={{ showPreview: false }}
                  />
                </div>
              )}

              {isRecording ? (
                <div className={`flex-1 flex items-center gap-2 justify-center py-1 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                  <button
                    onClick={cancelRecording}
                    className={`p-2 rounded-full transition-all active:scale-90 ${isDarkMode ? 'text-red-400 bg-red-500/10' : 'text-red-500 bg-red-50'}`}
                    title="Cancel"
                  >
                    <HiOutlineTrash size={20} />
                  </button>

                  <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20">
                    <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse shadow-red-500/50"></div>
                    <span className="font-mono text-sm font-semibold">{formatDuration(recordingDuration)}</span>
                  </div>

                  <button
                    onClick={() => stopRecording(true)}
                    className={`p-2 rounded-full transition-all active:scale-90 shadow-lg ${isDarkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'}`}
                    title="Send"
                  >
                    <HiOutlinePaperAirplane className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <>
                  {/* Hidden File Input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/*,audio/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/*,audio/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />

                  <form onSubmit={sendMessage} className="flex-1 w-full max-w-3xl mx-auto flex items-center gap-2 min-w-0">
                    <button
                      type="button"
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className={`shrink-0 p-2 rounded-full transition-all active:scale-90 ${isDarkMode ? 'text-gray-400 hover:text-gray-200 active:bg-white/10' : 'text-gray-500 hover:text-gray-700 active:bg-gray-100'}`}
                    >
                      <HiOutlineFaceSmile size={24} />
                    </button>

                    <div className={`flex-1 flex items-center gap-1.5 sm:gap-2 rounded-full px-3 py-1.5 transition-all min-w-0 ${isDarkMode ? 'bg-gray-800 border border-transparent focus-within:border-white/10' : 'bg-gray-100 border border-transparent focus-within:border-gray-200'}`}>
                      <input
                        value={newMessage}
                        onChange={handleTyping}
                        placeholder="Type a message..."
                        className={`flex-1 bg-transparent border-none focus:ring-0 outline-none text-[15px] min-w-0 ${isDarkMode ? 'text-white placeholder-gray-500' : 'text-gray-900 placeholder-gray-500'}`}
                      />

                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingFile}
                        className={`shrink-0 p-1.5 rounded-full transition-all active:scale-90 ${uploadingFile
                          ? 'opacity-50 cursor-not-allowed'
                          : (isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700')
                          }`}
                        title="Attach file"
                      >
                        <HiOutlinePaperClip size={20} />
                      </button>

                      <button
                        type="button"
                        onClick={() => setIsViewOnce(!isViewOnce)}
                        className={`shrink-0 p-1.5 rounded-full transition-all active:scale-90 ${isViewOnce ? 'text-blue-500 bg-blue-500/10' : (isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700')}`}
                        title="View once"
                      >
                        <Bs1Circle size={18} />
                      </button>
                    </div>

                    {newMessage.trim() ? (
                      <button
                        type="submit"
                        className={`shrink-0 p-3 rounded-full transition-all active:scale-90 ${isDarkMode ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'}`}
                      >
                        <HiOutlinePaperAirplane className="w-5 h-5 translate-x-0.5 translate-y-0.5" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={startRecording}
                        className={`shrink-0 p-3 rounded-full transition-all active:scale-90 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-900'}`}
                      >
                        <HiOutlineMicrophone size={22} />
                      </button>
                    )}
                  </form>
                </>
              )}
            </div>
          </>
        )
        }
      </div >

      {/* View Once Modal */}
      {
        viewOnceContent && (
          <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center p-4">
            <button onClick={closeViewOnce} className="absolute top-4 right-4 p-2 bg-white/10 rounded-full text-white"><HiXMark size={24} /></button>
            <div className="max-w-4xl max-h-[90vh] overflow-auto">
              {viewOnceContent.type === 'image' && <img src={viewOnceContent.url} className="max-w-full rounded" />}
              {viewOnceContent.type === 'video' && <video src={viewOnceContent.url} controls autoPlay className="max-w-full rounded" />}
              {viewOnceContent.type === 'text' && <div className="text-white text-2xl font-bold p-10 text-center">{viewOnceContent.content}</div>}
            </div>
          </div>
        )
      }
    </div >
  );
};

export default Messages;
