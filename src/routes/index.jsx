import DefaultLayout from "../layouts/default";
import ProfileLayout from "../layouts/profile";
import SignIn from "../pages/sign-in/index";
import Home from "../pages/home/index";
import Friends from "../pages/friends/index";
import Profile from "../pages/profile/index";
import VideoCall from "../pages/video-call/index";
import VideoPage from "../pages/videos/index";
import PostDetail from "../pages/post-detail/index";
import CreateStory from "../pages/create-story/index";
import Groups from "../pages/groups/index";

const publicRoutes = [
    { path: "/auth", component: SignIn }
];

const privateRoutes = [
    { path: "/", component: Home, layout: DefaultLayout },
    { path: "/friends", component: Friends, layout: DefaultLayout },
    { path: "/profile/:userId/:username", component: Profile, layout: ProfileLayout },
    { path: "/video-call", component: VideoCall, layout: DefaultLayout },
    { path: "/watch", component: VideoPage, layout: DefaultLayout },
    { path: "/post/detail/:postId", component: PostDetail, layout: DefaultLayout },
    { path: "/stories/create", component: CreateStory, layout: DefaultLayout },
    { path: "/groups", component: Groups, layout: DefaultLayout },
];

export { publicRoutes, privateRoutes };