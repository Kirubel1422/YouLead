import React from "react";
import { SidebarProvider, SidebarTrigger } from "../ui/sidebar";
import AppSidebar from "./AppSidebar";
import { DashboardHeader } from "./dashboard-header";

type Props = {
     children: React.ReactNode;
};

export default function Layout({ children }: Props) {
     return (
          <SidebarProvider className="bg-gray-50">
               <AppSidebar />

               <main className="flex w-full">
                    <SidebarTrigger className="absolute" />

                    <div className="w-full">
                         <DashboardHeader />

                         <div className="lg:px-5 md:px-4 px-0  w-full py-3">{children}</div>
                    </div>
               </main>
          </SidebarProvider>
     );
}
