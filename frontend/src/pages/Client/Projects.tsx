import Layout from "@/components/sidebar/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Calendar } from "lucide-react";
import { useEffect, useState } from "react";
import { formatDate, getStatusColor } from "@/utils/basic";
import { IProject, ProjectFilter, ProjectStatusTypes } from "@/types/project.types";
import { useFetchMyProjectsQuery, useHandleDeadlineMutation } from "@/api/projects.api";
import { useSelector } from "react-redux";
import { RootState } from "@/store/rootReducer";
import ProjectDetail from "@/components/modal/project/ProjectDetail";
import { Skeleton } from "@/components/ui/skeleton";
import ProjectSheet from "@/components/sheet/project/ProjectSheet";
import { useGetTeamMembersQuery } from "@/api/team.api";
import { ITeamMember } from "@/types/team.types";
import { useToast } from "@/components/Toast";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Loadable } from "@/components/state";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";
import ProjectFallBack from "@/components/fallbacks/project/project";

export default function Projects() {
     const { user, hasTeam } = useSelector((state: RootState) => state.base.auth);
     const [searchQuery, setSearchQuery] = useState("");
     const [selectedPro, setSelectedPro] = useState<IProject | undefined>(undefined);
     const [proDetail, setProDetail] = useState(false);
     const [projectSheetOpen, setProjectSheetOpen] = useState<boolean>(false);
     const [isEditting, setIsEditting] = useState<boolean>(false);
     const [deadlineModOpen, setDeadlineModOpen] = useState<boolean>(false);
     const [deadlineData, setDeadlineData] = useState<{ projectData: Partial<IProject>; index: number | null }>({
          projectData: {} as Partial<IProject>,
          index: null,
     });
     const [projectFilter, setProjectFilter] = useState<ProjectFilter>("all");
     const { data, isFetching } = useFetchMyProjectsQuery(
          {
               page: 1,
               teamId: user?.teamId || "",
          },
          {
               skip: !hasTeam,
          },
     );

     // Fetch all team members
     const { data: members } = useGetTeamMembersQuery(user.teamId as string);

     const filteredProjects = data?.projects.filter((project: Partial<IProject>) =>
          project.name?.toLowerCase().includes(searchQuery.toLowerCase()) &&
          project.description?.toLowerCase().includes(searchQuery.toLowerCase()) &&
          projectFilter === "all"
               ? true
               : project.status === projectFilter,
     );

     // For filter toggle
     useEffect(() => {
          if (projectFilter == "") {
               setProjectFilter("all");
          }
     }, [projectFilter]);

     return (
          <Layout>
               <main className="flex-1 space-y-4 p-8 pt-6">
                    <div className="flex items-center justify-between space-y-2">
                         <h2 className="text-3xl font-bold tracking-tight">Projects</h2>
                         <div hidden={user.role === "teamMember"} className="flex items-center space-x-2">
                              <Button
                                   onClick={() => {
                                        setIsEditting(false);
                                        setSelectedPro(undefined);
                                        setProjectSheetOpen(true);
                                   }}
                                   variant={"primary"}
                              >
                                   <Plus className="mr-2 h-4 w-4" />
                                   New Project
                              </Button>
                         </div>
                    </div>

                    <div className="flex justify-between items-center md:flex-nowrap flex-wrap md:gap-0 gap-4">
                         <div className="flex gap-4">
                              <Card className="md:w-[200px] w-[150px]">
                                   <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm text-neutral-500 font-medium">
                                             Total Projects
                                        </CardTitle>
                                   </CardHeader>
                                   <CardContent>
                                        <div className="text-2xl font-bold text-gray-500">{data?.projects.length}</div>
                                   </CardContent>
                              </Card>
                              <Card className="md:w-[200px] w-[150px]">
                                   <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm text-neutral-500 font-medium">
                                             Active Projects
                                        </CardTitle>
                                   </CardHeader>
                                   <CardContent>
                                        <div className="text-2xl font-bold text-green-400">
                                             {data?.projects.filter((p) => p.status === "pending").length}
                                        </div>
                                   </CardContent>
                              </Card>
                         </div>

                         <div className="relative">
                              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                              <Input
                                   placeholder="Search projects..."
                                   className="pl-8 w-[300px] bg-white"
                                   value={searchQuery}
                                   onChange={(e) => setSearchQuery(e.target.value)}
                              />
                         </div>
                    </div>

                    <div className="grid gap-4">
                         <div className="flex justify-between">
                              <ToggleGroup
                                   value={projectFilter}
                                   onValueChange={(val) => setProjectFilter(val as ProjectFilter)}
                                   type="single"
                              >
                                   <ToggleGroupItem
                                        className={cn(projectFilter === "all" && "!bg-[#4f46e5] !text-white")}
                                        variant={"outline"}
                                        value="all"
                                        aria-label="Toggle all"
                                   >
                                        All Projects
                                   </ToggleGroupItem>
                                   <ToggleGroupItem
                                        className={cn(projectFilter === "pastDue" && "!bg-[#4f46e5] !text-white")}
                                        variant={"outline"}
                                        value="pastDue"
                                        aria-label="Toggle pastDue"
                                   >
                                        Past Due
                                   </ToggleGroupItem>
                                   <ToggleGroupItem
                                        className={cn(projectFilter === "pending" && "!bg-[#4f46e5] !text-white")}
                                        variant={"outline"}
                                        value="pending"
                                        aria-label="Toggle pending"
                                   >
                                        Pending
                                   </ToggleGroupItem>
                                   <ToggleGroupItem
                                        className={cn(projectFilter === "completed" && "!bg-[#4f46e5] !text-white")}
                                        variant={"outline"}
                                        value="completed"
                                        aria-label="Toggle completed"
                                   >
                                        Completed
                                   </ToggleGroupItem>
                              </ToggleGroup>
                         </div>

                         {isFetching &&
                              Array(5)
                                   .fill(0)
                                   .map((_, index) => (
                                        <Skeleton key={index} className="h-24 w-full bg-gray-200 rounded-md" />
                                   ))}

                         {!isFetching &&
                              filteredProjects?.map((project, index) => (
                                   <Card
                                        key={project.id}
                                        onClick={(event) => {
                                             // If extend button is clicked
                                             const elm = document.querySelector("#extend-" + index);
                                             if (event.target === elm) {
                                                  // Clicked directly on elm (not a child)
                                                  setDeadlineData({
                                                       projectData: project,
                                                       index,
                                                  });

                                                  setDeadlineModOpen(true);
                                                  return;
                                             }

                                             setSelectedPro(project as IProject);
                                             setProjectSheetOpen(true);
                                             setIsEditting(true);
                                        }}
                                        className="overflow-hidden cursor-pointer hover:border-primary/50 transition-colors"
                                   >
                                        <CardContent className="p-6">
                                             <div className="flex flex-col space-y-4">
                                                  <div className="flex items-center justify-between">
                                                       <div>
                                                            <h3 className="text-lg font-semibold">{project.name}</h3>
                                                            <p className="text-sm text-gray-500">
                                                                 {project.description || "No description set"}
                                                            </p>
                                                       </div>

                                                       <Badge
                                                            className={getStatusColor(
                                                                 project.status as ProjectStatusTypes,
                                                            )}
                                                       >
                                                            {project.status}
                                                       </Badge>
                                                  </div>

                                                  <div className="flex justify-between text-sm text-gray-500">
                                                       <div className="flex items-center gap-2">
                                                            <Calendar className="h-4 w-4" />
                                                            {project.deadline != undefined ? (
                                                                 <span>
                                                                      Due{" "}
                                                                      {formatDate(
                                                                           Array.isArray(project.deadline) &&
                                                                                project.deadline.length > 0
                                                                                ? project.deadline[
                                                                                       project.deadline.length - 1
                                                                                  ]
                                                                                : "",
                                                                      )}
                                                                 </span>
                                                            ) : (
                                                                 <span>No deadline</span>
                                                            )}
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
                                        </CardContent>
                                   </Card>
                              ))}

                         {filteredProjects?.length === 0 && <ProjectFallBack />}
                    </div>

                    {proDetail && (
                         <ProjectDetail open={proDetail} setOpen={setProDetail} selectedProject={selectedPro} />
                    )}

                    <ProjectSheet
                         isOpen={projectSheetOpen}
                         onClose={() => setProjectSheetOpen(false)}
                         project={selectedPro}
                         isEditing={isEditting}
                         teamId={user.teamId as string}
                         members={
                              members?.map((member) => ({
                                   avatar: member.avatar,
                                   email: member.email,
                                   id: member.id,
                                   name: member.name,
                                   role: member.role,
                              })) as ITeamMember[]
                         }
                         userRole={user.role}
                    />

                    {deadlineModOpen && (
                         <ProjectDeadline
                              open={deadlineModOpen}
                              setOpen={setDeadlineModOpen}
                              currentDeadlines={deadlineData.projectData.deadline}
                              projectId={deadlineData.projectData?.id as string}
                         />
                    )}
               </main>
          </Layout>
     );
}

interface ProjectDeadlineProps {
     open: boolean;
     setOpen: (val: boolean) => void;
     currentDeadlines?: string[];
     projectId: string;
}

const ProjectDeadline = ({ open, setOpen, currentDeadlines, projectId }: ProjectDeadlineProps) => {
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
               const msg = await adjust({ projectId, deadline: new Date(value).toISOString() }).unwrap();
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
