import { useState } from "react";
import Layout from "@/components/sidebar/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Send, Phone, Video, MoreVertical, Menu, Cat, Construction } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { chatBg } from "@/assets";
import { Badge } from "@/components/ui/badge";
import { mockContacts, mockMessages } from "@/constants/mock/Messages/contact";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSelector } from "react-redux";
import { RootState } from "@/store/rootReducer";
import { IProject } from "@/types/project.types";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface Message {
     id: string;
     content: string;
     sender: {
          id: string;
          name: string;
          avatar?: string;
     };
     timestamp: string;
     isMe: boolean;
}

interface Contact {
     id: string;
     name: string;
     avatar?: string;
     lastMessage?: string;
     lastMessageTime?: string;
     unreadCount?: number;
     isOnline: boolean;
}

type Category = "DM" | "Projects" | "Tasks";

export default function Messages() {
     const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
     const [messageInput, setMessageInput] = useState("");
     const [searchQuery, setSearchQuery] = useState("");
     const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

     // Selected Project
     const [activeProj, setActiveProj] = useState<string>("");

     // Cached projects
     const { projects } = useSelector((state: RootState) => state.base.projects);

     // For Category Selection
     const [activeTab, setActiveTab] = useState<Category>("DM");

     const filteredContacts = mockContacts.filter((contact) =>
          contact.name.toLowerCase().includes(searchQuery.toLowerCase()),
     );

     const handleSendMessage = () => {
          if (messageInput.trim()) {
               // Add logic to send message
               setMessageInput("");
          }
     };

     const ContactsList = () => (
          <div className="space-y-2 p-4">
               {filteredContacts.map((contact) => (
                    <div
                         key={contact.id}
                         className={cn(
                              "flex items-center space-x-4 p-3 rounded-lg cursor-pointer transition-colors",
                              "hover:bg-slate-100 dark:hover:bg-slate-800",
                              selectedContact?.id === contact.id && "bg-slate-100 dark:bg-slate-800",
                         )}
                         onClick={() => {
                              setSelectedContact(contact);
                              setIsMobileMenuOpen(false);
                         }}
                    >
                         <div className="relative">
                              <Avatar className="border-2 border-slate-200 dark:border-slate-700">
                                   <AvatarImage src={contact.avatar} />
                                   <AvatarFallback className="bg-slate-300 dark:bg-slate-600">
                                        {contact.name.slice(0, 2)}
                                   </AvatarFallback>
                              </Avatar>
                              {contact.isOnline && (
                                   <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-slate-900"></span>
                              )}
                         </div>
                         <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start">
                                   <h4 className="text-sm font-medium truncate text-slate-900 dark:text-slate-100">
                                        {contact.name}
                                   </h4>
                                   {contact.lastMessageTime && (
                                        <span className="text-xs text-slate-500 dark:text-slate-400">
                                             {contact.lastMessageTime}
                                        </span>
                                   )}
                              </div>
                              {contact.lastMessage && (
                                   <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                                        {contact.lastMessage}
                                   </p>
                              )}
                         </div>
                         {contact.unreadCount && contact.unreadCount > 0 && (
                              <Badge
                                   variant="outline"
                                   className="bg-slate-600 dark:bg-slate-800 text-slate-50 dark:text-slate-400"
                              >
                                   {contact.unreadCount}
                              </Badge>
                         )}
                    </div>
               ))}
          </div>
     );

     return (
          <Layout>
               <main className="flex gap-4 h-full w-full bg-slate-50 dark:bg-slate-900">
                    {/* Mobile Menu Button */}
                    <div className="lg:hidden absolute top-4 left-4 z-20">
                         <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                              <SheetTrigger asChild>
                                   <Button variant="outline" size="icon" className="bg-white dark:bg-slate-800">
                                        <Menu className="h-4 w-4" />
                                   </Button>
                              </SheetTrigger>
                              <SheetContent side="left" className="w-80 p-0">
                                   <div className="h-full flex flex-col bg-white dark:bg-slate-900">
                                        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                                             <div className="relative">
                                                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
                                                  <Input
                                                       placeholder="Search messages..."
                                                       className="pl-8 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                                                       value={searchQuery}
                                                       onChange={(e) => setSearchQuery(e.target.value)}
                                                  />
                                             </div>
                                        </div>
                                        <ScrollArea className="flex-1">
                                             <ContactsList />
                                        </ScrollArea>
                                   </div>
                              </SheetContent>
                         </Sheet>
                    </div>

                    {/* Desktop Sidebar */}
                    <Card className="hidden lg:block border-0 border-r border-slate-200 dark:border-slate-800 h-[calc(100vh-4rem)] bg-white dark:bg-slate-900">
                         <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                              <div className="relative">
                                   <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
                                   <Input
                                        placeholder="Search messages..."
                                        className="pl-8 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                   />
                              </div>
                         </div>
                         <ScrollArea className="h-[calc(100vh-8rem)]">
                              <ContactsList />
                         </ScrollArea>
                    </Card>

                    {/* Chat Area */}
                    {/* Category Section  */}
                    <div className="flex-1 flex flex-col  dark:bg-slate-900">
                         <CategorySelection setActiveTab={setActiveTab} />

                         {activeTab === "Projects" && (
                              <div className="flex items-center bg-white border-b py-2 pl-4 pr-2 dark:bg-slate-900 dark:border-slate-800">
                                   {projects.length > 0 && (
                                        <ToggleGroup
                                             onValueChange={(value) => setActiveProj(value)}
                                             defaultValue={projects[0].name}
                                             type="single"
                                        >
                                             {projects.map((project: IProject) => (
                                                  <ToggleGroupItem
                                                       key={project.name}
                                                       value={project.name}
                                                       aria-label="Toggle italic"
                                                  >
                                                       {project.name}
                                                  </ToggleGroupItem>
                                             ))}
                                        </ToggleGroup>
                                   )}
                              </div>
                         )}

                         <div className=" h-[calc(100vh-20rem)]">
                              {activeTab === "Projects" && projects.length > 0 && (
                                   <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900">
                                        <div className="flex items-center space-x-4">
                                             <Construction className="text-gray-600" />
                                             <h3 className="font-medium text-slate-900 dark:text-slate-100">
                                                  {activeProj}
                                             </h3>
                                        </div>
                                   </div>
                              )}

                              {selectedContact ? (
                                   <>
                                        <div
                                             hidden={activeTab == "Projects"}
                                             className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900"
                                        >
                                             <div className="flex items-center space-x-4">
                                                  <Avatar className="border-2 border-slate-200 dark:border-slate-700">
                                                       <AvatarImage src={selectedContact.avatar} />
                                                       <AvatarFallback className="bg-slate-300 dark:bg-slate-600">
                                                            {selectedContact.name.slice(0, 2)}
                                                       </AvatarFallback>
                                                  </Avatar>
                                                  <div>
                                                       <h3 className="font-medium text-slate-900 dark:text-slate-100">
                                                            {selectedContact.name}
                                                       </h3>
                                                       {selectedContact.isOnline && (
                                                            <span className="text-sm text-green-500">Online</span>
                                                       )}
                                                  </div>
                                             </div>
                                        </div>

                                        <div
                                             className=" bg-cover bg-center h-full"
                                             style={{
                                                  backgroundImage: `url(${chatBg})`,
                                             }}
                                        >
                                             <ScrollArea className={`flex-1 p-4 backdrop-blur-xs h-full`}>
                                                  <div className="space-y-4">
                                                       {/* Use Fetched Messages Here !  */}
                                                       {mockMessages.map((message) => (
                                                            <div
                                                                 key={message.id}
                                                                 className={cn(
                                                                      "flex",
                                                                      message.isMe ? "justify-end" : "justify-start",
                                                                 )}
                                                            >
                                                                 <div
                                                                      className={cn(
                                                                           "max-w-[70%] rounded-lg p-3",
                                                                           message.isMe
                                                                                ? "bg-slate-600 text-white dark:bg-slate-700"
                                                                                : "bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-sm",
                                                                      )}
                                                                 >
                                                                      <p className="text-sm">{message.content}</p>
                                                                      <span className="text-xs opacity-70 mt-1 block">
                                                                           {message.timestamp}
                                                                      </span>
                                                                 </div>
                                                            </div>
                                                       ))}
                                                  </div>
                                             </ScrollArea>
                                        </div>

                                        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                                             <div className="flex items-center space-x-2">
                                                  <Input
                                                       placeholder="Type a message..."
                                                       className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                                                       value={messageInput}
                                                       onChange={(e) => setMessageInput(e.target.value)}
                                                       onKeyPress={(e) => {
                                                            if (e.key === "Enter") {
                                                                 handleSendMessage();
                                                            }
                                                       }}
                                                  />
                                                  <Button
                                                       onClick={handleSendMessage}
                                                       className="bg-slate-600 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600"
                                                  >
                                                       <Send className="h-4 w-4" />
                                                  </Button>
                                             </div>
                                        </div>
                                   </>
                              ) : (
                                   <div className="flex-1 h-full flex items-center justify-center bg-slate-50 dark:bg-slate-900">
                                        <p className="text-slate-500 dark:text-slate-400">
                                             Select a conversation to start messaging
                                        </p>
                                   </div>
                              )}
                         </div>
                    </div>
               </main>
          </Layout>
     );
}

interface CategorySelectionProps {
     setActiveTab: (tab: Category) => void;
}

const CategorySelection = ({ setActiveTab }: CategorySelectionProps) => {
     return (
          <Tabs
               defaultValue="dm"
               onValueChange={(val) => {
                    setActiveTab(val as Category);
               }}
               className="w-full"
          >
               <TabsList className="flex items-center w-full">
                    <TabsTrigger value="DM">DM</TabsTrigger>
                    <TabsTrigger value="Projects">Projects</TabsTrigger>
                    {/* Based on Task Next Version  */}
               </TabsList>
          </Tabs>
     );
};
