import { useMarkTaskCompleteMutation } from "@/api/tasks.api";
import { Loadable } from "@/components/state";
import { useToast } from "@/components/Toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
     Dialog,
     DialogContent,
     DialogDescription,
     DialogFooter,
     DialogHeader,
     DialogTitle,
} from "@/components/ui/dialog";
import { RootState } from "@/store/rootReducer";
import { type IProject } from "@/types/project.types";
import { IUser } from "@/types/user.types";
import { formatDate, getStatusColor } from "@/utils/basic";
import { CheckCircle, Loader2 } from "lucide-react";
import { useSelector } from "react-redux";

interface ProjectDetailProps {
     open: boolean;
     setOpen: (state: boolean) => void;
     selectedProject: IProject | undefined;
}
export default function ProjectDetail({ open, setOpen, selectedProject }: ProjectDetailProps) {
     const { user } = useSelector((state: RootState) => state.base.auth);
     const { showToast } = useToast();

     if (!selectedProject) {
          return (
               <>
                    <span>Loading Task Detail ...</span>
                    <Loader2 className="animate-spin h-20 w-20 text-gray-500" />
               </>
          );
     }
     return (
          <Member showToast={showToast} user={user} open={open} setOpen={setOpen} selectedProject={selectedProject} />
     );
}

interface MemberDetailProps {
     open: boolean;
     setOpen: (state: boolean) => void;
     selectedProject: IProject;
     user: IUser;
     showToast: (message: string, type: "success" | "error") => void;
}

const Member = ({ open, user, setOpen, selectedProject, showToast }: MemberDetailProps) => {
     const [finish, { isLoading: markingComplete }] = useMarkTaskCompleteMutation();

     const markComplete = async () => {
          try {
               const resp = await finish(selectedProject.id).unwrap();
               showToast(resp, "success");
               setOpen(false);
          } catch (error: any) {
               showToast(error.data.message || "Something went wrong!", "error");
          }
     };
     return (
          <Dialog open={open} onOpenChange={setOpen}>
               {selectedProject && (
                    <DialogContent>
                         <DialogHeader>
                              <DialogTitle className="flex items-center gap-2">
                                   <span>{selectedProject.name}</span>
                                   <Badge className={getStatusColor(selectedProject.status)}>
                                        {selectedProject.status}
                                   </Badge>
                              </DialogTitle>
                              <DialogDescription>
                                   Project: {selectedProject.name} • Due{" "}
                                   {formatDate(
                                        Array.isArray(selectedProject.deadline) ? selectedProject.deadline[0] : "-",
                                   )}
                              </DialogDescription>
                         </DialogHeader>

                         <div className="space-y-4">
                              {/* Project Description */}
                              <div className="space-y-2">
                                   <h4 className="text-sm font-medium">Description</h4>
                                   <p className="text-sm text-gray-600">{selectedProject.description ?? "N/A"}</p>
                              </div>
                         </div>

                         <DialogFooter className="flex gap-2 sm:justify-between">
                              <div className="flex items-center gap-2">
                                   <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
                                        Close
                                   </Button>
                                   <Button hidden={user.role === "teamMember"} variant="outline" size="sm">
                                        Edit Project
                                   </Button>
                              </div>
                              {selectedProject.status !== "completed" && (
                                   <Button
                                        variant="default"
                                        size="sm"
                                        onClick={markComplete}
                                        className="bg-green-600 hover:bg-green-700"
                                   >
                                        <Loadable isLoading={markingComplete}>
                                             {!markingComplete && <CheckCircle className="mr-2 h-4 w-4" />}
                                             Mark Complete
                                        </Loadable>
                                   </Button>
                              )}
                         </DialogFooter>
                    </DialogContent>
               )}
          </Dialog>
     );
};
