import { Calendar, FileText, HardHat, HelpCircle, Home, LucideIcon, Mail, MessageSquare, UserPlus } from "lucide-react";

/*
    Sidebar 
*/
export type SidebarItem = {
     id: string;
     label: string;
     to: string[];
     icon: LucideIcon;
     onBoarding?: boolean;
     onClick?: () => void;
};

export const sidebar: SidebarItem[] = [
     {
          id: "dashboard",
          label: "Dashboard",
          to: ["/dashboard", "/dashboard/leader"],
          icon: Home,
     },
     {
          id: "tasks",
          label: "Tasks",
          to: ["/dashboard/tasks"],
          icon: FileText,
     },
     {
          id: "projects",
          label: "Projects",
          to: ["/dashboard/projects"],
          icon: HardHat,
     },
     {
          id: "calendar",
          label: "Calendar",
          to: ["/dashboard/calendar"],
          icon: Calendar,
     },
     // {
     //      id: "messages",
     //      label: "Messages",
     //      to: "/dashboard/messages",
     //      icon: MessageSquare,
     // },
];

export type OnboardingSidebarItem = {
     id: string;
     label: string;
     icon: LucideIcon;
     onClick?: () => void;
     to?: string;
};

export const onBoardingSidebar: OnboardingSidebarItem[] = [
     {
          id: "dashboard",
          label: "Dashboard",
          to: "/dashboard/onboarding",
          icon: Home,
     },
     // {
     //      id: "helpAndSupport",
     //      label: "Help and Suppport",
     //      onClick: () => null,
     //      icon: HelpCircle,
     // },
     // {
     //      id: "invitations",
     //      label: "Invitations",
     //      onClick: () => null,
     //      icon: Mail,
     // },
     // {
     //      id: "joinTeam",
     //      label: "Join Team",
     //      onClick: () => null,
     //      icon: UserPlus,
     // },
];
