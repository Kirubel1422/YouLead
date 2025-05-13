import { useMyTasksQuery } from "@/api/tasks.api";
import Layout from "@/components/sidebar/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ITaskDetail, TaskFilter } from "@/types/task.types";
import { Search, Plus } from "lucide-react";
import { useState } from "react";
import TaskDetail from "@/components/modal/task/TaskDetail";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { formatDate, getDaysRemaining, getPriorityColor, getStatusColor, isOverdue } from "@/utils/basic";
import { useSelector } from "react-redux";
import { RootState } from "@/store/rootReducer";
import { Skeleton } from "@/components/ui/skeleton";

export default function Tasks() {
     const [taskFilter, setTaskFilter] = useState<TaskFilter>(undefined);
     const { user } = useSelector((state: RootState) => state.base.auth);
     const [searchQuery, setSearchQuery] = useState("");
     const [taskDetailOpen, setTaskDetailOpen] = useState(false);
     const [selectedTask, setSelectedTask] = useState<ITaskDetail>();

     const { data: tasks, isFetching } = useMyTasksQuery(taskFilter);

     const filteredTasks = tasks?.tasks.filter((task) => task.name.toLowerCase().includes(searchQuery.toLowerCase()));

     return (
          <Layout>
               <main className="flex-1 space-y-4 p-8 pt-6">
                    <div className="flex items-center justify-between space-y-2">
                         <h2 className="text-3xl font-bold tracking-tight">Tasks</h2>
                         <div hidden={user.role === "teamMember"} className="flex items-center space-x-2">
                              <Button>
                                   <Plus className="mr-2 h-4 w-4" />
                                   New Task
                              </Button>
                         </div>
                    </div>

                    <Tabs defaultValue="all" className="space-y-4">
                         <div className="flex justify-between">
                              <TabsList>
                                   <TabsTrigger value="all" onClick={() => setTaskFilter(undefined)}>
                                        All Tasks
                                   </TabsTrigger>
                                   <TabsTrigger value="today" onClick={() => setTaskFilter("today")}>
                                        Due Today
                                   </TabsTrigger>
                                   <TabsTrigger value="upcoming" onClick={() => setTaskFilter("upcoming")}>
                                        Upcoming
                                   </TabsTrigger>
                              </TabsList>

                              <div className="flex gap-2">
                                   <div className="flex items-center space-x-2">
                                        <div className="relative">
                                             <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                             <Input
                                                  placeholder="Search tasks..."
                                                  className="pl-8 bg-white"
                                                  value={searchQuery}
                                                  onChange={(e) => setSearchQuery(e.target.value)}
                                             />
                                        </div>
                                   </div>
                              </div>
                         </div>

                         <TabsContent value="all" className="space-y-4">
                              <div className="grid gap-4">
                                   {isFetching &&
                                        Array(5)
                                             .fill(0)
                                             .map((_, index) => (
                                                  <Skeleton
                                                       key={index}
                                                       className="h-24 w-full bg-gray-200 rounded-md"
                                                  />
                                             ))}
                                   {filteredTasks?.map((task) => (
                                        <Card
                                             key={task.id}
                                             className="overflow-hidden cursor-pointer hover:border-primary/50 transition-colors"
                                             onClick={() => {
                                                  setSelectedTask(task);
                                                  setTaskDetailOpen(true);
                                             }}
                                        >
                                             <CardContent className="p-0">
                                                  <div className="flex flex-col sm:flex-row sm:items-center p-4">
                                                       <div className="flex-1 min-w-0">
                                                            <div className="flex items-center mb-1">
                                                                 <h3 className="text-sm font-medium truncate mr-2">
                                                                      {task.name}
                                                                 </h3>
                                                                 <Badge className={getStatusColor(task.status)}>
                                                                      {task.status}
                                                                 </Badge>
                                                                 <Badge
                                                                      className={`ml-2 ${getPriorityColor(
                                                                           task.priority,
                                                                      )}`}
                                                                 >
                                                                      {task.priority}
                                                                 </Badge>
                                                            </div>
                                                            <p className="text-xs text-gray-500">
                                                                 {task.projectName} • Due{" "}
                                                                 {task.deadline ? (
                                                                      <>
                                                                           {formatDate(task.deadline[0])}
                                                                           {isOverdue(task.deadline[0]) ? (
                                                                                <span className="text-red-500 ml-2">
                                                                                     Overdue
                                                                                </span>
                                                                           ) : (
                                                                                <span className="ml-2">
                                                                                     {getDaysRemaining(
                                                                                          task.deadline[0],
                                                                                     ) === 0
                                                                                          ? "Due today"
                                                                                          : `${getDaysRemaining(
                                                                                                 task.deadline[0],
                                                                                            )} days left`}
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
                                                                      <Progress
                                                                           value={task.progress}
                                                                           className="h-2 flex-1"
                                                                      />
                                                                      <span className="ml-2 text-xs font-medium">
                                                                           {task.progress}%
                                                                      </span>
                                                                 </div>
                                                            </div>
                                                       </div>
                                                  </div>
                                             </CardContent>
                                        </Card>
                                   ))}
                              </div>
                         </TabsContent>

                         <TabsContent value="today" className="space-y-4">
                              <div className="grid gap-4">
                                   {/* Same card layout as 'all' but filtered for today's tasks */}
                              </div>
                         </TabsContent>

                         <TabsContent value="upcoming" className="space-y-4">
                              <div className="grid gap-4">
                                   {/* Same card layout as 'all' but filtered for upcoming tasks */}
                              </div>
                         </TabsContent>
                    </Tabs>

                    {taskDetailOpen && (
                         <TaskDetail open={taskDetailOpen} setOpen={setTaskDetailOpen} selectedTask={selectedTask} />
                    )}
               </main>
          </Layout>
     );
}
