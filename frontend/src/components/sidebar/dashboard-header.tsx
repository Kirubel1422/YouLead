import { Bell, Search, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RoleSwitcher } from "./role-switcher";
import { DefaultUserRoleType } from "@/types/auth.types";
import {
     DropdownMenu,
     DropdownMenuContent,
     DropdownMenuItem,
     DropdownMenuLabel,
     DropdownMenuSeparator,
     DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useDispatch } from "react-redux";
import { logout } from "@/store/auth/authSlice";
import { useNavigate } from "react-router";

interface DashboardHeaderProps {
     searchQuery: string;
     setSearchQuery: (query: string) => void;
     currentRole: DefaultUserRoleType;
}

export function DashboardHeader({ searchQuery, setSearchQuery, currentRole }: DashboardHeaderProps) {
     const dispatch = useDispatch();
     const navigate = useNavigate();

     return (
          <header className="bg-white shadow-sm z-10">
               <div className="flex items-center justify-between p-4">
                    <div className="flex items-center">
                         <div className="relative w-64 ml-4">
                              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                              <Input
                                   placeholder="Search..."
                                   className="pl-8"
                                   value={searchQuery}
                                   onChange={(e) => setSearchQuery(e.target.value)}
                              />
                         </div>
                    </div>
                    <div className="flex items-center space-x-3">
                         <RoleSwitcher currentRole={currentRole} />
                         <Button variant="ghost" size="icon" className="relative">
                              <Bell className="h-5 w-5" />
                              <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
                         </Button>

                         <DropdownMenu>
                              <DropdownMenuTrigger>
                                   <Button variant="ghost" size="icon">
                                        <Settings className="h-5 w-5" />
                                   </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                   <DropdownMenuLabel>My Account</DropdownMenuLabel>
                                   <DropdownMenuSeparator />
                                   <DropdownMenuItem
                                        onClick={() => navigate("/dashboard/profile")}
                                        className="cursor-pointer"
                                   >
                                        Profile
                                   </DropdownMenuItem>
                                   <DropdownMenuItem className="cursor-pointer" onClick={() => dispatch(logout())}>
                                        Logout
                                   </DropdownMenuItem>
                              </DropdownMenuContent>
                         </DropdownMenu>
                    </div>
               </div>
          </header>
     );
}
