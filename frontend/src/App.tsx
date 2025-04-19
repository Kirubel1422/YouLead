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
import { setUserTeamState, updateUser } from "./store/auth/authSlice";

// const authorized = [];
const unauthorized = ["/login", "/signup"];

export default function App() {
     const { isAuthenticated } = useSelector((state: RootState) => state.base.auth);

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

                    <Route path="/dashboard" element={<DashboardGuard isAuthenticated={isAuthenticated} />}>
                         <Route path="" element={<TeamMemberDashboard />} />
                         <Route path="onboarding" element={<OnboardingTeamMember />} />
                         <Route path="profile" element={<Profile />} />
                    </Route>
               </Routes>
          </div>
     );
}

interface DashboardGuardProps {
     isAuthenticated: boolean;
}

function DashboardGuard({ isAuthenticated }: DashboardGuardProps) {
     if (!isAuthenticated) {
          return <Navigate to="/login" />;
     }

     return <Outlet />;
}
