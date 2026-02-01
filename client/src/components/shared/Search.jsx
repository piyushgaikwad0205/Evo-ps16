import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { API } from "../../redux/api/utils";
import debounce from "lodash/debounce";
import JoinModal from "../modals/JoinModal";
import { MoonLoader } from "react-spinners";
import { MdClear } from "react-icons/md";
import eventService from "../../services/eventService";
import { Calendar } from "lucide-react";

const BASE_URL = process.env.REACT_APP_API_URL;

const Search = () => {
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState("");
  const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [community, setCommunity] = useState(null);
  const [joinedCommunity, setJoinedCommunity] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const setInitialValue = () => {
    setUsers([]);
    setPosts([]);
    setEvents([]);
    setCommunity(null);
    setJoinedCommunity(null);
    setLoading(false);
  };

  const debouncedHandleSearch = useMemo(
    () =>
      debounce((q) => {
        setLoading(true);
        const encodedQuery = encodeURIComponent(q);

        Promise.all([
          API.get(`/search?q=${encodedQuery}`),
          eventService.getEvents()
        ])
          .then(([res, allEvents]) => {
            const { posts, users, community, joinedCommunity } = res.data;
            setPosts(posts);
            setUsers(users);
            setCommunity(community);
            setJoinedCommunity(joinedCommunity);

            // Filter events client-side
            const filteredEvents = allEvents.filter(event =>
              event.title.toLowerCase().includes(q.toLowerCase()) ||
              event.description.toLowerCase().includes(q.toLowerCase())
            );
            setEvents(filteredEvents);

            setLoading(false);
          })
          .catch(() => {
            setLoading(false);
          });
      }, 300),
    []
  );

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);

    if (value === "") {
      setInitialValue();
      return;
    }

    debouncedHandleSearch(value);
  };

  const clearValues = () => {
    setInitialValue();
    setInputValue("");
  };

  useEffect(() => {
    return () => {
      setInitialValue();
    };
  }, []);

  const [joinModalVisibility, setJoinModalVisibility] = useState(false);
  const toggleModal = () => {
    setJoinModalVisibility((prev) => !prev);
  };

  const highlight = (text, query) => {
    if (!text || !query) return text;
    const q = String(query).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = new RegExp(q, 'ig');
    return String(text).split(re).reduce((arr, part, idx, src) => {
      arr.push(part);
      if (idx < src.length - 1) arr.push(<mark key={idx} className="bg-yellow-200 text-yellow-900 rounded px-0.5">{String(query).slice(0, part.length === 0 ? query.length : query.length)}</mark>);
      return arr;
    }, []);
  };

  return (
    <div className="relative">
      <div className={`relative p-[2px] rounded-full transition-all duration-300 ${isFocused || inputValue ? 'bg-gradient-to-r from-orange-500 via-red-500 to-yellow-500' : 'bg-gray-200 dark:bg-gray-700'}`}>
        <input
          type="text"
          id="search"
          value={inputValue}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onChange={handleInputChange}
          placeholder="Search people, posts, events, or communities"
          className="h-full py-2 input-glass w-full rounded-full text-sm pl-3 pr-10 bg-white dark:bg-black focus:outline-none"
          aria-label="Search"
          autoComplete="off"
        />
        {inputValue !== "" && (
          <button
            className="absolute top-0 right-1 h-full w-10 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
            onClick={clearValues}
          >
            <MdClear />
          </button>
        )}
      </div>

      {inputValue !== "" && (
        <div
          onBlur={() => !community && clearValues()}
          className="absolute left-0 right-0 top-12 search-glass rounded-2xl overflow-hidden z-50 max-h-[70vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-dark-bg-tertiary border-b border-gray-200 dark:border-dark-border">Search results</div>

          {loading && (
            <div className="flex items-center justify-center py-4 px-4 text-sm text-gray-500 dark:text-gray-400">
              <MoonLoader size={18} color={"#f97316"} />
              <span className="ml-2">Searching…</span>
            </div>
          )}

          {/* Events Section */}
          {events.length > 0 && (
            <ul className="z-30 max-h-80 overflow-y-auto">
              <li className="px-4 py-2 text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-dark-bg-tertiary">Events</li>
              {events.map((event) => (
                <li key={event._id} className="border-b border-gray-200 dark:border-dark-border last:border-b-0 py-2 px-4 hover:bg-gray-50 dark:hover:bg-dark-bg-tertiary transition">
                  <div
                    onClick={() => {
                      // Navigate to event details or open modal (assuming /events for now)
                      navigate(`/events`);
                      clearValues();
                    }}
                    className="block text-sm text-gray-700 dark:text-dark-text hover:text-orange-500 dark:hover:text-orange-400 cursor-pointer"
                  >
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                          <Calendar size={16} className="text-orange-600 dark:text-orange-400" />
                        </div>
                      </div>
                      <div className="ml-3 flex-1 min-w-0">
                        <div className="font-medium text-gray-900 dark:text-dark-text truncate">
                          {highlight(event.title, inputValue)}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-dark-text-secondary truncate">
                          {event.location} • {new Date(event.eventDate).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {posts.length > 0 && (
            <ul className="z-30 max-h-80 overflow-y-auto">
              <li className="px-4 py-2 text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-dark-bg-tertiary">Posts</li>
              {posts.map((post) => (
                <li key={post._id} className="border-b border-gray-200 dark:border-dark-border last:border-b-0 py-2 px-4 hover:bg-gray-50 dark:hover:bg-dark-bg-tertiary transition">
                  <div
                    onClick={() => {
                      navigate(`/post/${post._id}`);
                      clearValues();
                    }}
                    className="block text-sm text-gray-700 dark:text-dark-text hover:text-orange-500 dark:hover:text-orange-400 cursor-pointer"
                  >
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <img
                          src={post.user.avatar || "https://raw.githubusercontent.com/nz-m/public-files/main/dp.jpg"}
                          alt={post.user.name}
                          className="h-8 w-8 rounded-full object-cover ring-1 ring-gray-200 dark:ring-dark-border"
                          loading="lazy"
                        />
                      </div>
                      <div className="ml-3 flex-1 min-w-0">
                        <div className="font-medium text-gray-900 dark:text-dark-text truncate">
                          {post.title || 'Post'}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-dark-text-secondary line-clamp-2">
                          {post.content}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-dark-text-secondary truncate">
                          Posted by {post.user.name} in {post.community.name}
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
          {users.length > 0 && (
            <ul className="z-30 max-h-80 overflow-y-auto">
              <li className="px-4 py-2 text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-dark-bg-tertiary">People</li>
              {users.map((user) => (
                <li key={user._id} className="border-b border-gray-200 dark:border-dark-border last:border-b-0 py-2 px-4 hover:bg-gray-50 dark:hover:bg-dark-bg-tertiary transition">
                  <div
                    onClick={() => {
                      navigate(`/user/${user._id}`);
                      clearValues();
                    }}
                    className="block text-sm text-gray-700 dark:text-dark-text hover:text-orange-500 dark:hover:text-orange-400 cursor-pointer"
                  >
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <img
                          src={user.avatar || "https://raw.githubusercontent.com/nz-m/public-files/main/dp.jpg"}
                          alt={user.name}
                          className="h-8 w-8 rounded-full object-cover ring-1 ring-gray-200 dark:ring-dark-border"
                          loading="lazy"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="ml-3 flex-1 min-w-0">
                        <div className="font-medium text-gray-900 dark:text-dark-text truncate">
                          {highlight(user.name, inputValue)}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-dark-text-secondary truncate">
                          {user.username ? highlight(`@${user.username}`, inputValue) : highlight(user.email, inputValue)}
                        </div>
                      </div>
                      <div className="ml-3">
                        <span className={`inline-block w-2 h-2 rounded-full ${user.isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
          {community && (
            <div className="border-b border-gray-200 dark:border-dark-border py-2 px-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <img
                    src={community.banner || "https://raw.githubusercontent.com/nz-m/public-files/main/dp.jpg"}
                    alt={community.name}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                </div>
                <div className="px-2 flex justify-between items-center gap-2 flex-1 min-w-0">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-dark-text truncate">{community.name}</p>
                    <p className="text-sm text-gray-500 dark:text-dark-text-secondary line-clamp-2">
                      {community.description}
                    </p>
                  </div>

                  {!community.isMember && (
                    <>
                      <JoinModal
                        show={joinModalVisibility}
                        onClose={() => {
                          toggleModal(false);
                          setCommunity(null);
                        }}
                        community={community}
                      />
                      <button
                        className="bg-primary px-2 py-1 text-white text-sm rounded-md hover:bg-primary/90 transition-colors"
                        onClick={() => toggleModal(true)}
                      >
                        Join
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {joinedCommunity && (
            <div
              key={joinedCommunity._id}
              onClick={() => {
                navigate(`/community/${joinedCommunity.name}`);
                clearValues();
              }}
              className="block text-sm text-gray-700 dark:text-dark-text hover:text-orange-500 dark:hover:text-orange-400 border-t border-gray-200 dark:border-dark-border py-2 px-4 cursor-pointer bg-gray-50 dark:bg-dark-bg-tertiary"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <img
                    src={joinedCommunity.banner || "https://raw.githubusercontent.com/nz-m/public-files/main/dp.jpg"}
                    alt={joinedCommunity.name}
                    className="h-8 w-8 rounded-full object-cover ring-1 ring-gray-200 dark:ring-dark-border"
                  />
                </div>
                <div className="ml-3 flex-1 min-w-0">
                  <p className="font-semibold text-md text-primary truncate">
                    {joinedCommunity.name}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-dark-text-secondary line-clamp-2">
                    {joinedCommunity.description}
                  </p>
                </div>
              </div>
            </div>
          )}

          {!loading && posts.length === 0 && users.length === 0 && events.length === 0 && !community && !joinedCommunity && (
            <div className="px-4 py-6 text-center text-sm text-gray-500 dark:text-dark-text-secondary">No results found</div>
          )}
        </div>
      )}
    </div>
  );
};

export default Search;
