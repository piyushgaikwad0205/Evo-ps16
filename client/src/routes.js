import { lazy } from "react";

import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Post from "./pages/Post";
import OwnPost from "./pages/OwnPost";
import CommunityHome from "./pages/CommunityHome";
import Saved from "./pages/Saved";
import PublicProfile from "./pages/PublicProfile";
import AllCommunities from "./pages/AllCommunities";
import MyCommunities from "./pages/MyCommunities";
import Following from "./pages/Following";
import Followers from "./pages/Followers";
import SignUp from "./pages/SignUp";
import AlumniDirectory from "./pages/AlumniDirectory";
import SuccessStories from "./pages/SuccessStories";
import Surveys from "./pages/Surveys";
import AlumniRegistration from "./pages/AlumniRegistration";
import Connections from "./pages/Connections";
import CreateSuccessStory from "./pages/CreateSuccessStory";
import SuccessStory from "./pages/SuccessStory";
import Clubs from "./pages/Clubs";
import Club from "./pages/Club";
import CreateSurvey from "./pages/CreateSurvey";
import Messages from "./pages/Messages";
import AIChat from "./pages/AIChat";
import Intro from "./pages/Intro";
import CollabBoard from "./pages/CollabBoard";
import AlumniHub from "./pages/AlumniHub";
import AlumniProfile from "./pages/AlumniProfile";
import Notifications from "./pages/Notifications";
import DiscoverUsers from "./pages/DiscoverUsers";
import FollowRequests from "./pages/FollowRequests";

const SurveyDetailsResponse = lazy(() => import("./pages/SurveyDetailsResponse"));
const SurveyAnalytics = lazy(() => import("./pages/SurveyAnalytics"));

const ReportedPost = lazy(() => import("./pages/ReportedPost"));
const Moderator = lazy(() => import("./pages/Moderator"));
const DevicesLocations = lazy(() => import("./pages/DevicesLocations"));
const VerifyEmail = lazy(() => import("./pages/VerifyEmail"));
const EmailVerifiedMessage = lazy(() => import("./pages/EmailVerifiedMessage"));
const BlockDevice = lazy(() => import("./pages/BlockDevice"));
const LoginVerified = lazy(() => import("./pages/LoginVerified"));
const AccessDenied = lazy(() => import("./pages/AccessDenied"));
const NotFound = lazy(() => import("./pages/NotFound"));

export const privateRoutes = [
  {
    path: "/home",
    element: <Home />,
  },
  {
    path: "/profile",
    element: <Profile />,
  },
  {
    path: "/post/:postId",
    element: <Post />,
  },
  {
    path: "/my/post/:postId",
    element: <OwnPost />,
  },
  {
    path: "/community/:communityName",
    element: <CommunityHome />,
  },
  {
    path: "/community/:communityName/reported-post",
    element: <ReportedPost />,
  },
  {
    path: "/community/:communityName/moderator",
    element: <Moderator />,
  },
  {
    path: "/saved",
    element: <Saved />,
  },
  {
    path: "/user/:userId",
    element: <PublicProfile />,
  },
  {
    path: "/communities",
    element: <AllCommunities />,
  },
  {
    path: "/my-communities",
    element: <MyCommunities />,
  },
  {
    path: "/following",
    element: <Following />,
  },
  {
    path: "/followers",
    element: <Followers />,
  },
  {
    path: "/users/discover",
    element: <DiscoverUsers />,
  },
  {
    path: "/devices-locations",
    element: <DevicesLocations />,
  },
  {
    path: "/alumni/directory",
    element: <AlumniDirectory />,
  },
  {
    path: "/alumni/profile/:id",
    element: <AlumniProfile />,
  },
  {
    path: "/connections",
    element: <Connections />,
  },
  {
    path: "/success-stories",
    element: <SuccessStories />,
  },
  {
    path: "/success-stories/:id",
    element: <SuccessStory />,
  },
  {
    path: "/success-stories/create",
    element: <CreateSuccessStory />,
  },
  {
    path: "/surveys",
    element: <Surveys />,
  },
  {
    path: "/surveys/create",
    element: <CreateSurvey />,
  },
  {
    path: "/surveys/:id",
    element: <SurveyDetailsResponse />,
  },
  {
    path: "/surveys/:id/analytics",
    element: <SurveyAnalytics />,
  },
  {
    path: "/messages",
    element: <Messages />,
  },
  {
    path: "/ai",
    element: <AIChat />,
  },
  {
    path: "/clubs",
    element: <Clubs />,
  },
  {
    path: "/clubs/:clubId",
    element: <Club />,
  },
  {
    path: "/collabs",
    element: <CollabBoard />,
  },



  {
    path: "/alumni-hub",
    element: <AlumniHub />,
  },
  {
    path: "/notifications",
    element: <Notifications />,
  },
  {
    path: "/follow-requests",
    element: <FollowRequests />,
  }
];

export const publicRoutes = [
  {
    path: "/",
    element: <Intro />,
  },
  {
    path: "/signup",
    element: <SignUp />,
  },
  {
    path: "/alumni/register",
    element: <AlumniRegistration />,
  },

  {
    path: "/auth/verify",
    element: <VerifyEmail />,
  },
  {
    path: "/email-verified",
    element: <EmailVerifiedMessage />,
  },
  {
    path: "/block-device",
    element: <BlockDevice />,
  },
  {
    path: "/verify-login",
    element: <LoginVerified />,
  },
  {
    path: "/access-denied",
    element: <AccessDenied />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
];
