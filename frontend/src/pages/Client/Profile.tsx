"use client";

import type React from "react";

import { useState } from "react";
import {
     Mail,
     Phone,
     Calendar,
     Edit,
     CheckCircle,
     Clock,
     AlertTriangle,
     Lock,
     Eye,
     EyeOff,
     Save,
     X,
     Users,
     ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
     Dialog,
     DialogContent,
     DialogDescription,
     DialogFooter,
     DialogHeader,
     DialogTitle,
     DialogTrigger,
} from "@/components/ui/dialog";
import {
     DropdownMenu,
     DropdownMenuContent,
     DropdownMenuItem,
     DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Layout from "@/components/sidebar/layout";
import { getInitials, getRoleLabel } from "@/utils/basic";
import { useSelector } from "react-redux";
import { RootState } from "@/store/rootReducer";

interface IProfile {
     firstName: string;
     lastName?: string;
     email: string;
     phoneNumber?: string;
     profilePicture?: string;
     password?: string;
}

// Mock team data
const mockTeam = {
     id: "team789",
     name: "Product Development",
     leader: {
          name: "Sarah Johnson",
          email: "sarah.johnson@example.com",
          profilePicture: "/placeholder.svg?height=32&width=32",
     },
     members: 6,
     projects: 3,
};

export default function Profile() {
     const { user } = useSelector((state: RootState) => state.base.auth);

     const [isEditingProfile, setIsEditingProfile] = useState(false);
     const [editedProfile, setEditedProfile] = useState<IProfile>(user);

     // Password change state
     const [currentPassword, setCurrentPassword] = useState("");
     const [newPassword, setNewPassword] = useState("");
     const [confirmPassword, setConfirmPassword] = useState("");
     const [showCurrentPassword, setShowCurrentPassword] = useState(false);
     const [showNewPassword, setShowNewPassword] = useState(false);
     const [showConfirmPassword, setShowConfirmPassword] = useState(false);
     const [passwordError, setPasswordError] = useState<string | null>(null);

     const formatDate = (dateString: string) => {
          const date = new Date(dateString);
          return new Intl.DateTimeFormat("en-US", {
               year: "numeric",
               month: "long",
               day: "numeric",
               hour: "2-digit",
               minute: "2-digit",
          }).format(date);
     };

     const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          const { name, value } = e.target;
          setEditedProfile((prev: IProfile) => ({
               ...prev,
               [name]: value,
          }));
     };

     const handleCancelEdit = () => {
          setEditedProfile(user.profile);
          setIsEditingProfile(false);
     };

     const handlePasswordChange = () => {
          // Reset error
          setPasswordError(null);

          // Validate passwords
          if (!currentPassword) {
               setPasswordError("Current password is required");
               return;
          }

          if (!newPassword) {
               setPasswordError("New password is required");
               return;
          }

          if (newPassword.length < 8) {
               setPasswordError("Password must be at least 8 characters");
               return;
          }

          if (newPassword !== confirmPassword) {
               setPasswordError("Passwords do not match");
               return;
          }

          // Check if new password is one of the previous passwords
          if (user.previousPasswords?.includes(newPassword)) {
               setPasswordError("Cannot reuse a previous password");
               return;
          }

          // Update password (in a real app, this would call an API)
          // const updatedPreviousPasswords = [...(user.previousPasswords || []), currentPassword];

          // Reset form
          setCurrentPassword("");
          setNewPassword("");
          setConfirmPassword("");

          // Show success message (in a real app, you'd use a toast)
          alert("Password changed successfully");
     };

     const calculateTaskCompletion = () => {
          if (!user.taskStatus) return 0;
          const { completed, pending, pastDue } = user.taskStatus;
          const total = completed + pending + pastDue;
          return total > 0 ? Math.round((completed / total) * 100) : 0;
     };

     const calculateProjectCompletion = () => {
          if (!user.projectStatus) return 0;
          const { completed, inProgress, notStarted } = user.projectStatus;
          const total = completed + inProgress + notStarted;
          return total > 0 ? Math.round((completed / total) * 100) : 0;
     };

     return (
          <Layout>
               <div className="mb-6">
                    <h1 className="text-2xl font-bold">User Profile</h1>
                    <p className="text-gray-500">View and manage your profile information</p>
               </div>

               {/* Profile Header */}
               <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex flex-col md:flex-row items-center md:items-start">
                         <div className="mb-4 md:mb-0 md:mr-6">
                              <Avatar className="h-24 w-24">
                                   <AvatarImage src={user.profile.profilePicture} alt={user.profile.firstName} />
                                   <AvatarFallback className="text-lg">
                                        {getInitials(user.profile.firstName, user.profile.lastName)}
                                   </AvatarFallback>
                              </Avatar>
                         </div>

                         <div className="flex-1 text-center md:text-left">
                              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                                   <div>
                                        <h2 className="text-xl font-bold">
                                             {user.profile.firstName} {user.profile.lastName}
                                        </h2>
                                        <p className="text-gray-500">{user.profile.email}</p>
                                   </div>

                                   <div className="mt-3 md:mt-0 flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-2">
                                        <Badge
                                             className={
                                                  user.accountStatus === "active"
                                                       ? "bg-green-100 text-green-800"
                                                       : "bg-red-100 text-red-800"
                                             }
                                        >
                                             {user.accountStatus === "active" ? "Active" : "Inactive"}
                                        </Badge>
                                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                             {getRoleLabel(user.role)}
                                        </Badge>
                                   </div>
                              </div>

                              <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-4">
                                   <div className="flex items-center text-gray-500 text-sm">
                                        <Mail className="h-4 w-4 mr-1" />
                                        {user.profile.email}
                                   </div>
                                   {user.profile.phoneNumber && (
                                        <div className="flex items-center text-gray-500 text-sm">
                                             <Phone className="h-4 w-4 mr-1" />
                                             {user.profile.phoneNumber}
                                        </div>
                                   )}
                                   <div className="flex items-center text-gray-500 text-sm">
                                        <Calendar className="h-4 w-4 mr-1" />
                                        Member since {new Date(user.createdAt).toLocaleDateString()}
                                   </div>
                              </div>
                         </div>
                    </div>
               </div>

               {/* Tabs */}
               <Tabs defaultValue="profile" className="space-y-4">
                    <TabsList>
                         <TabsTrigger value="profile">Profile</TabsTrigger>
                         <TabsTrigger value="account">Account</TabsTrigger>
                         <TabsTrigger value="tasks">Tasks & Projects</TabsTrigger>
                         <TabsTrigger value="security">Security</TabsTrigger>
                    </TabsList>

                    {/* Profile Tab */}
                    <TabsContent value="profile">
                         <Card>
                              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                   <div>
                                        <CardTitle>Profile Information</CardTitle>
                                        <CardDescription>Manage your personal information</CardDescription>
                                   </div>
                                   {!isEditingProfile ? (
                                        <Button variant="outline" size="sm" onClick={() => setIsEditingProfile(true)}>
                                             <Edit className="h-4 w-4 mr-2" />
                                             Edit Profile
                                        </Button>
                                   ) : (
                                        <div className="flex space-x-2">
                                             <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                                                  <X className="h-4 w-4 mr-2" />
                                                  Cancel
                                             </Button>
                                             <Button size="sm" onClick={() => null}>
                                                  <Save className="h-4 w-4 mr-2" />
                                                  Save
                                             </Button>
                                        </div>
                                   )}
                              </CardHeader>
                              <CardContent>
                                   {isEditingProfile ? (
                                        <div className="space-y-4">
                                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                  <div className="space-y-2">
                                                       <Label htmlFor="firstName">First Name</Label>
                                                       <Input
                                                            id="firstName"
                                                            name="firstName"
                                                            value={editedProfile.firstName}
                                                            onChange={handleProfileChange}
                                                       />
                                                  </div>
                                                  <div className="space-y-2">
                                                       <Label htmlFor="lastName">Last Name</Label>
                                                       <Input
                                                            id="lastName"
                                                            name="lastName"
                                                            value={editedProfile.lastName || ""}
                                                            onChange={handleProfileChange}
                                                       />
                                                  </div>
                                             </div>
                                             <div className="space-y-2">
                                                  <Label htmlFor="email">Email</Label>
                                                  <Input
                                                       id="email"
                                                       name="email"
                                                       type="email"
                                                       value={editedProfile.email}
                                                       onChange={handleProfileChange}
                                                  />
                                             </div>
                                             <div className="space-y-2">
                                                  <Label htmlFor="phoneNumber">Phone Number</Label>
                                                  <Input
                                                       id="phoneNumber"
                                                       name="phoneNumber"
                                                       value={editedProfile.phoneNumber || ""}
                                                       onChange={handleProfileChange}
                                                  />
                                             </div>
                                             <div className="space-y-2">
                                                  <Label htmlFor="profilePicture">Profile Picture URL</Label>
                                                  <Input
                                                       id="profilePicture"
                                                       name="profilePicture"
                                                       value={editedProfile.profilePicture || ""}
                                                       onChange={handleProfileChange}
                                                  />
                                             </div>
                                        </div>
                                   ) : (
                                        <div className="space-y-4">
                                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                  <div>
                                                       <h3 className="text-sm font-medium text-gray-500">First Name</h3>
                                                       <p>{user.profile.firstName}</p>
                                                  </div>
                                                  <div>
                                                       <h3 className="text-sm font-medium text-gray-500">Last Name</h3>
                                                       <p>{user.profile.lastName || "—"}</p>
                                                  </div>
                                             </div>
                                             <div>
                                                  <h3 className="text-sm font-medium text-gray-500">Email</h3>
                                                  <p>{user.profile.email}</p>
                                             </div>
                                             <div>
                                                  <h3 className="text-sm font-medium text-gray-500">Phone Number</h3>
                                                  <p>{user.profile.phoneNumber || "—"}</p>
                                             </div>
                                        </div>
                                   )}
                              </CardContent>
                         </Card>

                         {user.teamId && (
                              <Card className="mt-4">
                                   <CardHeader>
                                        <CardTitle>Team Information</CardTitle>
                                        <CardDescription>Your current team details</CardDescription>
                                   </CardHeader>
                                   <CardContent>
                                        <div className="space-y-4">
                                             <div>
                                                  <h3 className="text-sm font-medium text-gray-500">Team Name</h3>
                                                  <p className="flex items-center">
                                                       <Users className="h-4 w-4 mr-2 text-primary" />
                                                       {mockTeam.name}
                                                  </p>
                                             </div>
                                             <div>
                                                  <h3 className="text-sm font-medium text-gray-500">Team Leader</h3>
                                                  <div className="flex items-center mt-1">
                                                       <Avatar className="h-6 w-6 mr-2">
                                                            <AvatarImage
                                                                 src={mockTeam.leader.profilePicture}
                                                                 alt={mockTeam.leader.name}
                                                            />
                                                            <AvatarFallback>SJ</AvatarFallback>
                                                       </Avatar>
                                                       <span>{mockTeam.leader.name}</span>
                                                  </div>
                                             </div>
                                             <div className="grid grid-cols-2 gap-4">
                                                  <div>
                                                       <h3 className="text-sm font-medium text-gray-500">
                                                            Team Members
                                                       </h3>
                                                       <p>{mockTeam.members}</p>
                                                  </div>
                                                  <div>
                                                       <h3 className="text-sm font-medium text-gray-500">
                                                            Active Projects
                                                       </h3>
                                                       <p>{mockTeam.projects}</p>
                                                  </div>
                                             </div>
                                        </div>
                                   </CardContent>
                                   <CardFooter>
                                        <Button variant="outline" className="w-full">
                                             View Team Details
                                             <ChevronRight className="h-4 w-4 ml-2" />
                                        </Button>
                                   </CardFooter>
                              </Card>
                         )}
                    </TabsContent>

                    {/* Account Tab */}
                    <TabsContent value="account">
                         <Card>
                              <CardHeader>
                                   <CardTitle>Account Information</CardTitle>
                                   <CardDescription>Details about your account</CardDescription>
                              </CardHeader>
                              <CardContent className="space-y-4">
                                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                             <h3 className="text-sm font-medium text-gray-500">User ID</h3>
                                             <p className="font-mono text-sm">{user.uid}</p>
                                        </div>
                                        <div>
                                             <h3 className="text-sm font-medium text-gray-500">Role</h3>
                                             <Badge variant="outline">{getRoleLabel(user.role)}</Badge>
                                        </div>
                                   </div>

                                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                             <h3 className="text-sm font-medium text-gray-500">Account Status</h3>
                                             <Badge
                                                  className={
                                                       user.accountStatus === "active"
                                                            ? "bg-green-100 text-green-800"
                                                            : "bg-red-100 text-red-800"
                                                  }
                                             >
                                                  {user.accountStatus === "active" ? "Active" : "Inactive"}
                                             </Badge>
                                        </div>
                                        {user.teamId && (
                                             <div>
                                                  <h3 className="text-sm font-medium text-gray-500">Team ID</h3>
                                                  <p className="font-mono text-sm">{user.teamId}</p>
                                             </div>
                                        )}
                                   </div>

                                   <Separator />

                                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                             <h3 className="text-sm font-medium text-gray-500">Created At</h3>
                                             <p>{formatDate(user.createdAt)}</p>
                                        </div>
                                        <div>
                                             <h3 className="text-sm font-medium text-gray-500">Last Updated</h3>
                                             <p>{formatDate(user.updatedAt)}</p>
                                        </div>
                                   </div>
                              </CardContent>
                         </Card>
                    </TabsContent>

                    {/* Tasks Tab */}
                    <TabsContent value="tasks">
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* Task Statistics */}
                              {user.taskStatus && (
                                   <Card>
                                        <CardHeader>
                                             <CardTitle>Task Statistics</CardTitle>
                                             <CardDescription>Overview of your tasks</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                             <div>
                                                  <div className="flex justify-between mb-1">
                                                       <span className="text-sm font-medium">Task Completion</span>
                                                       <span className="text-sm font-medium">
                                                            {calculateTaskCompletion()}%
                                                       </span>
                                                  </div>
                                                  <Progress value={calculateTaskCompletion()} className="h-2" />
                                             </div>

                                             <div className="grid grid-cols-3 gap-4 mt-4">
                                                  <div className="bg-green-50 rounded-lg p-3 text-center">
                                                       <div className="flex justify-center mb-1">
                                                            <CheckCircle className="h-5 w-5 text-green-500" />
                                                       </div>
                                                       <p className="text-xl font-bold text-green-700">
                                                            {user.taskStatus.completed}
                                                       </p>
                                                       <p className="text-xs text-green-600">Completed</p>
                                                  </div>

                                                  <div className="bg-blue-50 rounded-lg p-3 text-center">
                                                       <div className="flex justify-center mb-1">
                                                            <Clock className="h-5 w-5 text-blue-500" />
                                                       </div>
                                                       <p className="text-xl font-bold text-blue-700">
                                                            {user.taskStatus.pending}
                                                       </p>
                                                       <p className="text-xs text-blue-600">Pending</p>
                                                  </div>

                                                  <div className="bg-red-50 rounded-lg p-3 text-center">
                                                       <div className="flex justify-center mb-1">
                                                            <AlertTriangle className="h-5 w-5 text-red-500" />
                                                       </div>
                                                       <p className="text-xl font-bold text-red-700">
                                                            {user.taskStatus.pastDue}
                                                       </p>
                                                       <p className="text-xs text-red-600">Past Due</p>
                                                  </div>
                                             </div>

                                             <div className="text-xs text-gray-500 mt-2">
                                                  Last updated: {formatDate(user.taskStatus.updatedAt)}
                                             </div>
                                        </CardContent>
                                        <CardFooter>
                                             <Button variant="outline" className="w-full">
                                                  View All Tasks
                                             </Button>
                                        </CardFooter>
                                   </Card>
                              )}

                              {/* Project Statistics */}
                              {user.projectStatus && (
                                   <Card>
                                        <CardHeader>
                                             <CardTitle>Project Statistics</CardTitle>
                                             <CardDescription>Overview of your projects</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                             <div>
                                                  <div className="flex justify-between mb-1">
                                                       <span className="text-sm font-medium">Project Completion</span>
                                                       <span className="text-sm font-medium">
                                                            {calculateProjectCompletion()}%
                                                       </span>
                                                  </div>
                                                  <Progress value={calculateProjectCompletion()} className="h-2" />
                                             </div>

                                             <div className="grid grid-cols-3 gap-4 mt-4">
                                                  <div className="bg-green-50 rounded-lg p-3 text-center">
                                                       <div className="flex justify-center mb-1">
                                                            <CheckCircle className="h-5 w-5 text-green-500" />
                                                       </div>
                                                       <p className="text-xl font-bold text-green-700">
                                                            {user.projectStatus.completed}
                                                       </p>
                                                       <p className="text-xs text-green-600">Completed</p>
                                                  </div>

                                                  <div className="bg-blue-50 rounded-lg p-3 text-center">
                                                       <div className="flex justify-center mb-1">
                                                            <Clock className="h-5 w-5 text-blue-500" />
                                                       </div>
                                                       <p className="text-xl font-bold text-blue-700">
                                                            {user.projectStatus.inProgress}
                                                       </p>
                                                       <p className="text-xs text-blue-600">In Progress</p>
                                                  </div>

                                                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                                                       <div className="flex justify-center mb-1">
                                                            <Clock className="h-5 w-5 text-gray-500" />
                                                       </div>
                                                       <p className="text-xl font-bold text-gray-700">
                                                            {user.projectStatus.notStarted}
                                                       </p>
                                                       <p className="text-xs text-gray-600">Not Started</p>
                                                  </div>
                                             </div>

                                             <div className="text-xs text-gray-500 mt-2">
                                                  Last updated: {formatDate(user.projectStatus.updatedAt)}
                                             </div>
                                        </CardContent>
                                        <CardFooter>
                                             <Button variant="outline" className="w-full">
                                                  View All Projects
                                             </Button>
                                        </CardFooter>
                                   </Card>
                              )}
                         </div>
                    </TabsContent>

                    {/* Security Tab */}
                    <TabsContent value="security">
                         <Card>
                              <CardHeader>
                                   <CardTitle>Security Settings</CardTitle>
                                   <CardDescription>Manage your password and security preferences</CardDescription>
                              </CardHeader>
                              <CardContent className="space-y-6">
                                   <div>
                                        <h3 className="text-base font-medium mb-2">Change Password</h3>
                                        <div className="space-y-4">
                                             <div className="space-y-2">
                                                  <Label htmlFor="currentPassword">Current Password</Label>
                                                  <div className="relative">
                                                       <Input
                                                            id="currentPassword"
                                                            type={showCurrentPassword ? "text" : "password"}
                                                            value={currentPassword}
                                                            onChange={(e) => setCurrentPassword(e.target.value)}
                                                       />
                                                       <button
                                                            type="button"
                                                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-500"
                                                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                                       >
                                                            {showCurrentPassword ? (
                                                                 <EyeOff className="h-5 w-5" />
                                                            ) : (
                                                                 <Eye className="h-5 w-5" />
                                                            )}
                                                       </button>
                                                  </div>
                                             </div>

                                             <div className="space-y-2">
                                                  <Label htmlFor="newPassword">New Password</Label>
                                                  <div className="relative">
                                                       <Input
                                                            id="newPassword"
                                                            type={showNewPassword ? "text" : "password"}
                                                            value={newPassword}
                                                            onChange={(e) => setNewPassword(e.target.value)}
                                                       />
                                                       <button
                                                            type="button"
                                                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-500"
                                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                                       >
                                                            {showNewPassword ? (
                                                                 <EyeOff className="h-5 w-5" />
                                                            ) : (
                                                                 <Eye className="h-5 w-5" />
                                                            )}
                                                       </button>
                                                  </div>
                                             </div>

                                             <div className="space-y-2">
                                                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                                                  <div className="relative">
                                                       <Input
                                                            id="confirmPassword"
                                                            type={showConfirmPassword ? "text" : "password"}
                                                            value={confirmPassword}
                                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                                       />
                                                       <button
                                                            type="button"
                                                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-500"
                                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                       >
                                                            {showConfirmPassword ? (
                                                                 <EyeOff className="h-5 w-5" />
                                                            ) : (
                                                                 <Eye className="h-5 w-5" />
                                                            )}
                                                       </button>
                                                  </div>
                                             </div>

                                             {passwordError && (
                                                  <div className="text-sm text-red-500">{passwordError}</div>
                                             )}

                                             <Button onClick={handlePasswordChange}>
                                                  <Lock className="h-4 w-4 mr-2" />
                                                  Change Password
                                             </Button>
                                        </div>
                                   </div>

                                   <Separator />

                                   <div>
                                        <h3 className="text-base font-medium mb-2">Account Security</h3>
                                        <div className="space-y-4">
                                             <div className="flex items-center justify-between">
                                                  <div>
                                                       <p className="font-medium">Two-Factor Authentication</p>
                                                       <p className="text-sm text-gray-500">
                                                            Add an extra layer of security to your account
                                                       </p>
                                                  </div>
                                                  <Dialog>
                                                       <DialogTrigger asChild>
                                                            <Button variant="outline">Setup</Button>
                                                       </DialogTrigger>
                                                       <DialogContent>
                                                            <DialogHeader>
                                                                 <DialogTitle>Two-Factor Authentication</DialogTitle>
                                                                 <DialogDescription>
                                                                      Protect your account with two-factor
                                                                      authentication.
                                                                 </DialogDescription>
                                                            </DialogHeader>
                                                            <div className="py-4">
                                                                 <p>
                                                                      This feature is not yet implemented in this demo.
                                                                 </p>
                                                            </div>
                                                            <DialogFooter>
                                                                 <Button variant="outline">Cancel</Button>
                                                                 <Button>Continue</Button>
                                                            </DialogFooter>
                                                       </DialogContent>
                                                  </Dialog>
                                             </div>

                                             <div className="flex items-center justify-between">
                                                  <div>
                                                       <p className="font-medium">Session Management</p>
                                                       <p className="text-sm text-gray-500">
                                                            Manage your active sessions
                                                       </p>
                                                  </div>
                                                  <DropdownMenu>
                                                       <DropdownMenuTrigger asChild>
                                                            <Button variant="outline">Manage</Button>
                                                       </DropdownMenuTrigger>
                                                       <DropdownMenuContent>
                                                            <DropdownMenuItem>View Active Sessions</DropdownMenuItem>
                                                            <DropdownMenuItem className="text-red-500">
                                                                 Sign Out All Devices
                                                            </DropdownMenuItem>
                                                       </DropdownMenuContent>
                                                  </DropdownMenu>
                                             </div>

                                             <div className="flex items-center justify-between">
                                                  <div>
                                                       <p className="font-medium">Password History</p>
                                                       <p className="text-sm text-gray-500">
                                                            Number of previous passwords stored
                                                       </p>
                                                  </div>
                                                  <Badge variant="outline">{user.previousPasswords?.length || 0}</Badge>
                                             </div>
                                        </div>
                                   </div>

                                   <Separator />

                                   <div>
                                        <h3 className="text-base font-medium mb-2">Account Activity</h3>
                                        <div className="space-y-2">
                                             <div className="flex justify-between items-center">
                                                  <p className="text-sm">Last password change</p>
                                                  <p className="text-sm">{formatDate(user.updatedAt)}</p>
                                             </div>
                                             <div className="flex justify-between items-center">
                                                  <p className="text-sm">Last login</p>
                                                  <p className="text-sm">Today, 9:42 AM</p>
                                             </div>
                                        </div>
                                   </div>
                              </CardContent>
                         </Card>
                    </TabsContent>
               </Tabs>
          </Layout>
     );
}
