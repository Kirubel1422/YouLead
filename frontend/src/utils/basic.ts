import { ProjectStatusTypes } from "@/types/project.types";
import { TaskPriorityType, TaskStatus, TaskStatusType } from "@/types/task.types";
import { UserRole } from "@/types/user.types";
import { format, formatDistance, isSameDay, isToday, isValid, parseISO, subDays } from "date-fns";

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

export const formatChatTime = (dateString: string): string => {
     if (!dateString) return "";

     const date = parseISO(dateString);
     if (!isValid(date)) return dateString;

     const today = new Date();

     if (isToday(date)) {
          return format(date, "h:mm a");
     }

     if (isSameDay(date, subDays(today, 1))) {
          return `Yesterday ${format(date, "h:mm a")}`;
     }

     return format(date, "dd/MM/yyyy h:mm a");
};

export const getStatusColor = (status: ProjectStatusTypes) => {
     switch (status) {
          case "completed":
               return "bg-green-100 text-green-800";
          case "pending":
               return "bg-blue-100 text-blue-800";
          case "pastDue":
               return "bg-red-500 text-red-50";
          default:
               return "bg-gray-100 text-gray-800";
     }
};

export const isOverdue = (dateString: string) => {
     const today = new Date();
     const dueDate = new Date(dateString);
     return dueDate < today;
};

export const formatDate = (dateString: string) => {
     const date = new Date(dateString);
     try {
          return new Intl.DateTimeFormat("en-US", {
               month: "short",
               day: "numeric",
               year: "numeric",
          }).format(date);
     } catch (error) {
          if (!isValid(dateString)) {
               return "-";
          }
     }
};

export const statusLabel = (priority: TaskStatusType) => {
     switch (priority) {
          case "completed":
               return "Completed";
          case "pastDue":
               return "Past Due";
          case "pending":
               return "Pending";
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

export const aiResponseToHTML = (text: string) => {
     // Convert markdown-style headers to HTML
     let html = text
          .replace(/^# (.*$)/gm, "<h1>$1</h1>")
          .replace(/^## (.*$)/gm, "<h2>$1</h2>")
          .replace(/^### (.*$)/gm, "<h3>$1</h3>")
          .replace(/^#### (.*$)/gm, "<h4>$1</h4>");

     // Convert lists
     html = html
          .replace(/^\* (.*$)/gm, "<li>$1</li>")
          .replace(/(<li>.*<\/li>)+/g, "<ul>$&</ul>")
          .replace(/^\d+\. (.*$)/gm, "<li>$1</li>")
          .replace(/(<li>.*<\/li>)+/g, "<ol>$&</ol>");

     // Convert tables (basic markdown tables)
     html = html.replace(/(\|.+\|.+\|[\r\n]+)((?:\|.+\|.+\|[\r\n]+)+)/g, (match, header, body) => {
          const headers = header.split("|").filter((c: any) => c.trim());
          const rows = body.split("\n").filter((r: any) => r.trim());

          let table = '<table class="ai-table"><thead><tr>';
          headers.forEach((h: any) => {
               table += `<th>${h.trim()}</th>`;
          });
          table += "</tr></thead><tbody>";

          rows.forEach((row: any) => {
               const cells = row.split("|").filter((c: string) => c.trim());
               table += "<tr>";
               cells.forEach((c: string) => {
                    table += `<td>${c.trim()}</td>`;
               });
               table += "</tr>";
          });

          return table + "</tbody></table>";
     });

     // Convert line breaks to paragraphs when between empty lines
     html = html.replace(/\n\n/g, "</p><p>").replace(/\n/g, "<br>");

     // Wrap the whole content if it's not already wrapped
     if (!html.startsWith("<")) {
          html = `<div class="ai-response">${html}</div>`;
     }

     return html;
};

export const exists = (user: any): boolean => {
     if (!user) return false;
     return Object.keys(user).length > 0;
};

export const getBackgroundColor = (value: number = 0) => {
     // Clamp value to [0, 100]
     value = Math.max(0, Math.min(100, value));
     // 0 = red (hue 0), 50 = yellow (hue 60), 100 = green (hue 120)
     // Interpolate hue from 0 to 120
     const hue = value * 1.2; // 0 to 120
     return `hsl(${hue}, 90%, 50%)`;
};
