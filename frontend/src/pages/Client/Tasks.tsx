import { useHandleDeadlineMutation, useMyTasksQuery } from "@/api/tasks.api";
import Layout from "@/components/sidebar/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ITask, TaskFilter, TaskPriorityType, TaskStatusType } from "@/types/task.types";
import { Plus, CheckCircle, AlertTriangle, Clock, Calendar, Coffee } from "lucide-react";
import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/utils/basic";
import { useSelector } from "react-redux";
import { RootState } from "@/store/rootReducer";
import { Skeleton } from "@/components/ui/skeleton";
import { IProjectMembers, useLazyFetchProjectMembersQuery } from "@/api/projects.api";
import TaskSheet from "@/components/sheet/task/TaskSheet";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/Toast";
import { Loadable } from "@/components/state";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";
import TaskFallBack from "@/components/fallbacks/task/task";

export default function Tasks() {
     const [statusFilter, setStatusFilter] = useState<string | undefined>("all");
     const [taskFilter, setTaskFilter] = useState<TaskFilter>(undefined);
     const { user } = useSelector((state: RootState) => state.base.auth);
     const { projects } = useSelector((state: RootState) => state.base.projects);

     const [searchQuery, setSearchQuery] = useState("");

     const { data: tasks, isFetching } = useMyTasksQuery(taskFilter);

     const filteredTasks = tasks?.tasks.filter((task) =>
          task.name.toLowerCase().includes(searchQuery.toLowerCase()) && statusFilter === "all"
               ? true
               : task.status === statusFilter,
     );

     // // Fetch my projects
     // const { data: myProjects } = useFetchMyProjectsQuery({
     //      page: 1,
     //      limit: 100,
     //      teamId: user.teamId as string,
     // });

     // Create sheet state
     const [projectMembers, setProjectMembers] = useState<IProjectMembers[]>([]);

     const fetchProjectMembers = useLazyFetchProjectMembersQuery();

     const handleProjectClick = async (projectId: string) => {
          const members = await fetchProjectMembers[0](projectId);
          setProjectMembers(members.data as IProjectMembers[]);
     };

     const getStatusBadge = (status: TaskStatusType) => {
          switch (status) {
               case "pending":
                    return <Badge className="bg-blue-100 text-blue-800">Pending</Badge>;
               case "completed":
                    return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
               case "pastDue":
                    return <Badge className="bg-red-100 text-red-800">Past Due</Badge>;
               default:
                    return <Badge>Unknown</Badge>;
          }
     };

     const getPriorityBadge = (priority: TaskPriorityType) => {
          switch (priority) {
               case "low":
                    return <Badge className="bg-gray-100 text-gray-800">Low</Badge>;
               case "medium":
                    return <Badge className="bg-orange-100 text-orange-800">Medium</Badge>;
               case "high":
                    return <Badge className="bg-red-100 text-red-800">High</Badge>;
               default:
                    return <Badge>Unknown</Badge>;
          }
     };

     const [isSheetOpen, setIsSheetOpen] = useState(false);
     const [isEditing, setIsEditing] = useState(false);
     const [currentTask, setCurrentTask] = useState<ITask | undefined>();

     const handleCreateNew = () => {
          setCurrentTask(undefined);
          setIsEditing(false);
          setIsSheetOpen(true);
     };

     const handleEdit = (task: ITask) => {
          setCurrentTask(task);
          setIsEditing(true);
          setIsSheetOpen(true);
     };

     const getStatusIcon = (status: TaskStatusType) => {
          switch (status) {
               case "pending":
                    return <Clock className="h-5 w-5 text-blue-500" />;
               case "completed":
                    return <CheckCircle className="h-5 w-5 text-green-500" />;
               case "pastDue":
                    return <AlertTriangle className="h-5 w-5 text-red-500" />;
               default:
                    return null;
          }
     };

     // For deadline extending
     const [taskModOpen, setTaskModOpen] = useState<boolean>(false);
     const [deadlineData, setDeadlineData] = useState<{ taskData: ITask; index: number | null }>({
          taskData: {} as ITask,
          index: null,
     });

     // For filter toggle
     useEffect(() => {
          if (statusFilter == "") {
               setStatusFilter("all");
          }
     }, [statusFilter]);

     return (
          <Layout>
               <main className="flex-1 space-y-4 p-8 pt-6">
                    <div className="flex justify-between items-center">
                         <h1 className="text-2xl font-bold">Tasks</h1>
                         {user.role === "teamMember" ? null : (
                              <div className="flex items-center space-x-2">
                                   <Button variant={"primary"} onClick={handleCreateNew}>
                                        <Plus className="mr-2 h-4 w-4" />
                                        New Task
                                   </Button>
                              </div>
                         )}
                    </div>

                    <div className="space-y-4">
                         <div className="flex justify-between">
                              <ToggleGroup value={statusFilter} onValueChange={setStatusFilter} type="single">
                                   <ToggleGroupItem
                                        className={cn(
                                             statusFilter === "all" && "!bg-[#4f46e5] !text-white !font-semibold",
                                        )}
                                        variant={"outline"}
                                        value="all"
                                        aria-label="Toggle all"
                                   >
                                        All Tasks
                                   </ToggleGroupItem>
                                   <ToggleGroupItem
                                        className={cn(statusFilter === "pastDue" && "!bg-[#4f46e5] !text-white ")}
                                        variant={"outline"}
                                        value="pastDue"
                                        aria-label="Toggle pastDue"
                                   >
                                        Past Due
                                   </ToggleGroupItem>
                                   <ToggleGroupItem
                                        className={cn(statusFilter === "pending" && "!bg-[#4f46e5] !text-white ")}
                                        variant={"outline"}
                                        value="pending"
                                        aria-label="Toggle pending"
                                   >
                                        Pending
                                   </ToggleGroupItem>
                                   <ToggleGroupItem
                                        className={cn(statusFilter === "completed" && "!bg-[#4f46e5] !text-white ")}
                                        variant={"outline"}
                                        value="completed"
                                        aria-label="Toggle completed"
                                   >
                                        Completed
                                   </ToggleGroupItem>
                              </ToggleGroup>

                              <div className="relative w-64">
                                   <Input
                                        placeholder="Search tasks..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-8 bg-white"
                                   />
                                   <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                   >
                                        <path
                                             strokeLinecap="round"
                                             strokeLinejoin="round"
                                             strokeWidth={2}
                                             d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                        />
                                   </svg>
                              </div>
                         </div>

                         <div className="grid gap-4">
                              {isFetching &&
                                   Array(5)
                                        .fill(0)
                                        .map((_, index) => (
                                             <Skeleton key={index} className="h-24 w-full bg-gray-200 rounded-md" />
                                        ))}
                              {filteredTasks?.map((task, index) => (
                                   <div
                                        key={index}
                                        className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                                        onClick={(event) => {
                                             // If extend button is clicked
                                             const elm = document.querySelector("#extend-" + index);
                                             if (event.target === elm) {
                                                  // Clicked directly on elm (not a child)
                                                  setDeadlineData({
                                                       taskData: task,
                                                       index,
                                                  });

                                                  setTaskModOpen(true);
                                                  return;
                                             }

                                             handleEdit(task);
                                        }}
                                   >
                                        <div className="flex justify-between items-start">
                                             <div className="flex items-start space-x-3">
                                                  <div className="mt-1">{getStatusIcon(task.status)}</div>
                                                  <div>
                                                       <h3 className="font-medium">{task.name}</h3>
                                                       <p className="text-sm text-gray-500 mt-1">
                                                            {projects.find((p) => p.id === task.projectId)?.name ||
                                                                 "Unknown Project"}
                                                       </p>
                                                       {task.description && (
                                                            <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                                                                 {task.description}
                                                            </p>
                                                       )}
                                                  </div>
                                             </div>
                                             <div className="flex flex-col items-end space-y-2">
                                                  <div className="flex space-x-2">
                                                       {getStatusBadge(task.status)}
                                                       {getPriorityBadge(task.priority)}
                                                  </div>
                                                  {task.deadline && task.deadline.length > 0 && (
                                                       <p className="text-xs text-gray-500">
                                                            Due: {formatDate(task.deadline[task.deadline.length - 1])}
                                                       </p>
                                                  )}
                                             </div>
                                        </div>
                                        <div className="flex justify-between items-center mt-4">
                                             <div className="flex flex-col gap-2 items-start">
                                                  {typeof task.progress === "number" && (
                                                       <div className="w-32">
                                                            <Progress value={task.progress} />
                                                       </div>
                                                  )}
                                                  <Badge variant={"secondary"}>{task.progress} %</Badge>
                                             </div>

                                             {user.role != "teamMember" && (
                                                  <div className="flex items-center">
                                                       <Button
                                                            id={"extend-" + index}
                                                            className="bg-amber-600 hover:bg-amber-400"
                                                       >
                                                            <Calendar /> Extend
                                                       </Button>
                                                  </div>
                                             )}
                                        </div>
                                   </div>
                              ))}

                              {filteredTasks?.length === 0 && <TaskFallBack />}
                         </div>
                    </div>

                    <TaskSheet
                         isOpen={isSheetOpen}
                         onClose={() => setIsSheetOpen(false)}
                         task={isEditing ? currentTask : undefined}
                         isEditing={isEditing}
                         teamId={user.teamId as string}
                         projects={projects}
                         members={projectMembers}
                         handleProjectClick={handleProjectClick}
                         userRole={user.role as string}
                    />

                    {taskModOpen && (
                         <TaskDeadlineModal
                              open={taskModOpen}
                              setOpen={setTaskModOpen}
                              currentDeadlines={deadlineData.taskData.deadline as string[]}
                              taskId={deadlineData.taskData.id as string}
                         />
                    )}
               </main>
          </Layout>
     );
}

interface TaskDeadlineModalProps {
     open: boolean;
     setOpen: (val: boolean) => void;
     currentDeadlines?: string[];
     taskId: string;
}

const TaskDeadlineModal = ({ open, setOpen, currentDeadlines, taskId }: TaskDeadlineModalProps) => {
     const deadline =
          Array.isArray(currentDeadlines) && currentDeadlines.length > 0
               ? currentDeadlines[currentDeadlines.length - 1]
               : null;
     const { showToast } = useToast();
     const [value, setValue] = useState<string>(deadline as string);

     // Api integration
     const [adjust, { isLoading: adjusting }] = useHandleDeadlineMutation();

     const handleDeadline = async () => {
          try {
               const msg = await adjust({ taskId, deadline: new Date(value).toISOString() }).unwrap();
               showToast(msg, "success");
          } catch (error: any) {
               showToast(error.data.message || "Something went wrong!", "error");
          } finally {
               setOpen(false);
          }
     };

     return (
          <Dialog open={open} onOpenChange={setOpen}>
               <DialogContent>
                    <DialogHeader>
                         <DialogTitle>
                              <span>Adjust Deadline</span>
                         </DialogTitle>
                    </DialogHeader>

                    <Label id="deadline" className="mt-2 -mb-2 text-sm text-neutral-600">
                         Deadline
                    </Label>

                    <input onChange={(e) => setValue(e.target.value)} value={value} type="date" />

                    <DialogFooter className="mt-3">
                         <Button variant="secondary" onClick={() => setOpen(false)}>
                              Discard
                         </Button>

                         <Button onClick={handleDeadline}>
                              <Loadable isLoading={adjusting}>Apply</Loadable>
                         </Button>
                    </DialogFooter>
               </DialogContent>
          </Dialog>
     );
};
