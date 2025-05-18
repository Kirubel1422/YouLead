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

export function DashboardHeader() {
     const dispatch = useDispatch();
     const navigate = useNavigate();

     return (
          <header className="bg-white shadow-sm z-10">
               <div className="flex items-center justify-between p-4">
                    <div className="flex items-center">
                         
                    </div>
                    <div className="flex items-center space-x-3">

                         <DropdownMenu>
                              <DropdownMenuTrigger>
                                   <Button variant="ghost" size="icon">
                                        <Settings className="text-gray-600" />
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
