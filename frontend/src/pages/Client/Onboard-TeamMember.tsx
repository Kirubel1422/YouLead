import { useFetchMyInvitationsQuery, useRespondMutation } from "@/api/invitations.api";
import { useJoinTeamMutation } from "@/api/team.api";
import Layout from "@/components/sidebar/layout";
import { Loadable } from "@/components/state";
import { useToast } from "@/components/Toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { setUserTeamState } from "@/store/auth/authSlice";
import { RootState } from "@/store/rootReducer";
import { setTeam } from "@/store/team/teamSlice";
import { timeDifference } from "@/utils/basic";
import { Separator } from "@radix-ui/react-separator";
import { AlertCircle, ArrowRight, CheckCircle, HelpCircle, MessageSquare } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";

// Mock getting started steps
const gettingStartedSteps = [
     {
          id: 1,
          title: "Complete your profile",
          description: "Add your skills, experience, and profile picture",
          completed: true,
     },
     {
          id: 2,
          title: "Join a team",
          description: "Enter a team ID or accept an invitation",
          completed: false,
     },
     {
          id: 3,
          title: "Explore the platform",
          description: "Learn about the features and tools available",
          completed: false,
     },
];

// Mock data for pending invitations
const pendingInvitations = [
     {
          id: 1,
          teamName: "Product Development",
          teamLeader: "Sarah Johnson",
          sentAt: "2 hours ago",
     },
     {
          id: 2,
          teamName: "Marketing Team",
          teamLeader: "Michael Chen",
          sentAt: "Yesterday",
     },
];

export default function OnboardingTeamMember() {
     const { user, hasTeam } = useSelector((state: RootState) => state.base.auth);

     const [teamIdInput, setTeamIdInput] = useState("");
     const [joinError, setJoinError] = useState<string | null>(null);
     const { showToast } = useToast();
     const navigate = useNavigate();
     const dispatch = useDispatch();

     const [join, { isLoading: joining }] = useJoinTeamMutation();

     const handleJoinTeam = async () => {
          // Validate
          if (!teamIdInput.trim()) {
               setJoinError("Please enter a team ID");
               return;
          }

          if (teamIdInput.length < 6) {
               setJoinError("Invalid team ID. Please check and try again.");
               return;
          }

          try {
               const { message, data } = await join({ teamId: teamIdInput }).unwrap();
               showToast(message, "success");
               dispatch(setTeam(data));
               dispatch(setUserTeamState({ hasTeam: true }));
               setTimeout(() => {
                    navigate("/dashboard");
               }, 1000);
          } catch (error: any) {
               showToast(error?.data?.message || "Something went wrong.", "error");
          } finally {
               setJoinError(null);
          }
     };

     const [respond, { isLoading: isResponding }] = useRespondMutation();

     const respondToInvitation = async (invitationId: string, response: "accepted" | "rejected") => {
          try {
               const result = await respond({ invitationId, response }).unwrap();
               showToast(result.message, "success");
               dispatch(
                    setUserTeamState({
                         hasTeam: true,
                    }),
               );
               setTimeout(() => {
                    navigate("/dashboard");
               }, 1000);
          } catch (error: any) {
               showToast(error.data.message, "error");
          }
     };

     // Fetch Invitations
     const { data: invitationsResp, isFetching: fetchingMyInvs } = useFetchMyInvitationsQuery({
          email: user != null ? user?.profile?.email : "",
     });

     useEffect(() => {
          if (hasTeam) {
               navigate("/dashboard");
          }
     }, []);

     return (
          <Layout>
               <div className="mb-6">
                    <h1 className="text-2xl font-bold">Welcome to You Lead, John!</h1>
                    <p className="text-gray-500">Let's get you started by joining a team.</p>
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                         {/* Join a Team Card */}
                         <Card>
                              <CardHeader>
                                   <CardTitle>Join a Team</CardTitle>
                                   <CardDescription>
                                        Enter a team ID provided by your team leader to join an existing team.
                                   </CardDescription>
                              </CardHeader>
                              <CardContent>
                                   <div className="space-y-4">
                                        <div className="space-y-2">
                                             <div className="flex">
                                                  <Input
                                                       placeholder="Enter team ID"
                                                       value={teamIdInput}
                                                       onChange={(e) => {
                                                            setTeamIdInput(e.target.value);
                                                            if (joinError) setJoinError(null);
                                                       }}
                                                       className={joinError ? "border-red-500" : ""}
                                                  />
                                                  <Button disabled={joining} className="ml-2" onClick={handleJoinTeam}>
                                                       <Loadable isLoading={joining}>Join</Loadable>
                                                  </Button>
                                             </div>
                                             {joinError && <p className="text-sm text-red-500">{joinError}</p>}
                                        </div>
                                        <Separator />
                                        <div className="text-sm text-gray-500">
                                             <p>Don't have a team ID?</p>
                                             <ul className="list-disc pl-5 mt-2 space-y-1">
                                                  <li>Ask your team leader for an invitation or team ID</li>
                                                  <li>Create your own team by upgrading to a Team Leader account</li>
                                                  <li>Check your email for pending invitations</li>
                                             </ul>
                                        </div>
                                   </div>
                              </CardContent>
                         </Card>

                         {/* Pending Invitations */}
                         {fetchingMyInvs
                              ? Array.from({ length: 3 }, (_, i) => (
                                     <Skeleton className="h-14 bg-gray-200 shadow-sm w-full" key={i} />
                                ))
                              : Array.isArray(invitationsResp?.data) &&
                                invitationsResp?.data.length > 0 && (
                                     <Card>
                                          <CardHeader>
                                               <CardTitle>Pending Invitations</CardTitle>
                                               <CardDescription>
                                                    You have {invitationsResp.total} pending team invitation
                                                    {pendingInvitations.length > 1 ? "s" : ""}.
                                               </CardDescription>
                                          </CardHeader>
                                          <CardContent>
                                               <div className="space-y-4">
                                                    {invitationsResp.data.map((invitation: any) => (
                                                         <div
                                                              key={invitation.id}
                                                              className="flex items-center justify-between border rounded-lg p-4"
                                                         >
                                                              <div>
                                                                   <h3 className="font-medium">
                                                                        {invitation?.team?.name}
                                                                   </h3>
                                                                   <p className="text-sm text-gray-500">
                                                                        Leader: {invitation?.team?.leader.name}
                                                                   </p>
                                                                   <p className="text-xs text-gray-400">
                                                                        Sent {timeDifference(invitation.updatedAt)}
                                                                   </p>
                                                              </div>
                                                              <div className="flex space-x-2">
                                                                   <Button
                                                                        size="sm"
                                                                        disabled={isResponding}
                                                                        onClick={() =>
                                                                             respondToInvitation(
                                                                                  invitation.id,
                                                                                  "accepted",
                                                                             )
                                                                        }
                                                                   >
                                                                        Accept
                                                                   </Button>
                                                                   <Button
                                                                        disabled={isResponding}
                                                                        onClick={() =>
                                                                             respondToInvitation(
                                                                                  invitation.id,
                                                                                  "rejected",
                                                                             )
                                                                        }
                                                                        size="sm"
                                                                        variant="outline"
                                                                   >
                                                                        Decline
                                                                   </Button>
                                                              </div>
                                                         </div>
                                                    ))}
                                               </div>
                                          </CardContent>
                                     </Card>
                                )}
                    </div>

                    {/* Right Sidebar */}
                    <div className="space-y-6">
                         {/* Getting Started */}
                         <Card>
                              <CardHeader className="pb-2">
                                   <CardTitle className="text-lg">Getting Started</CardTitle>
                              </CardHeader>
                              <CardContent>
                                   <div className="space-y-4">
                                        {gettingStartedSteps.map((step) => (
                                             <div key={step.id} className="flex">
                                                  <div
                                                       className={`h-6 w-6 rounded-full flex items-center justify-center mr-3 ${
                                                            step.completed
                                                                 ? "bg-green-100 text-green-500"
                                                                 : "bg-gray-100 text-gray-500"
                                                       }`}
                                                  >
                                                       {step.completed ? (
                                                            <CheckCircle className="h-4 w-4" />
                                                       ) : (
                                                            <span className="text-xs font-medium">{step.id}</span>
                                                       )}
                                                  </div>
                                                  <div className="flex-1">
                                                       <h4
                                                            className={`text-sm font-medium ${
                                                                 step.completed ? "text-gray-400" : ""
                                                            }`}
                                                       >
                                                            {step.title}
                                                       </h4>
                                                       <p className="text-xs text-gray-500">{step.description}</p>
                                                  </div>
                                             </div>
                                        ))}
                                   </div>
                              </CardContent>
                         </Card>

                         {/* Need Help? */}
                         <Card>
                              <CardHeader className="pb-2">
                                   <CardTitle className="text-lg">Need Help?</CardTitle>
                              </CardHeader>
                              <CardContent className="space-y-4">
                                   <div className="flex items-start">
                                        <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-500 mr-3">
                                             <HelpCircle className="h-5 w-5" />
                                        </div>
                                        <div>
                                             <h4 className="text-sm font-medium">View Documentation</h4>
                                             <p className="text-xs text-gray-500">
                                                  Learn how to use TeamPulse and all its features
                                             </p>
                                             <Button variant="link" size="sm" className="px-0 h-auto text-xs">
                                                  Read Docs <ArrowRight className="h-3 w-3 ml-1" />
                                             </Button>
                                        </div>
                                   </div>

                                   <div className="flex items-start">
                                        <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-500 mr-3">
                                             <MessageSquare className="h-5 w-5" />
                                        </div>
                                        <div>
                                             <h4 className="text-sm font-medium">Contact Support</h4>
                                             <p className="text-xs text-gray-500">
                                                  Get help from our support team for any issues
                                             </p>
                                             <Button variant="link" size="sm" className="px-0 h-auto text-xs">
                                                  Contact Us <ArrowRight className="h-3 w-3 ml-1" />
                                             </Button>
                                        </div>
                                   </div>
                              </CardContent>
                         </Card>

                         {/* Quick Tips */}
                         <Card>
                              <CardHeader className="pb-2">
                                   <CardTitle className="text-lg">Quick Tips</CardTitle>
                              </CardHeader>
                              <CardContent>
                                   <div className="space-y-3">
                                        <div className="flex items-start">
                                             <AlertCircle className="h-4 w-4 text-amber-500 mr-2 mt-0.5" />
                                             <p className="text-xs">
                                                  <span className="font-medium">Team ID format:</span> Team IDs are
                                                  typically 6-10 characters long and case-sensitive.
                                             </p>
                                        </div>
                                        <div className="flex items-start">
                                             <AlertCircle className="h-4 w-4 text-amber-500 mr-2 mt-0.5" />
                                             <p className="text-xs">
                                                  <span className="font-medium">Check your email:</span> Team
                                                  invitations are also sent via email.
                                             </p>
                                        </div>
                                        <div className="flex items-start">
                                             <AlertCircle className="h-4 w-4 text-amber-500 mr-2 mt-0.5" />
                                             <p className="text-xs">
                                                  <span className="font-medium">Complete your profile:</span> Teams are
                                                  more likely to accept members with complete profiles.
                                             </p>
                                        </div>
                                   </div>
                              </CardContent>
                         </Card>
                    </div>
               </div>
          </Layout>
     );
}
