import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import { API } from "../redux/api/utils";
import { v1 as uuidv1 } from "uuid";
import useAppStore from "../store/useAppStore";
import {
  HiOutlinePaperAirplane,
  HiOutlineTrash,
  HiOutlinePlus,
  HiBars3,
  HiXMark,
  HiOutlineSparkles,
  HiUser,
  HiComputerDesktop,
  HiArrowLeft
} from "react-icons/hi2";
import { SiOpenai } from "react-icons/si";

const AIChat = () => {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Global State
  const {
    aiMessages: messages,
    addAiMessage,
    setAiMessages,
    aiChatHistory: chatHistory,
    addToAiChatHistory,
    removeFromAiChatHistory,
    aiThreadId: currentThreadId,
    setAiThreadId
  } = useAppStore();

  // Local State
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const messagesEndRef = useRef(null);
  const didMountRef = useRef(false);

  useEffect(() => {
    if (!currentThreadId) {
      setAiThreadId(uuidv1());
    }
  }, [currentThreadId, setAiThreadId]);

  const scrollToBottom = () =>
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  useEffect(() => {
    scrollToBottom(); // Always scroll on messages change
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: "user",
      timestamp: new Date().toISOString(),
    };

    addAiMessage(userMessage);
    setInputMessage("");
    setIsLoading(true);
    setError("");

    try {
      const { data } = await API.post("/ai/chat", {
        threadId: currentThreadId,
        message: userMessage.text,
      });

      const aiResponse = {
        id: Date.now() + 1,
        text: data.reply,
        sender: "ai",
        timestamp: new Date().toISOString(),
      };

      addAiMessage(aiResponse);
    } catch (err) {
      setError("Failed to get AI response.");
      const errorResponse = {
        id: Date.now() + 1,
        text: "Sorry, I encountered an error. Please try again.",
        sender: "ai",
        timestamp: new Date().toISOString(),
        isError: true
      };
      addAiMessage(errorResponse);
    } finally {
      setIsLoading(false);
    }
  };

  const startNewChat = () => {
    const currentMessages = messages;
    if (currentMessages.length > 0) {
      const title = currentMessages[0]?.text.slice(0, 30) + "..." || "New Chat";
      addToAiChatHistory({
        id: currentThreadId,
        title,
        messages: currentMessages,
        timestamp: new Date().toISOString(),
      });
    }

    setAiThreadId(uuidv1());
    setAiMessages([]);
  };

  const loadChat = (chat) => {
    setAiThreadId(chat.id);
    setAiMessages(chat.messages);
    setIsMobileSidebarOpen(false);
  };

  const deleteChat = (chatId) => {
    removeFromAiChatHistory(chatId);
  };

  return (
    <div className={`fixed inset-0 flex flex-col ${isDarkMode ? "bg-black text-white" : "bg-gray-50 text-gray-900"}`}>
      <div className="flex flex-1 overflow-hidden relative">

        {/* Mobile Overlay */}
        {isMobileSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-20 lg:hidden"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div className={`
          fixed lg:relative z-30 h-full w-72 flex flex-col border-r transition-transform duration-300 ease-in-out
          ${isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          ${isDarkMode ? "bg-black border-gray-800" : "bg-gray-50 border-gray-200"}
        `}>

          {/* Sidebar Header */}
          <div className="flex-shrink-0 p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-2 font-semibold text-gray-800 dark:text-white">
              <SiOpenai className="w-5 h-5" />
              <span>History</span>
            </div>
            <button
              onClick={() => setIsMobileSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-dark-bg-tertiary text-gray-500 dark:text-gray-400"
            >
              <HiXMark className="w-5 h-5" />
            </button>
          </div>

          {/* New Chat Button */}
          <div className="flex-shrink-0 p-4">
            <button
              onClick={startNewChat}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-orange-600 via-red-500 to-yellow-500 hover:opacity-90 text-white rounded-xl font-medium transition-all shadow-sm hover:shadow-md active:scale-[0.98] transform duration-100"
            >
              <HiOutlinePlus className="w-5 h-5" />
              <span>New Chat</span>
            </button>
          </div>

          {/* Chat History List */}
          <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-1 custom-scrollbar">
            {chatHistory.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-gray-400 dark:text-gray-500 text-sm italic">
                <HiOutlineSparkles className="w-8 h-8 mb-2 opacity-50" />
                <span>No previous chats</span>
              </div>
            ) : (
              chatHistory.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => loadChat(chat)}
                  className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all duration-200 border border-transparent ${isDarkMode
                    ? "hover:bg-dark-bg-tertiary hover:border-dark-border text-gray-300"
                    : "hover:bg-white hover:border-gray-200 hover:shadow-sm text-gray-700"
                    }`}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <HiOutlineSparkles className="w-4 h-4 flex-shrink-0 opacity-70" />
                    <span className="text-sm truncate font-medium">{chat.title}</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteChat(chat.id);
                    }}
                    className="p-1.5 rounded-md opacity-0 group-hover:opacity-100 hover:bg-red-100 hover:text-red-600 transition-all"
                  >
                    <HiOutlineTrash className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-white dark:bg-black">

          {/* Chat Header - Fixed */}
          <div className={`flex-shrink-0 h-14 sm:h-16 px-3 sm:px-4 flex items-center justify-between border-b ${isDarkMode ? "border-gray-800 bg-black" : "border-gray-100 bg-white"
            }`}>
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => navigate('/home')}
                className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-bg-tertiary transition-colors"
              >
                <HiArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 dark:text-gray-300" />
              </button>
              <button
                onClick={() => setIsMobileSidebarOpen(true)}
                className="lg:hidden p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-bg-tertiary transition-colors"
              >
                <HiBars3 className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 dark:text-gray-300" />
              </button>
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-orange-500 via-red-500 to-yellow-500 flex items-center justify-center text-white shadow-lg">
                  <SiOpenai className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <h2 className="font-bold text-sm sm:text-base text-gray-800 dark:text-white leading-tight">Campus AI</h2>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${isLoading ? "bg-yellow-400 animate-pulse" : "bg-green-500"}`}></span>
                    <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 font-medium">
                      {isLoading ? "Thinking..." : "Online"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Messages Container - Scrollable */}
          <div className={`flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6 ${isDarkMode ? "bg-black" : "bg-white"
            }`}>
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-4 sm:p-8 opacity-60">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-orange-50 dark:bg-orange-900/20 rounded-full flex items-center justify-center mb-4 sm:mb-6">
                  <SiOpenai className="w-8 h-8 sm:w-10 sm:h-10 text-orange-500" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white mb-2">How can I help you today?</h3>
                <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 max-w-md">
                  Ask me about campus events, communities, academic queries, or anything else on your mind.
                </p>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-2 sm:gap-4 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.sender === "ai" && (
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-orange-500 via-red-500 to-yellow-500 flex-shrink-0 flex items-center justify-center text-white mt-1">
                      <SiOpenai className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </div>
                  )}
                  <div
                    className={`max-w-[85%] sm:max-w-[75%] px-3 sm:px-5 py-2.5 sm:py-4 rounded-2xl shadow-sm text-sm sm:text-base ${msg.sender === "user"
                      ? isDarkMode
                        ? "bg-gradient-to-r from-orange-600 via-red-500 to-yellow-500 text-white rounded-tr-none"
                        : "bg-gradient-to-r from-orange-600 via-red-500 to-yellow-500 text-white rounded-tr-none"
                      : msg.isError
                        ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-tl-none"
                        : isDarkMode
                          ? "bg-dark-bg-tertiary border border-dark-border text-white rounded-tl-none"
                          : "bg-gray-100 border border-gray-200 text-gray-900 rounded-tl-none"
                      }`}
                  >
                    <p className="whitespace-pre-wrap break-words leading-relaxed">{msg.text}</p>
                  </div>
                  {msg.sender === "user" && (
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0 flex items-center justify-center text-gray-500 dark:text-gray-300 mt-1">
                      <HiUser className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                  )}
                </div>
              ))
            )}

            {isLoading && (
              <div className="flex gap-2 sm:gap-4 justify-start">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-orange-500 via-red-500 to-yellow-500 flex-shrink-0 flex items-center justify-center text-white mt-1">
                  <SiOpenai className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
                <div className={`px-4 sm:px-5 py-3 sm:py-4 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1.5 ${isDarkMode ? "bg-dark-bg-tertiary border border-dark-border" : "bg-gray-100 border border-gray-200"
                  }`}>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area - Fixed at Bottom */}
          <div className={`flex-shrink-0 p-3 sm:p-4 border-t ${isDarkMode ? "bg-black border-gray-800" : "bg-white border-gray-100"
            }`}>
            <form onSubmit={handleSendMessage} className="relative flex items-center gap-2 max-w-4xl mx-auto">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type your message..."
                className={`w-full pl-3 sm:pl-5 pr-12 sm:pr-14 py-2.5 sm:py-3.5 text-sm sm:text-base rounded-xl border outline-none transition-all shadow-sm focus:shadow-md ${isDarkMode
                  ? "bg-gray-900 text-white border-gray-800 focus:border-orange-500 placeholder-gray-500"
                  : "bg-white text-gray-900 border-gray-300 focus:border-orange-500 placeholder-gray-400"
                  }`}
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isLoading}
                className={`absolute right-1.5 sm:right-2 p-1.5 sm:p-2 rounded-lg transition-all duration-200 ${!inputMessage.trim() || isLoading
                  ? "bg-gray-100 text-gray-400 dark:bg-dark-bg-tertiary dark:text-gray-600 cursor-not-allowed"
                  : "bg-gradient-to-r from-orange-600 via-red-500 to-yellow-500 text-white hover:opacity-90 shadow-md hover:shadow-lg active:scale-95"
                  }`}
              >
                <HiOutlinePaperAirplane className="w-4 h-4 sm:w-5 sm:h-5 transform rotate-90" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIChat;
