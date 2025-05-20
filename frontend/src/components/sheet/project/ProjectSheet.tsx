import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Plus, X, Check } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { IProject } from "@/types/project.types";
import {
     useAddToProjectMutation,
     useCreateProjectMutation,
     useEditProjectMutation,
     useRemoveFromProjectMutation,
} from "@/api/projects.api";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ProjectSchema, ProjectSchemaType } from "@/schemas/project.schema";
import { getInitials } from "@/utils/basic";
import { useToast } from "@/components/Toast";
import { ITeamMember } from "@/types/team.types";
import { Loadable } from "@/components/state";

interface ProjectSheetProps {
     isOpen: boolean;
     onClose: () => void;
     project?: IProject;
     isEditing?: boolean;
     teamId: string;
     members: ITeamMember[];
     userRole: string;
}

export default function ProjectSheet({
     isOpen,
     onClose,
     project,
     isEditing = false,
     teamId,
     members,
     userRole,
}: ProjectSheetProps) {
     const { showToast } = useToast();

     const {
          register,
          formState: { errors },
          handleSubmit,
          reset,
          watch,
          setValue,
     } = useForm<ProjectSchemaType>({
          resolver: zodResolver(ProjectSchema),
     });
     const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

     useEffect(() => {
          if (isEditing && project) {
               setValue("description", project.description);
               setValue("name", project.name);
               setValue("status", project.status);
               setValue("teamId", project.teamId);
               setValue("members", project.members);

               setSelectedMembers(project.members || []);
          } else {
               reset();
               setValue("teamId", teamId);
               setSelectedMembers([]);
          }
     }, [project]);

     const name = watch("name") || undefined;
     const status = watch("status") || undefined;

     // Handle Create Project Mutation
     const [create, { isLoading: creating }] = useCreateProjectMutation();

     // Handle Edit Project Mutation
     const [edit, { isLoading: editting }] = useEditProjectMutation();

     const onSubmit = async (data: ProjectSchemaType) => {
          // Handle Editing
          if (isEditing) {
               try {
                    const response = await edit({
                         projectId: project?.id as string,
                         ...data,
                    }).unwrap();

                    showToast(response, "success");
               } catch (error: any) {
                    showToast(error?.data?.message, "error");
               } finally {
                    onClose();
               }
          } else {
               try {
                    const response = await create(data).unwrap();
                    showToast(response, "success");
               } catch (error: any) {
                    showToast(error?.data?.message || "Something went wrong!", "error");
               } finally {
                    onClose();
               }
          }
     };

     // Handle Add Member to Project Mutation
     const [addMember] = useAddToProjectMutation();

     const handleAssign = async (memberId: string) => {
          try {
               const msg = await addMember({ projectId: project?.id as string, members: [memberId] }).unwrap();
               showToast(msg, "success");
          } catch (error: any) {
               showToast(error?.data?.message || "Something went wrong!", "error");
               throw error;
          }
     };

     // Handle Remove Member from Project Mutation
     const [removeMember] = useRemoveFromProjectMutation();

     const handleUnAssign = async (memberId: string) => {
          try {
               const msg = await removeMember({ projectId: project?.id as string, memberId }).unwrap();
               showToast(msg, "success");
          } catch (error: any) {
               showToast(error?.data?.message || "Something went wrong!", "error");
               throw error;
          }
     };

     return (
          <Sheet open={isOpen} onOpenChange={onClose}>
               <SheetContent className="sm:max-w-md md:max-w-lg overflow-y-auto">
                    <form onSubmit={handleSubmit(onSubmit)}>
                         <SheetHeader>
                              <SheetTitle>
                                   {userRole == "teamMember"
                                        ? `${name}`
                                        : isEditing
                                        ? "Edit Project"
                                        : "Create New Project"}
                              </SheetTitle>
                              <SheetDescription>
                                   {userRole === "teamMember"
                                        ? "You can only view the project details."
                                        : isEditing
                                        ? "Edit the project details below."
                                        : "Create a new project for your team."}
                              </SheetDescription>
                         </SheetHeader>

                         <div className="grid gap-4 py-4 px-4">
                              {/* Project Name */}
                              <div className="grid gap-2">
                                   <Label custom htmlFor="name" className="font-medium">
                                        Project Name{" "}
                                        <span className="text-red-500" hidden={userRole === "teamMember"}>
                                             *
                                        </span>
                                   </Label>
                                   <Input
                                        id="name"
                                        disabled={userRole == "teamMember"}
                                        {...register("name")}
                                        placeholder="Enter task name"
                                        error={!!errors.name?.message}
                                   />
                                   {errors.name?.message && (
                                        <p className="text-sm text-red-500">{errors.name?.message}</p>
                                   )}
                              </div>

                              {/* Project Description */}
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
                                   />
                              </div>

                              {/* Project Status */}
                              {isEditing && (
                                   <div className="grid gap-2">
                                        <Label custom htmlFor="status" className="font-medium">
                                             Status
                                        </Label>
                                        {userRole === "teamMember" && !isEditing ? (
                                             <Badge custom variant="outline">
                                                  {status}
                                             </Badge>
                                        ) : (
                                             <Select
                                                  value={status}
                                                  onValueChange={(value) => setValue("status", value)}
                                                  disabled={userRole === "teamMember"}
                                             >
                                                  <SelectTrigger className="w-full" id="status">
                                                       <SelectValue placeholder="Select status" />
                                                  </SelectTrigger>
                                                  <SelectContent>
                                                       <SelectItem value="pending">Pending</SelectItem>
                                                       <SelectItem value="pastDue">Past Due</SelectItem>
                                                       <SelectItem value="completed">Completed</SelectItem>
                                                  </SelectContent>
                                             </Select>
                                        )}
                                   </div>
                              )}

                              {/* Team Members */}
                              {isEditing && (
                                   <div className="grid gap-2">
                                        <Label custom className="font-medium">
                                             Team Members{" "}
                                             <span className="text-red-500" hidden={userRole === "teamMember"}>
                                                  *
                                             </span>
                                        </Label>
                                        <div className="border rounded-md p-4">
                                             <div
                                                  className={cn(
                                                       "flex flex-wrap gap-2",
                                                       userRole !== "teamMember" && "mb-3",
                                                  )}
                                             >
                                                  {selectedMembers.length > 0 ? (
                                                       selectedMembers.map((memberId) => {
                                                            const member =
                                                                 Array.isArray(members) &&
                                                                 members.find((m) => m.id === memberId);
                                                            return (
                                                                 member && (
                                                                      <Badge
                                                                           key={member.id}
                                                                           variant="secondary"
                                                                           className="flex items-center gap-1 py-1 px-2"
                                                                      >
                                                                           <Avatar className="h-5 w-5">
                                                                                <AvatarImage
                                                                                     src={
                                                                                          member.avatar ||
                                                                                          "/placeholder.svg"
                                                                                     }
                                                                                     alt={member.name}
                                                                                />
                                                                                <AvatarFallback className="text-xs">
                                                                                     {getInitials(member.name)}
                                                                                </AvatarFallback>
                                                                           </Avatar>
                                                                           <span>{member.name}</span>
                                                                           <button
                                                                                hidden={userRole === "teamMember"}
                                                                                type="button"
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

                                             {userRole !== "teamMember" && (
                                                  <div className="space-y-2 max-h-40 overflow-y-auto">
                                                       {Array.isArray(members) &&
                                                            members.map((member) => (
                                                                 <div
                                                                      key={member.id}
                                                                      className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-md"
                                                                 >
                                                                      <div className="flex items-center">
                                                                           <Checkbox
                                                                                disabled={userRole === "teamMember"}
                                                                                checked={selectedMembers.includes(
                                                                                     member.id,
                                                                                )}
                                                                                onCheckedChange={() => {
                                                                                     if (!isEditing && !project?.id) {
                                                                                          const previous = [
                                                                                               ...selectedMembers,
                                                                                          ];

                                                                                          // If it already has the id, then remove it.
                                                                                          if (
                                                                                               previous.includes(
                                                                                                    member.id,
                                                                                               )
                                                                                          ) {
                                                                                               const removed =
                                                                                                    previous.filter(
                                                                                                         (mId) =>
                                                                                                              mId !=
                                                                                                              member.id,
                                                                                                    );
                                                                                               setSelectedMembers(
                                                                                                    removed,
                                                                                               );
                                                                                               setValue(
                                                                                                    "members",
                                                                                                    removed,
                                                                                               );
                                                                                               console.log(
                                                                                                    "Assigned To: ",
                                                                                               );
                                                                                          } else {
                                                                                               const appended = [
                                                                                                    ...previous,
                                                                                                    member.id,
                                                                                               ];
                                                                                               setValue(
                                                                                                    "members",
                                                                                                    appended,
                                                                                               );
                                                                                               setSelectedMembers(
                                                                                                    appended,
                                                                                               );
                                                                                          }

                                                                                          return;
                                                                                     }

                                                                                     // Add or remove member from selected members
                                                                                     const isSelected =
                                                                                          selectedMembers.includes(
                                                                                               member.id,
                                                                                          );
                                                                                     if (isSelected) {
                                                                                          handleUnAssign(
                                                                                               member.id,
                                                                                          ).then(() => {
                                                                                               setSelectedMembers(
                                                                                                    (prev) =>
                                                                                                         prev.filter(
                                                                                                              (id) =>
                                                                                                                   id !==
                                                                                                                   member.id,
                                                                                                         ),
                                                                                               );
                                                                                          });
                                                                                     } else {
                                                                                          handleAssign(member.id).then(
                                                                                               () => {
                                                                                                    setSelectedMembers(
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
                                                                                          member.avatar ||
                                                                                          "/placeholder.svg"
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
                                                                      {selectedMembers.includes(member.id) ? (
                                                                           <Check
                                                                                onClick={() => {
                                                                                     if (!isEditing && !project?.id) {
                                                                                          const previous = [
                                                                                               ...selectedMembers,
                                                                                          ];

                                                                                          // If it already has the id, then remove it.
                                                                                          const removed =
                                                                                               previous.filter(
                                                                                                    (mId) =>
                                                                                                         mId !=
                                                                                                         member.id,
                                                                                               );
                                                                                          setSelectedMembers(removed);
                                                                                          setValue("members", removed);

                                                                                          return;
                                                                                     }

                                                                                     handleUnAssign(member.id).then(
                                                                                          () => {
                                                                                               setSelectedMembers(
                                                                                                    (prev) =>
                                                                                                         prev.filter(
                                                                                                              (id) =>
                                                                                                                   id !==
                                                                                                                   member.id,
                                                                                                         ),
                                                                                               );
                                                                                          },
                                                                                     );
                                                                                }}
                                                                                className="h-4 w-4 text-green-500"
                                                                           />
                                                                      ) : (
                                                                           <Plus
                                                                                onClick={() => {
                                                                                     // Check if it is a member
                                                                                     if (userRole == "teamMember")
                                                                                          return;

                                                                                     if (!isEditing && !project?.id) {
                                                                                          const previous = [
                                                                                               ...selectedMembers,
                                                                                          ];

                                                                                          const appended = [
                                                                                               ...previous,
                                                                                               member.id,
                                                                                          ];
                                                                                          setSelectedMembers(appended);
                                                                                          setValue("members", appended);
                                                                                          return;
                                                                                     }

                                                                                     // Add or remove member from selected members
                                                                                     handleAssign(member.id).then(
                                                                                          () => {
                                                                                               setSelectedMembers(
                                                                                                    (prev) => [
                                                                                                         ...prev,
                                                                                                         member.id,
                                                                                                    ],
                                                                                               );
                                                                                          },
                                                                                     );
                                                                                }}
                                                                                className="h-4 w-4 text-gray-400"
                                                                           />
                                                                      )}
                                                                 </div>
                                                            ))}
                                                  </div>
                                             )}
                                        </div>
                                   </div>
                              )}
                         </div>

                         <SheetFooter className="pt-4">
                              <Button
                                   hidden={userRole === "teamMember"}
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
                                        <Loadable isLoading={creating || editting}>
                                             {isEditing ? "Update Project" : "Create Project"}
                                        </Loadable>
                                   </Button>
                              )}
                         </SheetFooter>
                    </form>
               </SheetContent>
          </Sheet>
     );
}
