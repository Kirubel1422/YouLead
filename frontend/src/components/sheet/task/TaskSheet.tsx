import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Plus, X, Check } from "lucide-react";
import {
     Select,
     SelectContent,
     SelectGroup,
     SelectItem,
     SelectLabel,
     SelectTrigger,
     SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { ITask, TaskPriorityType, TaskStatusType } from "@/types/task.types";
import { IProjectMembers } from "@/api/projects.api";
import { IProject } from "@/types/project.types";
import { exists, getInitials } from "@/utils/basic";
import { useForm } from "react-hook-form";
import { TaskSchema, TaskSchemaType } from "@/schemas/task.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import {
     useCreateTaskMutation,
     useHandleTaskAssignMutation,
     useHandleTaskUnAssignMutation,
     useUpdateTaskMutation,
} from "@/api/tasks.api";
import { useToast } from "@/components/Toast";
import { pickIEditTaskFields } from "@/utils/keyPicker";

interface TaskSheetProps {
     isOpen: boolean;
     onClose: () => void;
     task?: ITask;
     isEditing?: boolean;
     teamId: string;
     projects: Partial<IProject>[];
     members: IProjectMembers[];
     handleProjectClick: (projectId: string) => void;
     userRole: string;
}

export default function TaskSheet({
     isOpen,
     onClose,
     task,
     isEditing = false,
     teamId,
     projects,
     members,
     handleProjectClick,
     userRole,
}: TaskSheetProps) {
     const { showToast } = useToast();

     const [selectedCpy, setSelectedCpy] = useState<string[]>([]);

     useEffect(() => {
          if (exists(task) && task?.projectId) {
               handleProjectClick(task.projectId as string);
               setSelectedCpy(task.assignedTo.map((member: any) => member.id));
          }
     }, [task]);

     const {
          register,
          handleSubmit,
          formState: { errors },
          reset,
          setValue,
          watch,
     } = useForm<TaskSchemaType>({
          resolver: zodResolver(TaskSchema),
          defaultValues: isEditing
               ? {
                      ...task,
                 }
               : {},
     });

     useEffect(() => {
          if (!isEditing) {
               setSelectedCpy([]);
               setValue("teamId", teamId);
               setValue("progress", 3);
               return reset();
          }

          if (exists(task) && task && isEditing) {
               setValue("name", task.name);
               setValue("description", task.description);
               setValue(
                    "assignedTo",
                    task.assignedTo.map((member: any) => member.id),
               );
               setValue("status", task.status);
               setValue("priority", task.priority);
               setValue("deadline", task.deadline);
               setValue("projectId", task.projectId);
               setValue("progress", task.progress);
               setValue("teamId", task.teamId);
          }
     }, [task]);
     // const selectedMembers = watch("assignedTo") || [];

     const status = watch("status") || undefined;
     const priority = watch("priority") || undefined;
     const name = watch("name") || undefined;
     const projectId = watch("projectId") || undefined;

     // Update task mutation by id
     const [updateTask] = useUpdateTaskMutation();
     const [createTask] = useCreateTaskMutation();

     // Handle form submission
     const submit = async (data: TaskSchemaType) => {
          if (isEditing) {
               const taskData: TaskSchemaType = {
                    ...data,
                    teamId,
               };

               const body = pickIEditTaskFields(taskData);

               try {
                    const response = await updateTask({ taskId: task?.id as string, body }).unwrap();
                    showToast(response, "success");
                    reset();
                    onClose();
               } catch (error: any) {
                    showToast(error.data.message || "Something went wrong!", "error");
                    console.error(error);
               }
          } else {
               try {
                    const response = await createTask(data).unwrap();
                    showToast(response, "success");
               } catch (error: any) {
                    console.error(error);
                    showToast(error?.data?.any || "Something went wrong!", "error");
               }
          }
     };

     // Handle UnAssign
     const [unassign, { isLoading: unassigning }] = useHandleTaskUnAssignMutation();
     const handleUnAssign = async (memberId: string) => {
          const taskId = task?.id;

          try {
               const result = await unassign({ taskId: taskId as string, memberId }).unwrap();
               console.log("Unassign Handler: ", result);
               showToast(result, "success");
          } catch (error: any) {
               console.error("Error unassigning task: ", error);
               showToast(error.data.message || "Something went wrong!", "error");
               throw error;
          }
     };

     // Handle Assign
     const [assign, { isLoading: assigning }] = useHandleTaskAssignMutation();
     const handleAssign = async (memberId: string) => {
          const assignedTo = [memberId];
          const taskId = task?.id;

          try {
               const result = await assign({ taskId: taskId as string, assignedTo }).unwrap();
               console.log("Assign Handler: ", result);
               showToast(result, "success");
          } catch (error: any) {
               console.error("Error assigning task: ", error);
               showToast(error.data.message || "Something went wrong!", "error");
               throw error;
          }
     };

     return (
          <Sheet open={isOpen} onOpenChange={onClose}>
               <SheetContent className="sm:max-w-md md:max-w-lg overflow-y-auto">
                    <form onSubmit={handleSubmit(submit)}>
                         <SheetHeader>
                              <SheetTitle>
                                   {userRole == "teamMember" ? `${name}` : isEditing ? "Edit Task" : "Create New Task"}
                              </SheetTitle>
                              <SheetDescription>
                                   {userRole == "teamMember"
                                        ? "You can only view the task details."
                                        : isEditing
                                        ? "Edit the task details below."
                                        : "Create a new task for your project."}
                              </SheetDescription>
                         </SheetHeader>

                         <div className="grid gap-4 py-4 px-4">
                              {/* Project Selection */}
                              <div className="grid gap-2">
                                   <Label custom htmlFor="project" className="font-medium">
                                        Project{" "}
                                        <span className="text-red-500" hidden={userRole === "teamMember"}>
                                             *
                                        </span>
                                   </Label>
                                   {userRole === "teamMember" ? (
                                        Array.isArray(projects) &&
                                        projects.map((project) => {
                                             if (project.id === task?.projectId)
                                                  return (
                                                       <Badge custom variant={"outline"}>
                                                            {project.name}
                                                       </Badge>
                                                  );
                                        })
                                   ) : (
                                        <Select
                                             onValueChange={(val) => {
                                                  handleProjectClick(val);
                                                  setValue("teamId", teamId);
                                                  setValue("projectId", val);
                                             }}
                                             disabled={isEditing}
                                             value={projectId}
                                        >
                                             <SelectTrigger
                                                  id="project"
                                                  className={errors.projectId ? "border-red-500" : ""}
                                             >
                                                  <SelectValue className="w-full" placeholder="Select a project" />
                                             </SelectTrigger>
                                             <SelectContent>
                                                  <SelectGroup>
                                                       <SelectLabel>Select Project</SelectLabel>
                                                       {Array.isArray(projects) &&
                                                            projects.map((project) => (
                                                                 <SelectItem
                                                                      className="w-full"
                                                                      key={String(project.id)}
                                                                      value={String(project.id)}
                                                                 >
                                                                      {project.name}
                                                                 </SelectItem>
                                                            ))}
                                                  </SelectGroup>
                                             </SelectContent>
                                        </Select>
                                   )}

                                   {errors.projectId?.message && (
                                        <p className="text-sm text-red-500">{errors.projectId?.message}</p>
                                   )}
                              </div>

                              {/* Task Name */}
                              <div className="grid gap-2">
                                   <Label custom htmlFor="name" className="font-medium">
                                        Task Name{" "}
                                        <span className="text-red-500" hidden={userRole === "teamMember"}>
                                             *
                                        </span>
                                   </Label>
                                   <Input
                                        id="name"
                                        disabled={userRole == "teamMember"}
                                        {...register("name")}
                                        placeholder="Enter task name"
                                        className={errors.name ? "border-red-500" : ""}
                                   />
                                   {errors.name?.message && (
                                        <p className="text-sm text-red-500">{errors.name?.message}</p>
                                   )}
                              </div>

                              {/* Task Description */}
                              <div className="grid gap-2">
                                   <Label custom htmlFor="description" className="font-medium">
                                        Description
                                   </Label>
                                   <Textarea
                                        disabled={userRole == "teamMember"}
                                        id="description"
                                        {...register("description")}
                                        className={errors.description ? "border-red-500" : ""}
                                        placeholder="Enter task description"
                                        rows={3}
                                   />
                                   {errors.description?.message && (
                                        <p className="text-sm text-red-500">{errors.description?.message}</p>
                                   )}
                              </div>

                              {/* Assigned To */}
                              {isEditing && (
                                   <div className="grid gap-2">
                                        <Label custom className="font-medium">
                                             Assigned To{" "}
                                             <span className="text-red-500" hidden={userRole === "teamMember"}>
                                                  *
                                             </span>
                                        </Label>
                                        <div className="border rounded-md p-4">
                                             <div
                                                  className={cn(
                                                       "flex flex-wrap gap-2",
                                                       userRole !== "teamMember" && " mb-3",
                                                  )}
                                             >
                                                  {selectedCpy.length > 0 ? (
                                                       selectedCpy.map((memId) => {
                                                            const member = members.find((m) => m.id === memId);

                                                            return (
                                                                 member && (
                                                                      <Badge
                                                                           key={member.id}
                                                                           variant="secondary"
                                                                           className="flex items-center gap-1 py-1 px-2"
                                                                      >
                                                                           <Avatar className="h-5 w-5">
                                                                                <AvatarImage
                                                                                     src={"/placeholder.svg"}
                                                                                     alt={member.name}
                                                                                />
                                                                                <AvatarFallback className="text-xs">
                                                                                     {getInitials(member.name)}
                                                                                </AvatarFallback>
                                                                           </Avatar>
                                                                           <span>{member.name}</span>
                                                                           <button
                                                                                disabled={assigning || unassigning}
                                                                                hidden={
                                                                                     userRole == "teamMember" ||
                                                                                     !isEditing
                                                                                }
                                                                                type="button"
                                                                                onClick={async () => {
                                                                                     handleUnAssign(member.id).then(
                                                                                          () => {
                                                                                               setSelectedCpy((prev) =>
                                                                                                    prev.filter(
                                                                                                         (id) =>
                                                                                                              id !==
                                                                                                              memId,
                                                                                                    ),
                                                                                               );
                                                                                          },
                                                                                     );
                                                                                }}
                                                                                className="ml-1 text-gray-500 hover:text-gray-700"
                                                                           >
                                                                                <X className="h-3 w-3" />
                                                                           </button>
                                                                      </Badge>
                                                                 )
                                                            );
                                                       })
                                                  ) : (
                                                       <div className="text-sm text-gray-500">No members assigned</div>
                                                  )}
                                             </div>
                                             {errors.assignedTo?.message && (
                                                  <p className="text-sm text-red-500 mb-2">
                                                       {errors.assignedTo?.message}
                                                  </p>
                                             )}

                                             <div className="space-y-2 max-h-40 overflow-y-auto">
                                                  {userRole != "teamMember" &&
                                                       members.map((member) => (
                                                            <div
                                                                 key={member.id}
                                                                 className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-md"
                                                            >
                                                                 <div className="flex items-center">
                                                                      <Checkbox
                                                                           disabled={
                                                                                userRole == "teamMember" ||
                                                                                assigning ||
                                                                                unassigning
                                                                           }
                                                                           checked={selectedCpy.includes(member.id)}
                                                                           onCheckedChange={() => {
                                                                                if (!isEditing && !task?.id) {
                                                                                     const previous = [...selectedCpy];

                                                                                     // If it already has the id, then remove it.
                                                                                     if (previous.includes(member.id)) {
                                                                                          const removed =
                                                                                               previous.filter(
                                                                                                    (mId) =>
                                                                                                         mId !=
                                                                                                         member.id,
                                                                                               );
                                                                                          setSelectedCpy(removed);
                                                                                          setValue(
                                                                                               "assignedTo",
                                                                                               removed,
                                                                                          );
                                                                                          console.log("Assigned To: ");
                                                                                     } else {
                                                                                          const appended = [
                                                                                               ...previous,
                                                                                               member.id,
                                                                                          ];
                                                                                          setValue(
                                                                                               "assignedTo",
                                                                                               appended,
                                                                                          );
                                                                                          setSelectedCpy(appended);
                                                                                     }

                                                                                     return;
                                                                                }

                                                                                // Add or remove member from selected members
                                                                                const isSelected = selectedCpy.includes(
                                                                                     member.id,
                                                                                );
                                                                                if (isSelected) {
                                                                                     handleUnAssign(member.id).then(
                                                                                          () => {
                                                                                               setSelectedCpy((prev) =>
                                                                                                    prev.filter(
                                                                                                         (id) =>
                                                                                                              id !==
                                                                                                              member.id,
                                                                                                    ),
                                                                                               );
                                                                                          },
                                                                                     );
                                                                                } else {
                                                                                     handleAssign(member.id).then(
                                                                                          () => {
                                                                                               setSelectedCpy(
                                                                                                    (prev) => [
                                                                                                         ...prev,
                                                                                                         member.id,
                                                                                                    ],
                                                                                               );
                                                                                          },
                                                                                     );
                                                                                }
                                                                           }}
                                                                           className="mr-2"
                                                                      />
                                                                      <Avatar className="h-8 w-8 mr-2">
                                                                           <AvatarImage
                                                                                src={
                                                                                     member.avatar || "/placeholder.svg"
                                                                                }
                                                                                alt={member.name}
                                                                           />
                                                                           <AvatarFallback>
                                                                                {getInitials(member.name)}
                                                                           </AvatarFallback>
                                                                      </Avatar>
                                                                      <div>
                                                                           <p className="text-sm font-medium">
                                                                                {member.name}
                                                                           </p>
                                                                           {member.role && (
                                                                                <p className="text-xs text-gray-500">
                                                                                     {member.role}
                                                                                </p>
                                                                           )}
                                                                      </div>
                                                                 </div>
                                                                 {selectedCpy.includes(member.id) ? (
                                                                      <Check
                                                                           onClick={() => {
                                                                                if (!isEditing && !task?.id) {
                                                                                     const previous = [...selectedCpy];

                                                                                     // If it already has the id, then remove it.
                                                                                     const removed = previous.filter(
                                                                                          (mId) => mId != member.id,
                                                                                     );
                                                                                     setSelectedCpy(removed);
                                                                                     setValue("assignedTo", removed);

                                                                                     return;
                                                                                }

                                                                                handleUnAssign(member.id).then(() => {
                                                                                     setSelectedCpy((prev) =>
                                                                                          prev.filter(
                                                                                               (id) => id !== member.id,
                                                                                          ),
                                                                                     );
                                                                                });
                                                                           }}
                                                                           className="h-4 w-4 text-green-500"
                                                                      />
                                                                 ) : (
                                                                      <Plus
                                                                           onClick={() => {
                                                                                // Check if it is a member
                                                                                if (userRole == "teamMember") return;

                                                                                if (!isEditing && !task?.id) {
                                                                                     const previous = [...selectedCpy];

                                                                                     const appended = [
                                                                                          ...previous,
                                                                                          member.id,
                                                                                     ];
                                                                                     setSelectedCpy(appended);
                                                                                     setValue("assignedTo", appended);
                                                                                     return;
                                                                                }

                                                                                // Add or remove member from selected members
                                                                                handleAssign(member.id).then(() => {
                                                                                     setSelectedCpy((prev) => [
                                                                                          ...prev,
                                                                                          member.id,
                                                                                     ]);
                                                                                });
                                                                           }}
                                                                           className="h-4 w-4 text-gray-400"
                                                                      />
                                                                 )}
                                                            </div>
                                                       ))}
                                             </div>
                                        </div>
                                   </div>
                              )}

                              {/* Task Status */}
                              <div className="grid gap-2">
                                   <Label custom htmlFor="status" className="font-medium">
                                        Status
                                   </Label>
                                   {userRole === "teamMember" ? (
                                        <Badge custom variant={"outline"}>
                                             {status}
                                        </Badge>
                                   ) : (
                                        <Select
                                             disabled={userRole == "teamMember"}
                                             value={status}
                                             onValueChange={(value) => setValue("status", value as TaskStatusType)}
                                        >
                                             <SelectTrigger className="w-full" id="status">
                                                  <SelectValue placeholder="Select status" />
                                             </SelectTrigger>
                                             <SelectContent className="w-full">
                                                  <SelectItem value="pending">Pending</SelectItem>
                                                  <SelectItem value="completed">Completed</SelectItem>
                                                  <SelectItem value="pastDue">Past Due</SelectItem>
                                             </SelectContent>
                                        </Select>
                                   )}
                              </div>

                              {/* Task Priority */}
                              <div className="grid gap-2">
                                   <Label custom htmlFor="priority" className="font-medium">
                                        Priority
                                   </Label>
                                   {userRole === "teamMember" ? (
                                        <Badge custom variant={"outline"}>
                                             {priority}
                                        </Badge>
                                   ) : (
                                        <Select
                                             disabled={userRole == "teamMember"}
                                             value={priority}
                                             onValueChange={(value) => setValue("priority", value as TaskPriorityType)}
                                        >
                                             <SelectTrigger className="w-full" id="priority">
                                                  <SelectValue placeholder="Select priority" />
                                             </SelectTrigger>
                                             <SelectContent className="w-full">
                                                  <SelectItem value="low">Low</SelectItem>
                                                  <SelectItem value="medium">Medium</SelectItem>
                                                  <SelectItem value="high">High</SelectItem>
                                             </SelectContent>
                                        </Select>
                                   )}
                              </div>
                         </div>

                         <SheetFooter className="pt-4">
                              <Button
                                   hidden={userRole == "teamMember"}
                                   variant="outline"
                                   type="button"
                                   onClick={onClose}
                              >
                                   Cancel
                              </Button>
                              {userRole === "teamMember" ? (
                                   <Button variant={"primary"} onClick={onClose} type="button">
                                        OK
                                   </Button>
                              ) : (
                                   <Button variant={"primary"} type="submit">
                                        {isEditing ? "Update Task" : "Create Task"}
                                   </Button>
                              )}
                         </SheetFooter>
                    </form>
               </SheetContent>
          </Sheet>
     );
}
