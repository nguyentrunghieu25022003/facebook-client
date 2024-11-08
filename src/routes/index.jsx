import DefaultLayout from "../layouts/default";
import ProfileLayout from "../layouts/profile";
import SignIn from "../pages/sign-in/index";
import Home from "../pages/home/index";
import Friends from "../pages/friends/index";
import Profile from "../pages/profile/index";
import VideoCall from "../pages/video-call/index"

const publicRoutes = [
    { path: "/auth", component: SignIn }
];

const privateRoutes = [
    { path: "/", component: Home, layout: DefaultLayout },
    { path: "/friends", component: Friends, layout: DefaultLayout },
    { path: "/profile/:userId/:username", component: Profile, layout: ProfileLayout },
    { path: "/video-call/friend/:userId", component: VideoCall, layout: DefaultLayout }
];

export { publicRoutes, privateRoutes };