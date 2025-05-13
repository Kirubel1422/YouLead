import { Navigate, Outlet, Route, Routes, useLocation, useNavigate } from "react-router";
import Login from "./pages/Login";
import TeamMemberDashboard from "./pages/Client/Dash-TeamMember";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "./store/rootReducer";
import { useEffect } from "react";
import Signup from "./pages/Signup";
import OnboardingTeamMember from "./pages/Client/Onboard-TeamMember";
import Profile from "./pages/Client/Profile";
import { useMeQuery } from "./api/auth.api";
import { logout, setUserTeamState, updateUser } from "./store/auth/authSlice";
import Tasks from "./pages/Client/Tasks";
import Projects from "./pages/Client/Projects";
import Calendar from "./pages/Client/Calendar";
import Messages from "./pages/Client/Messages";
import { IUser } from "./types/user.types";
import { exists } from "./utils/basic";

// const authorized = [];
const unauthorized = ["/login", "/signup"];

export default function App() {
     const { isAuthenticated, user } = useSelector((state: RootState) => state.base.auth);

     const navigate = useNavigate();
     const location = useLocation();
     const dispatch = useDispatch();

     // refetch user
     const { data: userData } = useMeQuery(
          { location: location.pathname },
          {
               refetchOnMountOrArgChange: true,
          },
     );

     useEffect(() => {
          if (isAuthenticated && userData) {
               dispatch(setUserTeamState({ hasTeam: !!userData.teamId }));
               dispatch(updateUser(userData));
          }
     }, [userData]);

     useEffect(() => {
          if (isAuthenticated && unauthorized.some((path: string) => location.pathname === path)) {
               navigate("/dashboard");
          }
     }, [location.pathname]);

     return (
          <div>
               <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />

                    <Route path="/dashboard" element={<DashboardGuard user={user} isAuthenticated={isAuthenticated} />}>
                         <Route path="" element={<TeamMemberDashboard />} />
                         <Route path="onboarding" element={<OnboardingTeamMember />} />
                         <Route path="profile" element={<Profile />} />
                         <Route path="tasks" element={<Tasks />} />
                         <Route path="projects" element={<Projects />} />
                         <Route path="calendar" element={<Calendar />} />
                         <Route path="messages" element={<Messages />} />
                    </Route>
               </Routes>
          </div>
     );
}

interface DashboardGuardProps {
     isAuthenticated: boolean;
     user: IUser;
}

function DashboardGuard({ isAuthenticated, user }: DashboardGuardProps) {
     const dispatch = useDispatch();

     if (!isAuthenticated) {
          return <Navigate to="/login" />;
     }

     if (!exists(user)) {
          dispatch(logout());
          return <Navigate to="/login" />;
     }

     return <Outlet />;
}
