import { UserRole } from "@/types/user.types";
import { formatDistance } from "date-fns";

export const take = (data: Array<any>, amount: number): Array<any> => {
     if (data.length == 0) {
          return [];
     } else if (data.length > amount) {
          return data.slice(0, amount);
     } else {
          return data;
     }
};

export const getRoleLabel = (role: UserRole) => {
     switch (role) {
          case "teamMember":
               return "Team Member";
          case "teamLeader":
               return "Team Leader";
          case "admin":
               return "Admin";
     }
};

export const getStatusColor = (status: string) => {
     switch (status) {
          case "Completed":
               return "bg-green-100 text-green-800";
          case "In Progress":
               return "bg-blue-100 text-blue-800";
          case "To Do":
               return "bg-gray-100 text-gray-800";
          case "In Review":
               return "bg-purple-100 text-purple-800";
          default:
               return "bg-gray-100 text-gray-800";
     }
};

export const getPriorityColor = (priority: string) => {
     switch (priority) {
          case "high":
               return "text-red-500 bg-red-50";
          case "medium":
               return "text-orange-500 bg-orange-50";
          case "low":
               return "text-green-500 bg-green-50";
          default:
               return "text-gray-500 bg-gray-50";
     }
};

export const getInitials = (firstName: string, lastName?: string) => {
     const firstInitial = firstName.charAt(0);
     const lastInitial = lastName ? lastName.charAt(0) : "";
     return `${firstInitial}${lastInitial}`.toUpperCase();
};

export const getDaysRemaining = (dateString: string) => {
     const today = new Date();
     today.setHours(0, 0, 0, 0);
     const dueDate = new Date(dateString);
     dueDate.setHours(0, 0, 0, 0);

     const diffTime = dueDate.getTime() - today.getTime();
     const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

     return diffDays;
};

export const timeDifference = (dateString: string) => {
     return formatDistance(dateString, new Date(), {
          includeSeconds: true,
          addSuffix: true,
     });
};
