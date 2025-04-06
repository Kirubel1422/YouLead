import { Route, Routes, useLocation, useNavigate } from "react-router";
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

const authorized = [];
const unauthorized = ["/login", "/signup"];

export default function App() {
     const { isAuthenticated, user, hasTeam } = useSelector((state: RootState) => state.base.auth);

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
          if (userData) {
               dispatch(setUserTeamState({ hasTeam: !!userData.teamId }));
               dispatch(updateUser(userData));
          }
     }, [userData]);

     useEffect(() => {
          if (isAuthenticated && user && unauthorized.some((path: string) => location.pathname === path)) {
               navigate("/dashboard");
          }
     }, [location.pathname]);

     useEffect(() => {
          if (!hasTeam && user) navigate("/dashboard/onboarding");
     }, [location.pathname]);

     return (
          <div>
               <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />

                    <Route path="/dashboard" element={<TeamMemberDashboard />} />
                    <Route path="/dashboard/onboarding" element={<OnboardingTeamMember />} />
                    <Route path="/dashboard/profile" element={<Profile />} />
               </Routes>
          </div>
     );
}
