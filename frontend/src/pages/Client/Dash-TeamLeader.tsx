import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
     DropdownMenu,
     DropdownMenuContent,
     DropdownMenuItem,
     DropdownMenuSeparator,
     DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
     AlertCircle,
     BarChart3,
     Clock,
     FileText,
     MoreHorizontal,
     UserPlus,
     Users,
     CheckCircle,
     XCircle,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
     Dialog,
     DialogContent,
     DialogDescription,
     DialogFooter,
     DialogHeader,
     DialogTitle,
     DialogTrigger,
} from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import Layout from "@/components/sidebar/layout";
import { formatDate, getInitials, statusLabel, take } from "@/utils/basic";
import { useGetTeamAnalyticsQuery, useGetTeamMembersAnalyticsQuery } from "@/api/analytics.api";
import { Skeleton } from "@/components/ui/skeleton";
import { TaskStatusType } from "@/types/task.types";
import { useUpcomingMeetingsQuery } from "@/api/meeting.api";
import MeetingFallback from "@/components/fallbacks/meeting/meeting";
import { useSelector } from "react-redux";
import { RootState } from "@/store/rootReducer";
import { useRecentActivititesQuery } from "@/api/activities.api";
import ActivityFallBack from "@/components/fallbacks/activity/activity";
import { useInviteMutation } from "@/api/invitations.api";
import { useToast } from "@/components/Toast";
import { Loadable } from "@/components/state";

// Mock data
const analyticsData = {
     tasksDueSoon: 8,
     completionRate: 0.72,
     activeProjects: 5,
     upcomingMeetings: 3,
     latestMeeting: "2025-05-18T10:00:00",
     tasksByStatus: [
          { status: "Completed", count: 24 },
          { status: "In Progress", count: 18 },
          { status: "Pending", count: 12 },
          { status: "Overdue", count: 6 },
     ],
     tasksByPriority: [
          { priority: "High", count: 15 },
          { priority: "Medium", count: 30 },
          { priority: "Low", count: 15 },
     ],
     weeklyProgress: [
          { day: "Mon", completed: 5 },
          { day: "Tue", completed: 7 },
          { day: "Wed", completed: 3 },
          { day: "Thu", completed: 8 },
          { day: "Fri", completed: 4 },
          { day: "Sat", completed: 2 },
          { day: "Sun", completed: 1 },
     ],
};

// const invitationRequests = [
//      {
//           id: "1",
//           name: "Emma Thompson",
//           email: "emma.thompson@example.com",
//           role: "Product Manager",
//           requestDate: "2025-05-15T09:30:00",
//           status: "pending",
//      },
//      {
//           id: "2",
//           name: "Ryan Garcia",
//           email: "ryan.garcia@example.com",
//           role: "Full Stack Developer",
//           requestDate: "2025-05-14T14:45:00",
//           status: "pending",
//      },
//      {
//           id: "3",
//           name: "Olivia Martinez",
//           email: "olivia.martinez@example.com",
//           role: "Data Analyst",
//           requestDate: "2025-05-13T11:20:00",
//           status: "pending",
//      },
// ];

export default function TeamLeaderDashboard() {
     const { user } = useSelector((state: RootState) => state.base.auth);
     const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
     const [inviteEmail, setInviteEmail] = useState<string>("");
     const [teamMembersSheetOpen, setTeamMembersSheetOpen] = useState(false);
     const { showToast } = useToast();

     // Queries to fill up Analytics
     const { data: teamMembers } = useGetTeamMembersAnalyticsQuery(undefined); // Fetch Team Members
     const { data: analyticsData, isFetching: fetchingTeamAnalytics } = useGetTeamAnalyticsQuery(undefined); // Fetch General Analytics
     const { data: upcomingMeetings } = useUpcomingMeetingsQuery(); // Upcoming tasks
     const { data: recentActivities } = useRecentActivititesQuery(user.teamId); // Fetch recent activities - relies on team

     // Mutations
     const [invite, { isLoading: inviting }] = useInviteMutation();

     const handleInviteSubmit = async (e: React.FormEvent) => {
          e.preventDefault();

          try {
               const response = await invite({
                    inviteeEmail: inviteEmail,
                    teamId: user.teamId as string,
               }).unwrap();
               setInviteEmail("");
               setInviteDialogOpen(false);
               showToast(response, "success");
          } catch (error: any) {
               showToast(error?.data?.message, "error");
          }
     };

     return (
          <Layout>
               <main className="flex-1 overflow-y-auto p-4 md:p-6">
                    <div className="flex justify-between items-center mb-6">
                         <div>
                              <h1 className="text-2xl font-bold">Team Dashboard</h1>
                              <p className="text-gray-500">Manage your team, projects, and tasks</p>
                         </div>
                         <div className="flex gap-3">
                              <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
                                   <DialogTrigger asChild>
                                        <Button variant={"primary"}>
                                             <UserPlus className="mr-2 h-4 w-4" />
                                             Invite User
                                        </Button>
                                   </DialogTrigger>
                                   <DialogContent>
                                        <DialogHeader>
                                             <DialogTitle>Invite a New Team Member</DialogTitle>
                                             <DialogDescription>
                                                  Enter the email address of the person you want to invite to your team.
                                             </DialogDescription>
                                        </DialogHeader>
                                        <form onSubmit={handleInviteSubmit}>
                                             <div className="grid gap-4 py-4">
                                                  <div className="grid gap-2">
                                                       <Label htmlFor="email">Email address</Label>
                                                       <Input
                                                            id="email"
                                                            type="email"
                                                            placeholder="colleague@example.com"
                                                            value={inviteEmail}
                                                            onChange={(e) => setInviteEmail(e.target.value)}
                                                            required
                                                       />
                                                  </div>
                                             </div>
                                             <DialogFooter>
                                                  <Button variant={'primary'} disabled={inviting} type="submit">
                                                       <Loadable isLoading={inviting}>Send Invitation</Loadable>
                                                  </Button>
                                             </DialogFooter>
                                        </form>
                                   </DialogContent>
                              </Dialog>

                              <Sheet open={teamMembersSheetOpen} onOpenChange={setTeamMembersSheetOpen}>
                                   <SheetTrigger asChild>
                                        <Button variant="outline">
                                             <Users className="mr-2 h-4 w-4" />
                                             View Team
                                        </Button>
                                   </SheetTrigger>
                                   <SheetContent className="sm:max-w-md px-4">
                                        <SheetHeader>
                                             <SheetTitle>Team Members</SheetTitle>
                                             <SheetDescription>View and manage your team members</SheetDescription>
                                        </SheetHeader>
                                        <div className="mt-6 space-y-4">
                                             {Array.isArray(teamMembers) ? (
                                                  teamMembers.map((member) => (
                                                       <div
                                                            key={member.id}
                                                            className="flex items-center justify-between border-b pb-3"
                                                       >
                                                            <div className="flex items-center">
                                                                 <Avatar className="h-10 w-10 mr-3">
                                                                      <AvatarImage
                                                                           src={member.avatar || "/placeholder.svg"}
                                                                           alt={member.name}
                                                                      />
                                                                      <AvatarFallback>
                                                                           {getInitials(member.name)}
                                                                      </AvatarFallback>
                                                                 </Avatar>
                                                                 <div>
                                                                      <p className="font-medium">{member.name}</p>
                                                                      <p className="text-sm text-gray-500">
                                                                           {member.workRole}
                                                                      </p>
                                                                 </div>
                                                            </div>
                                                            {/* <DropdownMenu>
                                                                 <DropdownMenuTrigger asChild>
                                                                      <Button variant="ghost" size="icon">
                                                                           <MoreHorizontal className="h-4 w-4" />
                                                                      </Button>
                                                                 </DropdownMenuTrigger>
                                                                 <DropdownMenuContent align="end">
                                                                      <DropdownMenuItem>View Profile</DropdownMenuItem>
                                                                      <DropdownMenuItem>Assign Task</DropdownMenuItem>
                                                                      <DropdownMenuSeparator />
                                                                      <DropdownMenuItem className="text-red-600">
                                                                           Remove from Team
                                                                      </DropdownMenuItem>
                                                                 </DropdownMenuContent>
                                                            </DropdownMenu> */}
                                                       </div>
                                                  ))
                                             ) : (
                                                  <div className="flex items-center">
                                                       <Skeleton className="h-10 w-10 mr-3 rounded-full" />
                                                       <div>
                                                            <Skeleton className="h-4 w-24 mb-1" />
                                                            <Skeleton className="h-3 w-16" />
                                                       </div>
                                                  </div>
                                             )}
                                        </div>
                                   </SheetContent>
                              </Sheet>
                         </div>
                    </div>

                    {/* Stats Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                         <Card>
                              {fetchingTeamAnalytics && analyticsData ? (
                                   <div className="p-6">
                                        <Skeleton className="h-4 w-6" />

                                        <Skeleton className="h-4 w-12" />
                                   </div>
                              ) : (
                                   <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                             <div>
                                                  <p className="text-sm font-medium text-gray-500">Tasks Due Soon</p>
                                                  <h3 className="text-2xl font-bold mt-1">
                                                       {analyticsData?.tasksDueSoon}
                                                  </h3>
                                             </div>
                                             <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center text-red-500">
                                                  <AlertCircle className="h-6 w-6" />
                                             </div>
                                        </div>
                                        <p className="text-xs text-red-500 mt-2">
                                             {analyticsData?.tasksDueSoon} tasks due this week
                                        </p>
                                   </CardContent>
                              )}
                         </Card>

                         <Card>
                              {fetchingTeamAnalytics ? (
                                   <div className="p-6">
                                        <Skeleton className="h-4 w-6" />

                                        <Skeleton className="h-2 w-24" />
                                   </div>
                              ) : (
                                   <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                             <div>
                                                  <p className="text-sm font-medium text-gray-500">Team Productivity</p>
                                                  <h3 className="text-2xl font-bold mt-1">
                                                       {analyticsData
                                                            ? (analyticsData.completionRate * 100).toFixed(0)
                                                            : 0}
                                                       %
                                                  </h3>
                                             </div>
                                             <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center text-green-500">
                                                  <BarChart3 className="h-6 w-6" />
                                             </div>
                                        </div>
                                        <Progress
                                             value={analyticsData ? analyticsData.completionRate * 100 : 0}
                                             className="h-2 mt-2"
                                        />
                                   </CardContent>
                              )}
                         </Card>

                         <Card>
                              <CardContent className="p-6">
                                   <div className="flex items-center justify-between">
                                        <div>
                                             <p className="text-sm font-medium text-gray-500">Active Projects</p>
                                             {analyticsData ? (
                                                  <h3 className="text-2xl font-bold mt-1">
                                                       {analyticsData.activeProjects}
                                                  </h3>
                                             ) : (
                                                  <Skeleton className="w-6 h-4" />
                                             )}
                                        </div>
                                        <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-500">
                                             <FileText className="h-6 w-6" />
                                        </div>
                                   </div>
                                   <p className="text-xs text-gray-500 mt-2">
                                        Across {Array.isArray(teamMembers) ? teamMembers.length : 0} team members
                                   </p>
                              </CardContent>
                         </Card>

                         {/* <Card>
                              <CardContent className="p-6">
                                   <div className="flex items-center justify-between">
                                        <div>
                                             <p className="text-sm font-medium text-gray-500">Team Members</p>
                                             <h3 className="text-2xl font-bold mt-1">{teamMembers.length}</h3>
                                        </div>
                                        <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-500">
                                             <Users className="h-6 w-6" />
                                        </div>
                                   </div>
                                   <p className="text-xs text-gray-500 mt-2">
                                        {invitationRequests.length} pending invitation
                                        {invitationRequests.length !== 1 ? "s" : ""}
                                   </p>
                              </CardContent>
                         </Card> */}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                         {/* Analytics Charts */}
                         <div className="lg:col-span-2 space-y-6">
                              <Card>
                                   <CardHeader>
                                        <CardTitle>Team Performance Analytics</CardTitle>
                                   </CardHeader>
                                   <CardContent>
                                        <Tabs defaultValue="tasks">
                                             <TabsList className="mb-4">
                                                  <TabsTrigger value="tasks">Tasks by Status</TabsTrigger>
                                                  <TabsTrigger value="priority">Tasks by Priority</TabsTrigger>
                                                  <TabsTrigger value="weekly">Weekly Progress</TabsTrigger>
                                             </TabsList>

                                             <TabsContent value="tasks">
                                                  <div className="h-[300px] flex items-center justify-center">
                                                       <div className="w-full max-w-md">
                                                            {/* Simple visualization of tasks by status */}
                                                            <div className="space-y-4">
                                                                 {Array.isArray(analyticsData?.tasksByStatus) ? (
                                                                      analyticsData.tasksByStatus.map((item) => (
                                                                           <div key={item.status} className="space-y-2">
                                                                                <div className="flex justify-between">
                                                                                     <span className="text-sm font-medium">
                                                                                          {statusLabel(
                                                                                               item.status as TaskStatusType,
                                                                                          )}
                                                                                     </span>
                                                                                     <span className="text-sm text-gray-500">
                                                                                          {item.count} tasks
                                                                                     </span>
                                                                                </div>
                                                                                <Progress
                                                                                     value={
                                                                                          (item.count /
                                                                                               analyticsData.tasksByStatus.reduce(
                                                                                                    (acc, curr) =>
                                                                                                         acc +
                                                                                                         curr.count,
                                                                                                    0,
                                                                                               )) *
                                                                                          100
                                                                                     }
                                                                                     className={`h-2 ${
                                                                                          item.status === "completed"
                                                                                               ? "bg-green-100"
                                                                                               : item.status ===
                                                                                                 "pastDue"
                                                                                               ? "bg-red-100"
                                                                                               : item.status ===
                                                                                                 "pending"
                                                                                               ? "bg-blue-100"
                                                                                               : "bg-gray-100"
                                                                                     }`}
                                                                                />
                                                                           </div>
                                                                      ))
                                                                 ) : (
                                                                      <div className="space-y-2">
                                                                           <div className="flex justify-between">
                                                                                <Skeleton className="h-4 w-24" />
                                                                                <Skeleton className="h-4 w-16" />
                                                                           </div>
                                                                           <Skeleton className="h-2 w-full rounded" />
                                                                      </div>
                                                                 )}
                                                            </div>
                                                       </div>
                                                  </div>
                                             </TabsContent>

                                             <TabsContent value="priority">
                                                  <div className="h-[300px] flex items-center justify-center">
                                                       <div className="w-full max-w-md">
                                                            <div className="flex justify-around items-center">
                                                                 {Array.isArray(analyticsData?.tasksByPriority) ? (
                                                                      analyticsData.tasksByPriority.map((item) => (
                                                                           <div
                                                                                key={item.priority}
                                                                                className="text-center"
                                                                           >
                                                                                <div
                                                                                     className={`
                                h-[200px] w-[60px] rounded-t-lg mx-auto relative
                                ${
                                     item.priority === "High"
                                          ? "bg-red-400"
                                          : item.priority === "Medium"
                                          ? "bg-yellow-400"
                                          : "bg-green-400"
                                }
                              `}
                                                                                >
                                                                                     <div
                                                                                          className="absolute bottom-0 w-full bg-gray-200"
                                                                                          style={{
                                                                                               height: `${
                                                                                                    Array.isArray(
                                                                                                         analyticsData?.tasksByPriority,
                                                                                                    )
                                                                                                         ? (1 -
                                                                                                                item.count /
                                                                                                                     analyticsData.tasksByPriority.reduce(
                                                                                                                          (
                                                                                                                               acc,
                                                                                                                               curr,
                                                                                                                          ) =>
                                                                                                                               acc +
                                                                                                                               curr.count,
                                                                                                                          0,
                                                                                                                     )) *
                                                                                                           100
                                                                                                         : 0
                                                                                               }%`,
                                                                                          }}
                                                                                     ></div>
                                                                                </div>
                                                                                <p className="mt-2 text-sm font-medium">
                                                                                     {item.priority}
                                                                                </p>
                                                                                <p className="text-xs text-gray-500">
                                                                                     {item.count} tasks
                                                                                </p>
                                                                           </div>
                                                                      ))
                                                                 ) : (
                                                                      <div className="text-center">
                                                                           <Skeleton className="h-[200px] w-[60px] rounded-t-lg mx-auto" />
                                                                           <Skeleton className="h-4 w-20 mx-auto mt-2" />
                                                                           <Skeleton className="h-3 w-12 mx-auto" />
                                                                      </div>
                                                                 )}
                                                            </div>
                                                       </div>
                                                  </div>
                                             </TabsContent>

                                             <TabsContent value="weekly">
                                                  <div className="h-[300px] flex items-center justify-center">
                                                       <div className="w-full max-w-md">
                                                            <div className="flex justify-between items-end h-[200px]">
                                                                 {Array.isArray(analyticsData?.weeklyProgress) ? (
                                                                      analyticsData.weeklyProgress.map((item) => (
                                                                           <div
                                                                                key={item.day}
                                                                                className="flex flex-col items-center"
                                                                           >
                                                                                <div
                                                                                     className="w-[30px] bg-blue-500 rounded-t-sm"
                                                                                     style={{
                                                                                          height: `${
                                                                                               (item.completed /
                                                                                                    Math.max(
                                                                                                         ...analyticsData.weeklyProgress.map(
                                                                                                              (d) =>
                                                                                                                   d.completed,
                                                                                                         ),
                                                                                                    )) *
                                                                                               180
                                                                                          }px`,
                                                                                     }}
                                                                                ></div>
                                                                                <p className="mt-2 text-xs">
                                                                                     {item.day}
                                                                                </p>
                                                                                <p className="text-xs font-medium">
                                                                                     {item.completed}
                                                                                </p>
                                                                           </div>
                                                                      ))
                                                                 ) : (
                                                                      <div className="flex flex-col items-center">
                                                                           <Skeleton className="w-[30px] h-[120px] rounded-t-sm" />
                                                                           <Skeleton className="h-3 w-8 mt-2" />
                                                                           <Skeleton className="h-3 w-6" />
                                                                      </div>
                                                                 )}
                                                            </div>
                                                       </div>
                                                  </div>
                                             </TabsContent>
                                        </Tabs>
                                   </CardContent>
                              </Card>

                              {/* Team Members List */}
                              <Card>
                                   <CardHeader className="flex flex-row items-center justify-between">
                                        <CardTitle>Team Members</CardTitle>
                                        <Button
                                             variant="outline"
                                             size="sm"
                                             onClick={() => setTeamMembersSheetOpen(true)}
                                        >
                                             View All
                                        </Button>
                                   </CardHeader>
                                   <CardContent>
                                        <div className="space-y-4">
                                             {Array.isArray(teamMembers) ? (
                                                  take(teamMembers, 3).map((member) => (
                                                       <div
                                                            key={member.id}
                                                            className="flex items-center justify-between"
                                                       >
                                                            <div className="flex items-center">
                                                                 <Avatar className="h-10 w-10 mr-3">
                                                                      <AvatarImage
                                                                           src={member.avatar || "/placeholder.svg"}
                                                                           alt={member.name}
                                                                      />
                                                                      <AvatarFallback>
                                                                           {getInitials(member.name)}
                                                                      </AvatarFallback>
                                                                 </Avatar>
                                                                 <div>
                                                                      <p className="font-medium">{member.name}</p>
                                                                      <p className="text-sm text-gray-500">
                                                                           {member.workRole}
                                                                      </p>
                                                                 </div>
                                                            </div>
                                                            <div className="text-right">
                                                                 <p className="text-sm font-medium">
                                                                      {member.tasksCompleted} tasks completed
                                                                 </p>
                                                                 <p className="text-xs text-gray-500">
                                                                      {member.tasksInProgress} in progress
                                                                 </p>
                                                            </div>
                                                       </div>
                                                  ))
                                             ) : (
                                                  <div className="flex items-center justify-between">
                                                       <div className="flex items-center">
                                                            <Skeleton className="h-10 w-10 mr-3 rounded-full" />
                                                            <div>
                                                                 <Skeleton className="h-4 w-24 mb-1" />
                                                                 <Skeleton className="h-3 w-16" />
                                                            </div>
                                                       </div>
                                                       <div className="text-right">
                                                            <Skeleton className="h-4 w-20 mb-1" />
                                                            <Skeleton className="h-3 w-14" />
                                                       </div>
                                                  </div>
                                             )}
                                        </div>
                                   </CardContent>
                                   <CardFooter>
                                        <Button
                                             variant="ghost"
                                             className="w-full"
                                             onClick={() => setTeamMembersSheetOpen(true)}
                                        >
                                             View All Team Members
                                        </Button>
                                   </CardFooter>
                              </Card>
                         </div>

                         {/* Right Sidebar */}
                         <div className="space-y-6">
                              {/* Invitation Requests */}
                              {/* <Card>
                                   <CardHeader>
                                        <CardTitle className="text-lg">Invitation Requests</CardTitle>
                                   </CardHeader>
                                   <CardContent className="space-y-4">
                                        {invitationRequests.length > 0 ? (
                                             invitationRequests.map((request) => (
                                                  <div key={request.id} className="border rounded-lg p-3">
                                                       <div className="flex items-start mb-2">
                                                            <div className="flex-1 min-w-0">
                                                                 <p className="text-sm font-medium">{request.name}</p>
                                                                 <p className="text-xs text-gray-500">
                                                                      {request.email}
                                                                 </p>
                                                                 <p className="text-xs text-gray-500">
                                                                      Role: {request.role}
                                                                 </p>
                                                                 <p className="text-xs text-gray-500 mt-1">
                                                                      Requested: {formatShortDate(request.requestDate)}
                                                                 </p>
                                                            </div>
                                                       </div>
                                                       <div className="flex space-x-2 mt-3">
                                                            <Button size="sm" className="flex-1">
                                                                 <CheckCircle className="mr-1 h-4 w-4" />
                                                                 Accept
                                                            </Button>
                                                            <Button variant="outline" size="sm" className="flex-1">
                                                                 <XCircle className="mr-1 h-4 w-4" />
                                                                 Decline
                                                            </Button>
                                                       </div>
                                                  </div>
                                             ))
                                        ) : (
                                             <p className="text-center text-gray-500">No pending invitation requests</p>
                                        )}
                                   </CardContent>
                                   {invitationRequests.length > 0 && (
                                        <CardFooter>
                                             <Button variant="ghost" size="sm" className="w-full">
                                                  View All Requests
                                             </Button>
                                        </CardFooter>
                                   )}
                              </Card> */}

                              {/* Upcoming Meetings */}
                              <Card>
                                   <CardHeader className="pb-2">
                                        <CardTitle className="text-lg">Upcoming Meetings</CardTitle>
                                   </CardHeader>
                                   <CardContent>
                                        {Array.isArray(upcomingMeetings) && upcomingMeetings.length === 0 ? (
                                             <MeetingFallback />
                                        ) : null}
                                        {Array.isArray(upcomingMeetings) ? (
                                             upcomingMeetings.map((meeting) => (
                                                  <div
                                                       key={meeting.id}
                                                       className="flex items-start py-3 first:pt-0 last:pb-0"
                                                  >
                                                       <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary mr-3">
                                                            <Clock className="h-5 w-5" />
                                                       </div>
                                                       <div className="flex-1">
                                                            <h4 className="text-sm font-medium">{meeting.agenda}</h4>
                                                            <p className="text-xs text-gray-500">
                                                                 {formatDate(meeting.startTime)} • {meeting.attendees}{" "}
                                                                 attendees
                                                            </p>
                                                       </div>
                                                  </div>
                                             ))
                                        ) : (
                                             <div className="flex items-start py-3 first:pt-0 last:pb-0">
                                                  <Skeleton className="h-10 w-10 rounded-full mr-3" />
                                                  <div className="flex-1">
                                                       <Skeleton className="h-4 w-32 mb-2" />
                                                       <Skeleton className="h-3 w-24" />
                                                  </div>
                                             </div>
                                        )}
                                   </CardContent>
                                   {Array.isArray(upcomingMeetings) && upcomingMeetings.length > 0 && (
                                        <CardFooter className="pt-0 flex justify-between">
                                             {/* <Button variant="outline" size="sm">
                                                  Schedule
                                             </Button> */}
                                             <Button variant="outline" size="sm">
                                                  View Calendar
                                             </Button>
                                        </CardFooter>
                                   )}
                              </Card>

                              {/* Recent Activity */}
                              <Card>
                                   <CardHeader>
                                        <CardTitle className="text-lg">Recent Activity</CardTitle>
                                   </CardHeader>
                                   <CardContent className="max-h-[320px] overflow-y-auto">
                                        {Array.isArray(recentActivities) && recentActivities.length === 0 && (
                                             <ActivityFallBack />
                                        )}

                                        {Array.isArray(recentActivities)
                                             ? recentActivities.map((activity) => (
                                                    <div key={activity.id} className="flex items-start py-3 first:pt-0">
                                                         <div className="flex-1 min-w-0">
                                                              <p className="text-sm">{activity.activity}</p>
                                                              <p className="text-xs text-gray-500">
                                                                   {formatDate(activity.createdAt)}
                                                              </p>
                                                         </div>
                                                    </div>
                                               ))
                                             : [...Array(3)].map((_, idx) => (
                                                    <div key={idx} className="flex items-start py-3 first:pt-0">
                                                         <div className="flex-1 min-w-0">
                                                              <Skeleton className="h-4 w-40 mb-2" />
                                                              <Skeleton className="h-3 w-24" />
                                                         </div>
                                                    </div>
                                               ))}
                                   </CardContent>
                                   <CardFooter className="pt-0">
                                        <Button variant="ghost" size="sm" className="w-full">
                                             View All Activity
                                        </Button>
                                   </CardFooter>
                              </Card>
                         </div>
                    </div>
               </main>
          </Layout>
     );
}
