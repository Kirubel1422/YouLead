import Layout from "@/components/sidebar/layout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { AlertCircle, BarChart3, Calendar, Clock, FileText, MoreHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getDaysRemaining, getPriorityColor, getStatusColor } from "@/utils/basic";
import { useMyTasksQuery } from "@/api/tasks.api";
import { ITaskDetail, TaskFilter } from "@/types/task.types";
import { useGetMainQuery } from "@/api/analytics.api";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/rootReducer";
import { Empty } from "@/components/placeholder/empty";

const activities = [
     {
          id: 1,
          user: {
               name: "Sarah Johnson",
               avatar: "/placeholder.svg?height=32&width=32",
               initials: "SJ",
          },
          action: "commented on",
          target: "Fix navigation bug",
          time: "10 minutes ago",
     },
     {
          id: 2,
          user: {
               name: "Michael Chen",
               avatar: "/placeholder.svg?height=32&width=32",
               initials: "MC",
          },
          action: "completed",
          target: "Setup authentication flow",
          time: "1 hour ago",
     },
     {
          id: 3,
          user: {
               name: "Alex Rodriguez",
               avatar: "/placeholder.svg?height=32&width=32",
               initials: "AR",
          },
          action: "assigned you to",
          target: "Create responsive components",
          time: "3 hours ago",
     },
     {
          id: 4,
          user: {
               name: "Jessica Lee",
               avatar: "/placeholder.svg?height=32&width=32",
               initials: "JL",
          },
          action: "mentioned you in",
          target: "Team meeting notes",
          time: "Yesterday",
     },
];

const upcomingMeetings = [
     {
          id: 1,
          title: "Weekly Team Standup",
          time: "Today, 10:00 AM",
          duration: "30 min",
     },
     {
          id: 2,
          title: "Project Review",
          time: "Tomorrow, 2:00 PM",
          duration: "1 hour",
     },
];

export default function TeamMemberDashboard() {
     const { user } = useSelector((state: RootState) => state.base.auth);
     const [taskFilter, setTaskFilter] = useState<TaskFilter>(undefined);

     const { data, isFetching: fetchingTasks } = useMyTasksQuery(taskFilter, {
          refetchOnMountOrArgChange: true,
     });

     const { data: analytics, isFetching: fetchingAnalytics } = useGetMainQuery();

     const formatDate = (dateString: string) => {
          const date = new Date(dateString);
          return new Intl.DateTimeFormat("en-US", {
               month: "short",
               day: "numeric",
               year: "numeric",
          }).format(date);
     };

     const isOverdue = (dateString: string) => {
          const today = new Date();
          const dueDate = new Date(dateString);
          return dueDate < today;
     };

     return (
          <Layout>
               <main className="flex-1 overflow-y-auto p-4 md:p-6">
                    <div className="mb-6">
                         <h1 className="text-2xl font-bold">Welcome back, {user.profile.firstName}!</h1>
                         <p className="text-gray-500">Here's what's happening with your tasks and projects today.</p>
                    </div>

                    {/* Stats Overview */}
                    {fetchingAnalytics ? (
                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                              {Array.from({ length: 4 }, (_, i: number) => (
                                   <Card key={i}>
                                        <CardContent className="p-6">
                                             <div className="flex items-center justify-between">
                                                  <div>
                                                       <p className="text-sm font-medium text-gray-500 mb-4">
                                                            <Skeleton className="w-20 h-2" />
                                                       </p>
                                                       <h3 className="text-2xl font-bold mt-1">
                                                            <Skeleton className="w-24 h-4" />
                                                       </h3>
                                                  </div>
                                                  <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center text-red-500">
                                                       <Skeleton className="w-12 h-12" />
                                                  </div>
                                             </div>
                                        </CardContent>
                                   </Card>
                              ))}
                         </div>
                    ) : (
                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                              <Card>
                                   <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                             <div>
                                                  <p className="text-sm font-medium text-gray-500">Tasks Due Soon</p>
                                                  <h3 className="text-2xl font-bold mt-1">
                                                       {analytics?.tasksDueSoon || 0}
                                                  </h3>
                                             </div>
                                             <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center text-red-500">
                                                  <AlertCircle className="h-6 w-6" />
                                             </div>
                                        </div>
                                        <p className="text-xs text-red-500 mt-2">
                                             {analytics?.tasksDueSoon} tasks due this week
                                        </p>
                                   </CardContent>
                              </Card>

                              <Card>
                                   <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                             <div>
                                                  <p className="text-sm font-medium text-gray-500">Completion Rate</p>
                                                  <h3 className="text-2xl font-bold mt-1">
                                                       {((analytics?.completionRate || 0) * 100).toFixed(1)}%
                                                  </h3>
                                             </div>
                                             <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center text-green-500">
                                                  <BarChart3 className="h-6 w-6" />
                                             </div>
                                        </div>
                                        <Progress value={(analytics?.completionRate || 0) * 100} className="h-2 mt-2" />
                                   </CardContent>
                              </Card>

                              <Card>
                                   <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                             <div>
                                                  <p className="text-sm font-medium text-gray-500">Active Projects</p>
                                                  <h3 className="text-2xl font-bold mt-1">
                                                       {analytics?.activeProjects || 0}
                                                  </h3>
                                             </div>
                                             <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-500">
                                                  <FileText className="h-6 w-6" />
                                             </div>
                                        </div>
                                   </CardContent>
                              </Card>

                              <Card>
                                   <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                             <div>
                                                  <p className="text-sm font-medium text-gray-500">Upcoming Meetings</p>
                                                  <h3 className="text-2xl font-bold mt-1">
                                                       {analytics?.upcomingMeetings || 0}
                                                  </h3>
                                             </div>
                                             <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-500">
                                                  <Calendar className="h-6 w-6" />
                                             </div>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-2">
                                             Next: {formatDate(analytics?.latestMeeting || new Date().toLocaleString())}
                                        </p>
                                   </CardContent>
                              </Card>
                         </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                         {/* My Tasks */}
                         <div className="lg:col-span-2">
                              <Tabs
                                   onValueChange={(value) => {
                                        setTaskFilter(value as TaskFilter);
                                   }}
                                   defaultValue="all"
                              >
                                   <div className="flex items-center justify-between mb-4">
                                        <h2 className="text-xl font-bold">My Tasks</h2>
                                        <TabsList>
                                             <TabsTrigger value="all">All</TabsTrigger>
                                             <TabsTrigger value="today">Today</TabsTrigger>
                                             <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                                        </TabsList>
                                   </div>

                                   <TabsContent value="all" className="space-y-4">
                                        {!fetchingTasks &&
                                             data &&
                                             data.tasks &&
                                             data.tasks.map((task: ITaskDetail) => (
                                                  <TaskCard
                                                       isOverdue={isOverdue}
                                                       formatDate={formatDate}
                                                       task={task}
                                                       key={task.id}
                                                  />
                                             ))}

                                        {data && data.total === 0 && <Empty />}
                                   </TabsContent>

                                   <TabsContent value="today" className="space-y-4">
                                        {!fetchingTasks &&
                                             data &&
                                             data.tasks &&
                                             data.tasks.map((task: ITaskDetail) => (
                                                  <TaskCard
                                                       isOverdue={isOverdue}
                                                       formatDate={formatDate}
                                                       task={task}
                                                       key={task.id}
                                                  />
                                             ))}

                                        {data && data.total === 0 && <Empty />}
                                   </TabsContent>

                                   <TabsContent value="upcoming" className="space-y-4">
                                        {!fetchingTasks &&
                                             data &&
                                             data.tasks &&
                                             data.tasks.map((task: ITaskDetail) => (
                                                  <TaskCard
                                                       isOverdue={isOverdue}
                                                       formatDate={formatDate}
                                                       task={task}
                                                       key={task.id}
                                                  />
                                             ))}

                                        {data && data.total === 0 && <Empty />}
                                   </TabsContent>
                              </Tabs>
                         </div>

                         {/* Right Sidebar */}
                         <div className="space-y-6">
                              {/* Upcoming Meetings */}
                              <Card>
                                   <CardHeader className="pb-2">
                                        <CardTitle className="text-lg">Upcoming Meetings</CardTitle>
                                   </CardHeader>
                                   <CardContent>
                                        {upcomingMeetings.map((meeting) => (
                                             <div
                                                  key={meeting.id}
                                                  className="flex items-start py-3 first:pt-0 last:pb-0"
                                             >
                                                  <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary mr-3">
                                                       <Clock className="h-5 w-5" />
                                                  </div>
                                                  <div className="flex-1">
                                                       <h4 className="text-sm font-medium">{meeting.title}</h4>
                                                       <p className="text-xs text-gray-500">
                                                            {meeting.time} • {meeting.duration}
                                                       </p>
                                                  </div>
                                             </div>
                                        ))}
                                   </CardContent>
                                   <CardFooter className="pt-0">
                                        <Button variant="outline" size="sm" className="w-full">
                                             View Calendar
                                        </Button>
                                   </CardFooter>
                              </Card>

                              {/* Recent Activity */}
                              <Card>
                                   <CardHeader className="pb-2">
                                        <CardTitle className="text-lg">Recent Activity</CardTitle>
                                   </CardHeader>
                                   <CardContent className="max-h-[320px] overflow-y-auto">
                                        {activities.map((activity) => (
                                             <div key={activity.id} className="flex items-start py-3 first:pt-0">
                                                  <Avatar className="h-8 w-8 mr-3">
                                                       <AvatarImage
                                                            src={activity.user.avatar}
                                                            alt={activity.user.name}
                                                       />
                                                       <AvatarFallback>{activity.user.initials}</AvatarFallback>
                                                  </Avatar>
                                                  <div className="flex-1 min-w-0">
                                                       <p className="text-sm">
                                                            <span className="font-medium">{activity.user.name}</span>{" "}
                                                            <span className="text-gray-500">{activity.action}</span>{" "}
                                                            <span className="font-medium truncate">
                                                                 {activity.target}
                                                            </span>
                                                       </p>
                                                       <p className="text-xs text-gray-500">{activity.time}</p>
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

interface TaskCardProps {
     task: ITaskDetail;
     isOverdue: (dateStr: string) => boolean;
     formatDate: (dateStr: string) => unknown;
}

const TaskCard = ({ task, formatDate, isOverdue }: TaskCardProps) => {
     return (
          <Card key={task.id} className="overflow-hidden">
               <CardContent className="p-0">
                    <div className="flex flex-col sm:flex-row sm:items-center p-4">
                         <div className="flex-1 min-w-0">
                              <div className="flex items-center mb-1">
                                   <h3 className="text-sm font-medium truncate mr-2">{task.name}</h3>
                                   <Badge className={getStatusColor(task.status)}>{task.status}</Badge>
                                   <Badge className={`ml-2 ${getPriorityColor(task.priority)}`}>{task.priority}</Badge>
                              </div>

                              <p className="text-xs text-gray-500">
                                   {task.projectName} • Due{" "}
                                   {task.deadline ? (
                                        <>
                                             {formatDate(task.deadline[0])}
                                             {isOverdue(task.deadline[0]) ? (
                                                  <span className="text-red-500 ml-2">Overdue</span>
                                             ) : (
                                                  <span className="ml-2">
                                                       {getDaysRemaining(task.deadline[0]) === 0
                                                            ? "Due today"
                                                            : `${getDaysRemaining(task.deadline[0])} days left`}
                                                  </span>
                                             )}
                                        </>
                                   ) : (
                                        <span>deadline unassigned</span>
                                   )}
                              </p>
                         </div>
                         <div className="mt-2 sm:mt-0 flex items-center">
                              <div className="w-32 mr-4">
                                   <div className="flex items-center">
                                        <Progress value={task.progress} className="h-2 flex-1" />
                                        <span className="ml-2 text-xs font-medium">{task.progress}%</span>
                                   </div>
                              </div>
                              <DropdownMenu>
                                   <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon">
                                             <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                   </DropdownMenuTrigger>
                                   <DropdownMenuContent align="end">
                                        <DropdownMenuItem>View Details</DropdownMenuItem>
                                        <DropdownMenuItem>Mark as Complete</DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem>Remove</DropdownMenuItem>
                                   </DropdownMenuContent>
                              </DropdownMenu>
                         </div>
                    </div>
               </CardContent>
          </Card>
     );
};
