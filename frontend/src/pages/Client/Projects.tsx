import Layout from "@/components/sidebar/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Calendar } from "lucide-react";
import { useState } from "react";
import { formatDate, getStatusColor } from "@/utils/basic";
import { IProject } from "@/types/project.types";
import { useFetchMyProjectsQuery } from "@/api/projects.api";
import { useSelector } from "react-redux";
import { RootState } from "@/store/rootReducer";
import ProjectDetail from "@/components/modal/project/ProjectDetail";
import { Skeleton } from "@/components/ui/skeleton";

export default function Projects() {
     const { user, hasTeam } = useSelector((state: RootState) => state.base.auth);
     const [searchQuery, setSearchQuery] = useState("");
     const [selectedPro, setSelectedPro] = useState<IProject | undefined>(undefined);
     const [proDetail, setProDetail] = useState(false);

     const { data, isFetching } = useFetchMyProjectsQuery(
          {
               page: 1,
               limit: 3,
               teamId: user?.teamId || "",
          },
          {
               skip: !hasTeam,
          },
     );
     const filteredProjects = data?.projects.filter(
          (project: IProject) =>
               project.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
               project.description?.toLowerCase().includes(searchQuery.toLowerCase()),
     );

     return (
          <Layout>
               <main className="flex-1 space-y-4 p-8 pt-6">
                    <div className="flex items-center justify-between space-y-2">
                         <h2 className="text-3xl font-bold tracking-tight">Projects</h2>
                         <div hidden={user.role === "teamMember"} className="flex items-center space-x-2">
                              <Button>
                                   <Plus className="mr-2 h-4 w-4" />
                                   New Project
                              </Button>
                         </div>
                    </div>

                    <div className="flex justify-between items-center">
                         <div className="flex gap-4">
                              <Card className="w-[200px]">
                                   <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
                                   </CardHeader>
                                   <CardContent>
                                        <div className="text-2xl font-bold">{data?.projects.length}</div>
                                   </CardContent>
                              </Card>
                              <Card className="w-[200px]">
                                   <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
                                   </CardHeader>
                                   <CardContent>
                                        <div className="text-2xl font-bold">
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
                         {isFetching &&
                              Array(5)
                                   .fill(0)
                                   .map((_, index) => (
                                        <Skeleton key={index} className="h-24 w-full bg-gray-200 rounded-md" />
                                   ))}

                         {filteredProjects?.map((project) => (
                              <Card
                                   key={project.id}
                                   onClick={() => {
                                        setSelectedPro(project);
                                        setProDetail(true);
                                   }}
                                   className="overflow-hidden cursor-pointer hover:border-primary/50 transition-colors"
                              >
                                   <CardContent className="p-6">
                                        <div className="flex flex-col space-y-4">
                                             <div className="flex items-center justify-between">
                                                  <div>
                                                       <h3 className="text-lg font-semibold">{project.name}</h3>
                                                       <p className="text-sm text-gray-500">{project.description}</p>
                                                  </div>
                                                  <Badge className={getStatusColor(project.status)}>
                                                       {project.status}
                                                  </Badge>
                                             </div>

                                             <div className="flex justify-between text-sm text-gray-500">
                                                  <div className="flex items-center gap-2">
                                                       <Calendar className="h-4 w-4" />
                                                       {project.deadline != undefined ? (
                                                            <span>Due {formatDate(project.deadline[0])}</span>
                                                       ) : (
                                                            <span>No deadline</span>
                                                       )}
                                                  </div>
                                             </div>
                                        </div>
                                   </CardContent>
                              </Card>
                         ))}
                    </div>

                    {proDetail && (
                         <ProjectDetail open={proDetail} setOpen={setProDetail} selectedProject={selectedPro} />
                    )}
               </main>
          </Layout>
     );
}
