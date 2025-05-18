import { useMarkTaskCompleteMutation, useUpdateProgressMutation } from "@/api/tasks.api";
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
import { Slider } from "@/components/ui/slider";
import { logout } from "@/store/auth/authSlice";
import { RootState } from "@/store/rootReducer";
import { type ITaskDetail } from "@/types/task.types";
import { getPriorityColor, getStatusColor, formatDate } from "@/utils/basic";
import { CheckCircle, Loader2 } from "lucide-react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

interface TaskDetailProps {
     open: boolean;
     setOpen: (state: boolean) => void;
     selectedTask: ITaskDetail | undefined;
}

export default function TaskDetail({ open, setOpen, selectedTask }: TaskDetailProps) {
     const dispatch = useDispatch();
     const { user } = useSelector((state: RootState) => state.base.auth);
     if (user == null) {
          dispatch(logout());
          return;
     }

     if (!selectedTask) {
          return (
               <>
                    <span>Loading Task Detail ...</span>
                    <Loader2 className="animate-spin h-20 w-20 text-gray-500" />
               </>
          );
     }
     const { showToast } = useToast();

     const [progressValue, setProgressValue] = useState<number>(selectedTask.progress);

     // Mark as complete
     const [markComplete, { isLoading: markingAsComplete }] = useMarkTaskCompleteMutation();

     // Update Progress
     const [updateProgress, { isLoading: isSavingProgress }] = useUpdateProgressMutation();

     const updateTaskProgress = async () => {
          try {
               const resp = await updateProgress({
                    progress: progressValue,
                    taskId: selectedTask.id as string,
               }).unwrap();
               showToast(resp, "success");
               setOpen(false);
          } catch (error: any) {
               showToast(error.data.message, "error");
               setProgressValue(selectedTask.progress);
          }
     };

     const markTaskAsComplete = async () => {
          try {
               const resp = await markComplete(selectedTask.id as string).unwrap();
               setOpen(false);
               showToast(resp, "success");
          } catch (error: any) {
               showToast(error.data.message, "error");
          }
     };

     return (
          <Dialog open={open} onOpenChange={setOpen}>
               {selectedTask && (
                    <DialogContent className="sm:max-w-[600px]">
                         <DialogHeader>
                              <DialogTitle className="flex items-center gap-2">
                                   <span>{selectedTask.name}</span>
                                   <Badge className={getStatusColor(selectedTask.status)}>{selectedTask.status}</Badge>
                                   <Badge className={getPriorityColor(selectedTask.priority)}>
                                        {selectedTask.priority}
                                   </Badge>
                              </DialogTitle>
                              <DialogDescription>
                                   Project: {selectedTask.projectName} • Due{" "}
                                   {formatDate(
                                        Array.isArray(selectedTask.deadline) && selectedTask.deadline.length > 0
                                             ? selectedTask.deadline[0]
                                             : "-",
                                   )}
                              </DialogDescription>
                         </DialogHeader>

                         <div className="space-y-4">
                              {/* Task Description */}
                              <div className="space-y-2">
                                   <h4 className="text-sm font-medium">Description</h4>
                                   <p className="text-sm text-gray-600">{selectedTask.description ?? "N/A"}</p>
                              </div>

                              {/* Task Progress Slider */}
                              <div className="space-y-4">
                                   <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                             <h4 className="text-sm font-medium">Update Progress</h4>
                                             <span className="text-sm font-medium">{progressValue}%</span>
                                        </div>
                                        <Slider
                                             defaultValue={[selectedTask.progress]}
                                             value={[progressValue as number]}
                                             onValueChange={(value) => setProgressValue(value[0])}
                                             max={100}
                                             step={5}
                                             min={0}
                                             className="py-4"
                                        />
                                        <div className="flex justify-between text-xs text-gray-500">
                                             <span>0%</span>
                                             <span>25%</span>
                                             <span>50%</span>
                                             <span>75%</span>
                                             <span>100%</span>
                                        </div>
                                   </div>

                                   <div className="flex justify-end">
                                        <Button
                                             variant="outline"
                                             size="sm"
                                             onClick={updateTaskProgress}
                                             disabled={isSavingProgress || selectedTask.status === "completed"}
                                        >
                                             <Loadable isLoading={isSavingProgress}>Save Progress</Loadable>
                                        </Button>
                                   </div>
                              </div>
                         </div>

                         <DialogFooter className="flex gap-2 sm:justify-between">
                              <div className="flex items-center gap-2">
                                   <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
                                        Close
                                   </Button>
                              </div>
                              {selectedTask.status !== "completed" && (
                                   <Button
                                        variant="default"
                                        size="sm"
                                        onClick={markTaskAsComplete}
                                        className="bg-green-600 hover:bg-green-700"
                                   >
                                        <Loadable isLoading={markingAsComplete}>
                                             {!markingAsComplete && <CheckCircle className="mr-2 h-4 w-4" />}
                                             Mark Complete
                                        </Loadable>
                                   </Button>
                              )}
                         </DialogFooter>
                    </DialogContent>
               )}
          </Dialog>
     );
}
