import { LogOut, UserPlus } from "lucide-react";

import {
     Sidebar,
     SidebarContent,
     SidebarGroup,
     SidebarGroupContent,
     SidebarGroupLabel,
     SidebarMenu,
     SidebarMenuButton,
     SidebarMenuItem,
} from "../ui/sidebar";
import { Link, useLocation } from "react-router-dom";
import { logout } from "@/store/auth/authSlice";
import { onBoardingSidebar, OnboardingSidebarItem, sidebar, SidebarItem } from "@/constants/data";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { IProject } from "@/types/project.types";
import { getInitials, getRoleLabel, take } from "@/utils/basic";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/rootReducer";
import { UserRole } from "@/types/user.types";
import { Button } from "../ui/button";
import { useFetchMyProjectsQuery } from "@/api/projects.api";
import { useEffect } from "react";
import { useToast } from "../Toast";
import { Skeleton } from "../ui/skeleton";

export default function AppSidebar() {
     const location = useLocation();
     const dispatch = useDispatch();
     const { showToast } = useToast();

     const { user, isAuthenticated, hasTeam } = useSelector((state: RootState) => state.base.auth);

     const Prefix = (user.role as UserRole) === "teamMember" ? "My " : "";

     if (!isAuthenticated) {
          dispatch(logout());
     }

     // Query my projects
     const {
          isLoading: fetchingMyPros,
          data: myProjects,
          error,
     } = useFetchMyProjectsQuery(
          {
               page: 1,
               limit: 3,
               teamId: user?.teamId,
          },
          {
               skip: !hasTeam,
          },
     );

     useEffect(() => {
          if (error && "status" in error) {
               if (error.status === 401) {
                    showToast("Session expired. Signing you out.", "error");
                    setTimeout(() => {
                         dispatch(logout());
                    }, 2000);
               }
          }
     }, [error]);

     return (
          <Sidebar>
               <SidebarContent className="bg-white shadow-lg">
                    <div className="flex items-center justify-between p-4 border-b">
                         <h1 className="text-xl font-bold text-primary">You Lead</h1>
                    </div>

                    <SidebarGroup>
                         <SidebarGroupContent>
                              <SidebarMenu className="px-2 space-y-1">
                                   {hasTeam
                                        ? sidebar.map((sidebarItem: SidebarItem) => {
                                               return (
                                                    <SidebarMenuItem>
                                                         <SidebarMenuButton
                                                              isActive={location.pathname == sidebarItem.to}
                                                              asChild
                                                              onClick={
                                                                   sidebarItem.onClick ? sidebarItem.onClick : undefined
                                                              }
                                                         >
                                                              <Link to={sidebarItem.to}>
                                                                   <sidebarItem.icon className="mr-3 h-5 w-5" />
                                                                   <span className="text-xs">
                                                                        {["tasks", "projects"].some(
                                                                             (id: string) => id === sidebarItem.id,
                                                                        ) && Prefix}
                                                                        {sidebarItem.label}
                                                                   </span>
                                                              </Link>
                                                         </SidebarMenuButton>
                                                    </SidebarMenuItem>
                                               );
                                          })
                                        : onBoardingSidebar.map((onboardingSidebar: OnboardingSidebarItem) => (
                                               <SidebarMenuItem>
                                                    <SidebarMenuButton
                                                         isActive={location.pathname == onboardingSidebar.to}
                                                         asChild={false}
                                                         onClick={
                                                              onboardingSidebar.onClick
                                                                   ? onboardingSidebar.onClick
                                                                   : undefined
                                                         }
                                                         className="cursor-pointer"
                                                    >
                                                         {/* <Link to={onboardingSidebar.to ?? ""}> */}
                                                         <onboardingSidebar.icon className="mr-3 h-5 w-5" />
                                                         <span className="text-xs">
                                                              {["tasks", "projects"].some(
                                                                   (id: string) => id === onboardingSidebar.id,
                                                              ) && Prefix}
                                                              {onboardingSidebar.label}
                                                         </span>
                                                         {/* </Link> */}
                                                    </SidebarMenuButton>
                                               </SidebarMenuItem>
                                          ))}
                              </SidebarMenu>
                         </SidebarGroupContent>
                    </SidebarGroup>

                    {hasTeam ? (
                         <SidebarGroup className="mt-8 px-4">
                              <SidebarGroupLabel>{Prefix}Projects</SidebarGroupLabel>
                              <SidebarGroupContent>
                                   <SidebarMenu>
                                        {fetchingMyPros
                                             ? Array.from({ length: 3 }, (_, i) => i).map((_, i) => (
                                                    <Skeleton key={i} className="h-6 w-full mb-2" />
                                               ))
                                             : take(
                                                    Array.isArray(myProjects?.data.projects)
                                                         ? myProjects.data.projects
                                                         : [],
                                                    3,
                                               ).map((project: IProject) => (
                                                    <SidebarMenuItem>
                                                         <SidebarMenuButton
                                                              isActive={
                                                                   location.pathname ==
                                                                   "/dashboard/projects/" + project.id
                                                              }
                                                              key={project.id}
                                                              className="w-full justify-start font-normal text-xs"
                                                              asChild
                                                         >
                                                              <Link to={"/dashboard/projects/" + project.id}>
                                                                   <span className="w-2 h-1 rounded-full bg-primary mr-3"></span>
                                                                   {project.name}
                                                              </Link>
                                                         </SidebarMenuButton>
                                                    </SidebarMenuItem>
                                               ))}
                                   </SidebarMenu>
                              </SidebarGroupContent>
                         </SidebarGroup>
                    ) : (
                         <div className="mt-8 px-4">
                              <div className="rounded-lg bg-primary/10 p-4">
                                   <h3 className="font-medium text-sm text-primary mb-2">Not in a team yet</h3>
                                   <p className="text-xs text-gray-600 mb-3">
                                        Join a team to start collaborating on projects and tasks.
                                   </p>
                                   <Button size="sm" className="w-full">
                                        <UserPlus className="mr-2 h-4 w-4" />
                                        Join Now
                                   </Button>
                              </div>
                         </div>
                    )}

                    <div className="p-4 border-t mt-auto">
                         <div className="flex items-center justify-between">
                              <div className="flex items-center ">
                                   <Avatar className="h-8 w-8">
                                        <AvatarImage src={user.profile.profilePicture} alt="User" />
                                        <AvatarFallback className="uppercase">
                                             {getInitials(user.profile.firstName, user.profile.lastName)}
                                        </AvatarFallback>
                                   </Avatar>

                                   <div className="ml-3">
                                        <p className="text-sm font-normal">
                                             {user.profile.firstName + " " + user.profile.lastName}
                                        </p>
                                        <p className="text-xs text-gray-500">{getRoleLabel(user.role)}</p>
                                   </div>
                              </div>

                              <LogOut onClick={() => dispatch(logout())} size={18} className="cursor-pointer" />
                         </div>
                    </div>
               </SidebarContent>
          </Sidebar>
     );
}
