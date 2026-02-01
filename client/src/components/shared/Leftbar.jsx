import { useMemo, useEffect, memo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import PrefetchLink from "./PrefetchLink";
import { useSelector, useDispatch } from "react-redux";
import { getJoinedCommunitiesAction } from "../../redux/actions/communityActions";
import {
  HiOutlineHome,
  HiOutlineUserCircle,
  HiOutlineRectangleStack,
  HiOutlineTag,
  HiOutlineAcademicCap,
  HiOutlineTrophy,
  HiOutlineClipboardDocumentList,
  HiOutlineUserGroup,
  HiOutlineChartBar,
} from "react-icons/hi2";
import { FaRegBuilding } from "react-icons/fa";
import { GiTeamIdea } from "react-icons/gi";
import { RiMessage2Line } from "react-icons/ri";
import { SiOpenai } from "react-icons/si";
import { GiNetworkBars } from "react-icons/gi";
import { MESSAGES_API } from "../../redux/api/utils";
import { io } from 'socket.io-client';

const Leftbar = ({ showLeftbar }) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

  const user = useSelector((state) => state.auth?.userData);
  const joinedCommunities = useSelector(
    (state) => state.community?.joinedCommunities
  );

  useEffect(() => {
    dispatch(getJoinedCommunitiesAction());
  }, [dispatch]);

  // Fetch unread messages count
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const response = await MESSAGES_API.get('/conversations');
        const conversations = response.data || [];
        const total = conversations.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0);
        setUnreadCount(total);
      } catch (error) {
        console.error('Error fetching unread count:', error);
      }
    };

    fetchUnreadCount();

    // Setup socket connection for real-time updates
    const base = process.env.REACT_APP_API_URL || 'http://localhost:4000';
    const socketUrl = base.replace(/\/$/, '');
    const stored = localStorage.getItem('profile');
    const token = stored ? JSON.parse(stored).accessToken : null;

    const socket = io(socketUrl, {
      path: '/socket.io',
      auth: { token }
    });

    socket.on('message:notify', () => {
      fetchUnreadCount();
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const visibleCommunities = useMemo(() => {
    return joinedCommunities?.slice(0, 5);
  }, [joinedCommunities]);

  const communityLinks = useMemo(() => {
    return visibleCommunities?.map((community) => ({
      href: `/community/${community.name}`,
      label: community.name,
      id: community._id
    }));
  }, [visibleCommunities]);

  const navigationItems = [
    {
      href: "/home",
      label: "Home",
      icon: HiOutlineHome,
      className: "hidden lg:flex",
      prefetchType: "feed"
    },
    {
      href: "/saved",
      label: "Saved",
      icon: HiOutlineTag
    },
    {
      href: "/alumni-hub",
      label: "Alumni Hub",
      icon: HiOutlineAcademicCap
    },
    {
      href: "/connections",
      label: "Connections",
      icon: HiOutlineUserGroup,
      show: user?.role === "alumni"
    },
    {
      href: "/clubs",
      label: "Clubs",
      icon: FaRegBuilding,
      prefetchType: "clubs"
    },
    {
      href: "/surveys",
      label: "Surveys",
      icon: HiOutlineClipboardDocumentList
    },
    {
      href: "/collabs",
      label: "Collab Board",
      icon: GiNetworkBars
    },
    {
      href: "/performance",
      label: "Performance",
      icon: HiOutlineChartBar
    },
    {
      href: "/ai",
      label: "AI Chat",
      icon: SiOpenai,
      className: "hidden lg:flex"
    }
  ];

  return (
    <div className="leftbar-container w-64 lg:w-72 h-full bg-white/90 dark:bg-black/90 border-r border-white/30 dark:border-white/10 transition-colors duration-300 flex flex-col">
      <div className="flex-1 overflow-y-auto pt-6 lg:pt-24 pb-24 md:pb-6 px-4 custom-scrollbar scroll-smooth">
        {/* Logo Section */}
        <div className="mb-8 px-2 pt-2 lg:hidden">
          <h1 className="text-2xl font-bold text-black dark:text-white" style={{ fontFamily: 'cursive' }}>
            𝓒𝓪𝓶𝓹𝓾𝓼 𝓒𝓸𝓷𝓷𝓮𝓬𝓽𝓼
          </h1>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1.5">
          {navigationItems
            .filter(item => item.show !== false)
            .map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;

              return (
                <PrefetchLink
                  key={item.href}
                  to={item.href}
                  prefetchType={item.prefetchType}
                  className={`group flex items-center justify-between px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${isActive
                    ? "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-gray-200"
                    } ${item.className || 'flex'}`}
                >
                  <div className="flex items-center">
                    <Icon className={`mr-3 h-5 w-5 transition-colors ${isActive
                      ? "text-orange-600 dark:text-orange-400"
                      : "text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300"
                      }`} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="ml-auto bg-gradient-to-r from-red-500 to-red-600 text-white text-[10px] font-bold rounded-full px-2 py-0.5 min-w-[20px] text-center shadow-lg shadow-red-500/30 animate-pulse">
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}
                </PrefetchLink>
              );
            })}
        </nav>

        {/* Communities Section */}
        {communityLinks && communityLinks.length > 0 && (
          <div className="mt-8 pt-6 border-t border-gray-100 dark:border-white/5">
            <div className="flex items-center justify-between mb-4 px-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Communities
              </div>
              <Link
                to="/my-communities"
                className="text-xs font-medium text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 transition-colors"
              >
                See all
              </Link>
            </div>

            <ul className="space-y-1">
              {communityLinks.map((communityLink) => (
                <li key={communityLink.href}>
                  <PrefetchLink
                    to={communityLink.href}
                    prefetchType="community"
                    prefetchId={communityLink.id}
                    className="flex items-center px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg transition-colors group"
                  >
                    <div className="w-2 h-2 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full mr-3 group-hover:scale-125 transition-transform"></div>
                    <span className="truncate">{communityLink.label}</span>
                  </PrefetchLink>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Mobile quick access */}
        <div className="lg:hidden mt-6 pt-6 border-t border-gray-100 dark:border-white/5">
          <div className="grid grid-cols-1 gap-3">
            <Link
              to="/communities"
              className="flex items-center justify-center gap-2 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 font-medium text-sm transition-colors border border-orange-100 dark:border-orange-900/30 rounded-xl py-2.5"
            >
              <GiTeamIdea className="h-5 w-5" />
              Communities
            </Link>
          </div>
        </div>
      </div>

      {/* User Info Footer */}
      <div className="p-4 border-t border-gray-200/50 dark:border-white/5 bg-gray-50/50 dark:bg-white/5 backdrop-blur-sm">
        <div className="flex items-center space-x-3">
          <img
            src={user?.avatar || "https://via.placeholder.com/40x40"}
            alt="Profile"
            className="h-10 w-10 rounded-full object-cover ring-2 ring-white dark:ring-dark-bg"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
              {user?.name || "User"}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 capitalize truncate">
              {user?.role || "Member"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(Leftbar);
