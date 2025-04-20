import { createBrowserRouter } from "react-router-dom";

import Home from "./pages/Home";
import Users from "./pages/Users";
import UserEdit from "./pages/UserEdit";
import { userLoader } from "./loaders/userLoader";
import SignIn from "./pages/SignIn";
import NotFoundPage from "./pages/NotFoundPage";
import UserProfile from "./pages/UserProfile";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/signin",
    element: <SignIn />,
  },
  {
    path: "/users",
    element: <Users />,
  },
  {
    path: "/users/:userId",
    element: <UserEdit />,
    loader: userLoader,
  },
  {
    path: "/profile/:userId",
    element: <UserProfile />,
  },
  {
    path: "*", 
    element: <NotFoundPage />, 
  },
]);

export default router;
