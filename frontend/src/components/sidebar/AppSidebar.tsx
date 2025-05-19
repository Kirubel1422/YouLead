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
import { Link, useLocation, useNavigate } from "react-router-dom";
import { logout, setUserTeamState } from "@/store/auth/authSlice";
import { onBoardingSidebar, OnboardingSidebarItem, sidebar, SidebarItem } from "@/constants/data";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { IProject } from "@/types/project.types";
import { exists, getInitials, getRoleLabel, take } from "@/utils/basic";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/rootReducer";
import { UserRole } from "@/types/user.types";
import { Button } from "../ui/button";
import { useFetchMyProjectsQuery } from "@/api/projects.api";
import { useEffect, useState } from "react";
import { useToast } from "../Toast";
import { Skeleton } from "../ui/skeleton";
import Join from "../modal/team/Join";
import { useJoinTeamMutation } from "@/api/team.api";
import { saveProjects } from "@/store/projects/projectsSlice";
import ProjectDetail from "../modal/project/ProjectDetail";
import { logo } from "@/assets";

export default function AppSidebar() {
     const location = useLocation();
     const dispatch = useDispatch();
     const { showToast } = useToast();

     const { user, isAuthenticated, hasTeam } = useSelector((state: RootState) => state.base.auth);

     const Prefix = (user.role as UserRole) === "teamMember" ? "My " : "";

     if (!isAuthenticated || !exists(user)) {
          dispatch(logout());
     }

     const [joinOpen, setJoinOpen] = useState<boolean>(false);
     const [proDetail, setProDetail] = useState<boolean>(false);
     const [selectedPro, setSelectedPro] = useState<IProject | undefined>(undefined);

     // Query my projects
     const {
          isLoading: fetchingMyPros,
          data: myProjects,
          error,
     } = useFetchMyProjectsQuery(
          {
               page: 1,
               teamId: user?.teamId || "",
          },
          {
               skip: !hasTeam,
          },
     );

     // Cache projects fetched
     useEffect(() => {
          if (myProjects && myProjects.projects) {
               dispatch(saveProjects(myProjects.projects));
          }
     }, [myProjects]);

     // Join a team
     const [join, { isLoading: joining }] = useJoinTeamMutation();

     // Handle Join Team Mutation
     const navigate = useNavigate();
     const handleJoinTeamMutation = async (teamId: string) => {
          try {
               const resp = await join({ teamId }).unwrap();
               showToast(resp.message, "success");
               setJoinOpen(false);
               dispatch(setUserTeamState({ hasTeam: true }));
               navigate("/dashboard");
          } catch (error: any) {
               showToast(error?.data?.message || "Something went wrong!", "error");
          }
     };

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
                    <div className="flex items-center justify-center p-4 border-b">
                         <Link to="/dashboard">
                              <img src={logo} className="h-20" />
                         </Link>
                    </div>

                    <SidebarGroup>
                         <SidebarGroupContent>
                              <SidebarMenu className="px-2 space-y-1">
                                   {hasTeam
                                        ? sidebar.map((sidebarItem: SidebarItem) => {
                                               return (
                                                    <SidebarMenuItem>
                                                         <SidebarMenuButton
                                                              isActive={
                                                                   location.pathname ==
                                                                   (user.role == "teamLeader"
                                                                        ? sidebarItem.to[sidebarItem.to.length - 1]
                                                                        : sidebarItem.to[0])
                                                              }
                                                              asChild
                                                              onClick={
                                                                   sidebarItem.onClick ? sidebarItem.onClick : undefined
                                                              }
                                                         >
                                                              <Link
                                                                   to={
                                                                        (user.role == "teamLeader"
                                                                             ? sidebarItem.to[sidebarItem.to.length - 1]
                                                                             : sidebarItem.to[0]) as string
                                                                   }
                                                              >
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
                                                    Array.isArray(myProjects?.projects) ? myProjects?.projects : [],
                                                    1000,
                                               ).map((project: IProject) => (
                                                    <SidebarMenuItem>
                                                         <SidebarMenuButton
                                                              key={project.id}
                                                              className="w-full justify-start font-normal text-xs"
                                                              onClick={(event) => {
                                                                   event.preventDefault();

                                                                   setSelectedPro(project);
                                                                   setProDetail(true);
                                                              }}
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
                                   <Button
                                        variant={"primary"}
                                        onClick={() => setJoinOpen(true)}
                                        size="sm"
                                        className="w-full"
                                   >
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

               {joinOpen && (
                    <Join loading={joining} open={joinOpen} setOpen={setJoinOpen} onJoin={handleJoinTeamMutation} />
               )}

               {proDetail && <ProjectDetail open={proDetail} setOpen={setProDetail} selectedProject={selectedPro} />}
          </Sidebar>
     );
}
