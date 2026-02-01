import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { API } from "../redux/api/utils";

export default function CollabDetail() {
  const { collabId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const authUser = useSelector((s) => s.auth?.userData);

  useEffect(() => {
    (async () => {
      try {
        const res = await API.get(`/collabs/${collabId}`);
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [collabId]);

  const toggleInterest = async () => {
    if (!data || saving) return;
    setSaving(true);

    try {
      await API.post(`/collabs/${collabId}/interest`);

      if (data.user?._id !== authUser._id && !isInterested) {
        await API.post(`/messages`, {
          toUserId: data.user._id,
          message: `${authUser.name} is interested in your collaboration "${data.title}".`,
        });
      }

      const updated = await API.get(`/collabs/${collabId}`);
      setData(updated.data);
    } catch (err) {
      console.error(err);
    }

    setSaving(false);
  };

  const isOwner = useMemo(
    () =>
      data &&
      authUser &&
      String(data.user?._id || data.user) === String(authUser._id),
    [data, authUser]
  );

  const isInterested = useMemo(() => {
    if (!data || !authUser) return false;
    return (data.interestedUsers || []).some(
      (u) => String(u?._id || u) === String(authUser._id)
    );
  }, [data, authUser]);

  const handleUserClick = (id) => navigate(`/user/${id}`);

  if (loading)
    return (
      <div className="p-6 text-center text-gray-500 animate-pulse">
        Loading collaboration...
      </div>
    );

  if (!data)
    return (
      <div className="p-6 text-center text-gray-500">Collaboration not found</div>
    );

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="lg:grid lg:grid-cols-12 lg:gap-10">
          {/* Left Column */}
          <div className="lg:col-span-8 bg-white rounded-2xl shadow-lg p-6 sm:p-10 space-y-8 border border-gray-100">

            {/* Title Section */}
            <div className="space-y-4 pb-6 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row justify-between gap-3">
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight leading-snug">
                  {data.title}
                </h1>

                {data.category && (
                  <span className="self-start sm:self-center bg-indigo-100 text-indigo-800 px-4 py-1.5 rounded-full text-sm font-semibold shadow-sm">
                    {data.category}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3 text-sm text-gray-600 mt-1">
                <img
                  src={
                    data.user?.avatar ||
                    "https://raw.githubusercontent.com/nz-m/public-files/main/dp.jpg"
                  }
                  alt={data.user?.name}
                  className="w-10 h-10 rounded-full border cursor-pointer object-cover"
                  onClick={() => handleUserClick(data.user._id)}
                />

                <div
                  className="font-medium text-gray-800 cursor-pointer hover:text-blue-600 transition"
                  onClick={() => handleUserClick(data.user._id)}
                >
                  {data.user?.name}
                </div>

                {data.status && (
                  <span
                    className={`ml-auto text-xs font-bold px-3 py-1 rounded-full ${
                      data.status === "Open"
                        ? "bg-green-100 text-green-700"
                        : data.status === "In Progress"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {data.status}
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            <section className="space-y-2">
              <h2 className="text-xl font-semibold text-gray-900">Description</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {data.description}
              </p>
            </section>

            {/* Skills */}
            {(data.skillsNeeded || data.requiredSkills)?.length > 0 && (
              <section className="space-y-3 pt-6 border-t border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  Skills Needed
                </h2>

                <div className="flex flex-wrap gap-2">
                  {(data.skillsNeeded || data.requiredSkills).map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-200 shadow-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Deadline */}
            {data.deadline && (
              <div className="text-sm text-gray-600 pt-6 border-t border-gray-200">
                <strong className="font-medium text-gray-800">
                  Expected Deadline:
                </strong>{" "}
                {new Date(data.deadline).toLocaleDateString()}
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="lg:col-span-4 mt-8 lg:mt-0">
            <div className="lg:sticky lg:top-20 bg-white rounded-2xl shadow-lg p-6 border border-gray-100 space-y-6">

              {/* Interest Button */}
              {!isOwner && data.status !== "closed" && (
                <button
                  onClick={toggleInterest}
                  disabled={saving}
                  className={`w-full py-3 rounded-xl text-base font-semibold shadow-md transition-all duration-200 
                    ${
                      isInterested
                        ? "bg-green-600 hover:bg-green-700 text-white"
                        : "bg-blue-600 hover:bg-blue-700 text-white"
                    }
                    ${saving && "opacity-50 cursor-not-allowed"}
                  `}
                >
                  {saving
                    ? isInterested
                      ? "Removing Interest..."
                      : "Showing Interest..."
                    : isInterested
                    ? "Interested ✓"
                    : "I am Interested"}
                </button>
              )}

              {/* Interested People */}
              <div className="pt-4 border-t border-gray-200 space-y-4">
                <h4 className="text-lg font-semibold text-gray-800">
                  Interested People ({data.interestedUsers?.length || 0})
                </h4>

                {data.interestedUsers?.length > 0 ? (
                  <div className="space-y-2 max-h-80 overflow-y-auto pr-2 custom-scroll">
                    {data.interestedUsers.map((u) => (
                      <div
                        key={u._id}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition"
                        onClick={() => handleUserClick(u._id)}
                      >
                        <img
                          src={
                            u.avatar ||
                            "https://raw.githubusercontent.com/nz-m/public-files/main/dp.jpg"
                          }
                          className="w-9 h-9 rounded-full border object-cover"
                        />
                        <span className="font-medium text-gray-900 hover:text-blue-600">
                          {u.name}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">
                    No one has shown interest yet. Be the first!
                  </p>
                )}
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
