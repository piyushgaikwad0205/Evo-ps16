import { useNavigate, useLocation } from "react-router";
import { useMemo } from "react";

const PostOnProfile = ({ post }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const { content, fileUrl, community, createdAt, comments, likes, isMember } =
    post;

  const isImageFile = useMemo(() => {
    const validExtensions = [".jpg", ".png", ".jpeg", ".gif", ".webp", ".svg"];
    const fileExtension = fileUrl?.slice(fileUrl.lastIndexOf("."));
    return validExtensions.includes(fileExtension);
  }, [fileUrl]);

  return (
    <div
      className={`relative aspect-square group cursor-pointer overflow-hidden bg-gray-100 dark:bg-gray-800 ${isMember ? "" : "opacity-50 pointer-events-none"
        }`}
      style={{ aspectRatio: '1/1' }}
      onClick={() => {
        if (isMember) {
          navigate(`/my/post/${post._id}`, {
            state: { from: location.pathname },
          });
        }
      }}
    >
      {/* Content Layer */}
      {fileUrl ? (
        isImageFile ? (
          <img
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            src={fileUrl}
            alt={content || "Post image"}
            loading="lazy"
          />
        ) : (
          <video
            className="w-full h-full object-cover"
            src={fileUrl}
          />
        )
      ) : (
        <div className="w-full h-full p-4 flex items-center justify-center bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-gray-800 dark:to-gray-900">
          <p className="text-xs md:text-sm text-gray-800 dark:text-gray-200 line-clamp-5 text-center font-medium">
            {content}
          </p>
        </div>
      )}

      {/* Hover Overlay */}
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-6 text-white font-bold">
        <div className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 fill-current" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
          </svg>
          <span>{likes.length}</span>
        </div>
        <div className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 fill-current" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
          </svg>
          <span>{comments.length}</span>
        </div>
      </div>

      {/* Multiple Images Indicator (if applicable, though current logic seems to handle single file) */}
      {/* Video Indicator */}
      {!isImageFile && fileUrl && (
        <div className="absolute top-2 right-2 text-white drop-shadow-md">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </div>
      )}
    </div>
  );
};

export default PostOnProfile;
