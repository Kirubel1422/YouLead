import type React from "react";

import { useState, useRef, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Search, Send, MessageSquare, Paperclip, MoreHorizontal, ClipboardList, Briefcase } from "lucide-react";
import {
     DropdownMenu,
     DropdownMenuContent,
     DropdownMenuItem,
     DropdownMenuSeparator,
     DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Layout from "@/components/sidebar/layout";
import { useGetTeamMembersQuery } from "@/api/team.api";
import { useSelector } from "react-redux";
import { RootState } from "@/store/rootReducer";
import { ITeamMember } from "@/types/team.types";
import { formatChatTime, getInitials } from "@/utils/basic";
import { Skeleton } from "@/components/ui/skeleton";
import { socket } from "@/services/socket";
import { useFetchDMMessagesQuery } from "@/api/messages.api";
import { IChat, IChatUser, IMessage, OnlineStatus } from "@/types/messages.types";
import { useLocation } from "react-router";

const intersectionObserverOption = {
     root: document.querySelector("#messages-container"),
     rootMargin: "0px",
     threshold: 0.25,
};

export const ChatInterface = () => {
     // Redux
     const { user } = useSelector((state: RootState) => state.base.auth);

     const location = useLocation();

     // Intersection Observer
     const containerRef = useRef(null);
     const [messages, setMessages] = useState<IMessage[]>([] as IMessage[]);

     const callbackFunction = (entries: IntersectionObserverEntry[]) => {
          const [entry] = entries;

          if (entry.isIntersecting) {
               const lastMessage = messages[messages.length - 1];
               const dt = {
                    createdAt: lastMessage.updatedAt,
                    receivedBy: lastMessage.receivedBy,
                    sentBy: lastMessage.sentBy,
               };

               console.log("Ready to be read: ", !lastMessage.isRead && lastMessage?.sentBy != user.uid);
               console.log(lastMessage);
               if (!lastMessage.isRead && lastMessage?.sentBy != user.uid) socket.emit("readLastMsg", dt);
          }
     };

     useEffect(() => {
          const observer = new IntersectionObserver(callbackFunction, intersectionObserverOption);
          if (containerRef.current) observer.observe(containerRef.current);

          return () => {
               if (containerRef.current) observer.unobserve(containerRef.current);
          };
     }, [messages.length]);

     useEffect(() => {
          const handleReadAck = (data: { success: boolean }) => {
               console.log(data);
          };
          socket.on("readAck", handleReadAck);

          return () => {
               socket.off("readAck", handleReadAck); // Cleanup
          };
     }, []);

     const [activeTab, setActiveTab] = useState<"dm" | "projects" | "tasks">("dm");

     const [selectedChat, setSelectedChat] = useState<IChat | null>();

     const [newMessage, setNewMessage] = useState("");
     const [searchQuery, setSearchQuery] = useState("");

     const messagesEndRef = useRef<HTMLDivElement>(null);

     // Fetch DM list
     const {
          data: dmData,
          isSuccess: fetchDmSuccess,
          refetch: refetchDMs,
     } = useFetchDMMessagesQuery(undefined, {
          refetchOnFocus: true,
          refetchOnReconnect: true,
     });
     const [dmMessages, setDmMessages] = useState<IChat[]>([] as IChat[]);

     // Use useRef to keep the latest value of dmMessages
     const dmMessagesRef = useRef<IChat[]>([]);

     useEffect(() => {
          dmMessagesRef.current = [...dmMessages];
          // Apply changes to messages list
          const userId = selectedChat?.userId;
          const match = dmMessagesRef?.current.find((msg) => msg.userId == userId);

          setMessages((prev) => (Array.isArray(match?.msgs) ? match.msgs : prev));
     }, [dmMessages]);

     // Save fetched messages to local state
     useEffect(() => {
          if (fetchDmSuccess) {
               setDmMessages(dmData as IChat[]);
          }
     }, [fetchDmSuccess, dmData, location.pathname]);

     // Filtered DM list
     const filteredDms = Array.isArray(dmMessages)
          ? dmMessages.filter((dm) => {
                 const userMatch = dm.userData?.name?.toLowerCase().includes(searchQuery.toLowerCase());
                 const messageMatch = dm.msgs.some((msg) =>
                      msg.msgContent.toLowerCase().includes(searchQuery.toLowerCase()),
                 );
                 return userMatch || messageMatch;
            })
          : [];

     // User make itself accessible for upcoming socket events
     useEffect(() => {
          // When online
          const handleActive = () => {
               socket.emit("online", user.uid);
          };

          handleActive();

          // Setup socket
          socket.emit("setup", user.uid);
     }, [socket]);

     useEffect(() => {
          const handleReceive = ({ msg: msgData, senderData }: { msg: IMessage; senderData: IChatUser }) => {
               const senderId = msgData.sentBy;
               setDmMessages((prev) => {
                    const chatIndex = prev.findIndex((chat) => chat.userId === senderId);
                    if (chatIndex !== -1) {
                         // Chat exists, update it immutably
                         const updatedDmMessages = [...prev]; // Create a copy
                         updatedDmMessages[chatIndex] = {
                              ...updatedDmMessages[chatIndex],
                              msgs: [...updatedDmMessages[chatIndex].msgs, msgData],
                              lastMsg: msgData,
                              userData: senderData,
                         };

                         return updatedDmMessages;
                    } else {
                         // Chat doesn't exist, create a new chat entry
                         return [
                              ...prev,
                              {
                                   userId: senderId,
                                   msgs: [msgData],
                                   lastMsg: msgData,
                                   msgCount: 1,
                                   type: "dm",
                                   userData: senderData,
                              },
                         ] as IChat[];
                    }
               });
          };

          socket.on("receive", handleReceive);

          return () => {
               socket.off("receive", handleReceive); // cleanup
          };
     }, []);

     // Fetch Members
     const { data: members, isFetching: fetchingMembers } = useGetTeamMembersQuery(user.teamId || "", {
          refetchOnFocus: true,
          pollingInterval: 60000,
     });

     // Filter chats based on search query and active tab
     // const filteredChats = [].filter((chat: IChat) => {
     //      const matchesSearch = chat.name.toLowerCase().includes(searchQuery.toLowerCase());
     //      if (activeTab === "dm") return chat.type === "dm" && matchesSearch;
     //      if (activeTab === "projects") return chat.type === "project" && matchesSearch;
     //      if (activeTab === "tasks") return chat.type === "task" && matchesSearch;
     //      return matchesSearch;
     // });

     // Scroll to bottom of messages
     useEffect(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
     }, [messages]);

     // Load messages when selected chat changes
     useEffect(() => {
          if (selectedChat && selectedChat.userId) {
               setMessages(selectedChat.msgs as IMessage[]);
          }
     }, [selectedChat]);

     const handleSendMessage = () => {
          if (!newMessage.trim() || !selectedChat) return;
          const newMsg: IMessage = {
               sentBy: user.uid,
               msgContent: newMessage,
               createdAt: new Date().toISOString(),
               updatedAt: new Date().toISOString(),
               receivedBy: selectedChat.userId,
               sentIn: "dm",
               isRead: false,
          };

          socket.emit("send", { msg: newMsg, senderData: user.profile });

          setDmMessages((prev) => {
               const chatIndex = prev.findIndex((chat) => chat.userId === newMsg.receivedBy);
               if (chatIndex !== -1) {
                    // Chat exists, update it immutably
                    const updatedDmMessages = [...prev]; // Create a copy
                    updatedDmMessages[chatIndex] = {
                         ...updatedDmMessages[chatIndex],
                         msgs: [...updatedDmMessages[chatIndex].msgs, newMsg],
                         lastMsg: newMsg,
                    };

                    return updatedDmMessages;
               } else {
                    return prev;
               }
          });
          // setMessages((prev) => [...prev, newMsg]);
          setNewMessage("");
     };

     const handleKeyDown = (e: React.KeyboardEvent) => {
          if (e.key === "Enter" && !e.shiftKey) {
               e.preventDefault();
               handleSendMessage();
          }
     };

     const getStatusColor = (status: OnlineStatus) => {
          switch (status) {
               case "online":
                    return "bg-green-500";
               case "offline":
                    return "bg-gray-500";
               default:
                    return "bg-gray-500";
          }
     };

     const getChatIcon = (chat: IChat) => {
          if (chat.type === "dm") {
               const participant = chat.userData;
               return (
                    <Avatar className="h-9 w-9">
                         <AvatarImage src={participant.avatar || "/placeholder.svg"} alt={participant.name} />
                         <AvatarFallback>{participant.initials}</AvatarFallback>
                    </Avatar>
               );
          } else if (chat.type === "project") {
               return (
                    <div className="h-9 w-9 bg-purple-100 rounded-md flex items-center justify-center text-purple-600">
                         <Briefcase className="h-5 w-5" />
                    </div>
               );
          } else if (chat.type === "task") {
               return (
                    <div className="h-9 w-9 bg-blue-100 rounded-md flex items-center justify-center text-blue-600">
                         <ClipboardList className="h-5 w-5" />
                    </div>
               );
          }
     };

     const getUserById = (id: string): ITeamMember | undefined => {
          if (!Array.isArray(members)) return;

          if (id === "currentUser") {
               return {
                    id: user.uid,
                    avatar: user.profile.profilePicture || "/placeholder.svg",
                    initials: getInitials(user.profile.firstName, user.profile.lastName),
                    name: user.profile.firstName + " " + user.profile.lastName,
                    role: user.role,
                    status: "online",
                    teamId: user.teamId as string,
                    email: user.profile.email,
               };
          }
          return members.find((user) => user.id === id);
     };

     return (
          <Layout>
               <div className="flex h-[calc(100vh-8rem)] bg-gray-50">
                    {/* Chat List Sidebar */}
                    <div className="w-80 border-r bg-white flex flex-col">
                         <div className="p-4 border-b">
                              <div className="relative">
                                   <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                                   <Input
                                        placeholder="Search messages..."
                                        className="pl-8"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                   />
                              </div>
                         </div>

                         <Tabs
                              value={activeTab}
                              onValueChange={(value) => setActiveTab(value as any)}
                              className="flex-1 flex flex-col"
                         >
                              {/* <TabsList className="grid grid-cols-3 mx-4 mt-2"> */}
                              {/* <TabsTrigger value="dm">DMs</TabsTrigger> */}
                              {/* <TabsTrigger value="projects">Projects</TabsTrigger> */}
                              {/* <TabsTrigger value="tasks">Tasks</TabsTrigger> */}
                              {/* </TabsList> */}

                              <div className="flex-1 overflow-y-auto p-2">
                                   <TabsContent value="dm" className="m-0 space-y-1">
                                        {filteredDms.map((chat) => (
                                             <div
                                                  key={chat.userId}
                                                  className={`flex items-center p-2 rounded-md cursor-pointer hover:bg-gray-100 ${
                                                       selectedChat?.userId === chat.userId ? "bg-gray-100" : ""
                                                  }`}
                                                  onClick={() => {
                                                       refetchDMs();
                                                       setSelectedChat(chat);
                                                  }}
                                             >
                                                  <div className="relative">
                                                       <Avatar className="h-9 w-9">
                                                            <AvatarImage
                                                                 src={chat.userData.avatar || "/placeholder.svg"}
                                                                 alt={chat.userData.name}
                                                            />
                                                            <AvatarFallback>{chat.userData.initials}</AvatarFallback>
                                                       </Avatar>
                                                       <span
                                                            className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${getStatusColor(
                                                                 chat.userData.status,
                                                            )}`}
                                                       ></span>
                                                  </div>
                                                  <div className="ml-3 flex-1 min-w-0">
                                                       <div className="flex justify-between items-center">
                                                            <p className="font-medium text-sm truncate">
                                                                 {chat.userData.name}
                                                            </p>
                                                            {chat.lastMsg && (
                                                                 <span className="text-xs text-gray-500">
                                                                      {formatChatTime(chat.lastMsg.createdAt as string)}
                                                                 </span>
                                                            )}
                                                       </div>
                                                       {chat.lastMsg && (
                                                            <p className="text-xs text-gray-500 truncate">
                                                                 {chat.lastMsg.msgContent}
                                                            </p>
                                                       )}
                                                  </div>
                                                  {/* {chat.unreadCount > 0 && (
                                                       <Badge className="ml-2 bg-primary">{chat.unreadCount}</Badge>
                                                  )} */}
                                             </div>
                                        ))}
                                   </TabsContent>

                                   {/* <TabsContent value="projects" className="m-0 space-y-1">
                                        {filteredChats.map((chat) => (
                                             <div
                                                  key={chat.id}
                                                  className={`flex items-center p-2 rounded-md cursor-pointer hover:bg-gray-100 ${
                                                       selectedChat?.id === chat.id ? "bg-gray-100" : ""
                                                  }`}
                                                  onClick={() => setSelectedChat(chat)}
                                             >
                                                  {getChatIcon(chat)}
                                                  <div className="ml-3 flex-1 min-w-0">
                                                       <div className="flex justify-between items-center">
                                                            <p className="font-medium text-sm truncate">{chat.name}</p>
                                                            {chat.lastMsg && (
                                                                 <span className="text-xs text-gray-500">
                                                                      {chat.lastMsg.createdAt}
                                                                 </span>
                                                            )}
                                                       </div>
                                                       {chat.lastMsg && (
                                                            <p className="text-xs text-gray-500 truncate">
                                                                 <span className="font-medium">
                                                                      {
                                                                           getUserById(
                                                                                chat.lastMsg.sentBy as string,
                                                                           )?.name.split(" ")[0]
                                                                      }
                                                                      :
                                                                 </span>{" "}
                                                                 {chat.lastMsg.msgContent}
                                                            </p>
                                                       )}
                                                  </div>
                                                  {chat.unreadCount > 0 && (
                                                       <Badge className="ml-2 bg-primary">{chat.unreadCount}</Badge>
                                                  )}
                                             </div>
                                        ))}
                                   </TabsContent>

                                   <TabsContent value="tasks" className="m-0 space-y-1">
                                        {filteredChats.map((chat) => (
                                             <div
                                                  key={chat.id}
                                                  className={`flex items-center p-2 rounded-md cursor-pointer hover:bg-gray-100 ${
                                                       selectedChat?.id === chat.id ? "bg-gray-100" : ""
                                                  }`}
                                                  onClick={() => setSelectedChat(chat)}
                                             >
                                                  {getChatIcon(chat)}
                                                  <div className="ml-3 flex-1 min-w-0">
                                                       <div className="flex justify-between items-center">
                                                            <p className="font-medium text-sm truncate">{chat.name}</p>
                                                            {chat.lastMsg && (
                                                                 <span className="text-xs text-gray-500">
                                                                      {chat.lastMsg.createdAt}
                                                                 </span>
                                                            )}
                                                       </div>
                                                       {chat.lastMsg && (
                                                            <p className="text-xs text-gray-500 truncate">
                                                                 <span className="font-medium">
                                                                      {
                                                                           getUserById(
                                                                                chat.lastMsg.sentBy as string,
                                                                           )?.name.split(" ")[0]
                                                                      }
                                                                      :
                                                                 </span>{" "}
                                                                 {chat.lastMsg.msgContent}
                                                            </p>
                                                       )}
                                                  </div>
                                                  {chat.unreadCount > 0 && (
                                                       <Badge className="ml-2 bg-primary">{chat.unreadCount}</Badge>
                                                  )}
                                             </div>
                                        ))}
                                   </TabsContent> */}
                              </div>
                         </Tabs>
                    </div>

                    {/* Chat Area */}
                    {selectedChat ? (
                         <div className="flex-1 flex flex-col">
                              {/* Chat Header */}
                              <div className="p-4 border-b bg-white flex items-center justify-between">
                                   <div className="flex items-center">
                                        {getChatIcon(selectedChat)}
                                        <div className="ml-3">
                                             <div className="flex items-center">
                                                  <h2 className="font-medium">{selectedChat.userData.name}</h2>
                                                  {selectedChat.type === "dm" && (
                                                       <span
                                                            className={`ml-2 h-2.5 w-2.5 rounded-full ${getStatusColor(
                                                                 selectedChat.userData.status,
                                                            )}`}
                                                       ></span>
                                                  )}
                                             </div>
                                             <p className="text-xs text-gray-500">
                                                  {selectedChat.type === "dm"
                                                       ? selectedChat.userData.status === "online"
                                                            ? "Online"
                                                            : `Offline`
                                                       : selectedChat.type === "project"
                                                       ? `${
                                                              Array.isArray(selectedChat.participants)
                                                                   ? selectedChat.participants.length
                                                                   : "No"
                                                         } members`
                                                       : `${
                                                              Array.isArray(selectedChat.participants)
                                                                   ? selectedChat.participants.length
                                                                   : "No"
                                                         } assignees`}
                                             </p>
                                        </div>
                                   </div>
                                   <div className="flex items-center">
                                        <DropdownMenu>
                                             <DropdownMenuTrigger asChild>
                                                  <Button variant="ghost" size="icon">
                                                       <MoreHorizontal className="h-5 w-5" />
                                                  </Button>
                                             </DropdownMenuTrigger>
                                             <DropdownMenuContent align="end">
                                                  {selectedChat.type === "dm" ? (
                                                       <>
                                                            <DropdownMenuItem>View Profile</DropdownMenuItem>
                                                            <DropdownMenuItem>Mark as Unread</DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem className="text-red-500">
                                                                 Mute Conversation
                                                            </DropdownMenuItem>
                                                       </>
                                                  ) : selectedChat.type === "project" ? (
                                                       <>
                                                            <DropdownMenuItem>View Project Details</DropdownMenuItem>
                                                            <DropdownMenuItem>Add Members</DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem>Leave Project</DropdownMenuItem>
                                                       </>
                                                  ) : (
                                                       <>
                                                            <DropdownMenuItem>View Task Details</DropdownMenuItem>
                                                            <DropdownMenuItem>Mark as Complete</DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem>Unassign Yourself</DropdownMenuItem>
                                                       </>
                                                  )}
                                             </DropdownMenuContent>
                                        </DropdownMenu>
                                   </div>
                              </div>

                              {/* Messages */}
                              <div className="flex-1 overflow-y-auto p-4 bg-gray-50" id="messages-container">
                                   <div className="space-y-4">
                                        {messages.map((message, i) => {
                                             const isCurrentUser = message.sentBy === user.uid;
                                             const sender = getUserById(message.sentBy as string);

                                             return (
                                                  <div
                                                       key={message.id}
                                                       className={`flex ${
                                                            isCurrentUser ? "justify-end" : "justify-start"
                                                       }`}
                                                       ref={
                                                            i === messages.length - 1 && !isCurrentUser
                                                                 ? containerRef
                                                                 : null
                                                       }
                                                       id={
                                                            i === messages.length - 1 && !isCurrentUser
                                                                 ? "target"
                                                                 : undefined
                                                       }
                                                  >
                                                       <div className="flex max-w-[70%]">
                                                            {!isCurrentUser && (
                                                                 <Avatar className="h-8 w-8 mr-2 mt-1">
                                                                      <AvatarImage
                                                                           src={sender?.avatar || "/placeholder.svg"}
                                                                           alt={sender?.name || ""}
                                                                      />
                                                                      <AvatarFallback>
                                                                           {sender?.initials}
                                                                      </AvatarFallback>
                                                                 </Avatar>
                                                            )}
                                                            <div>
                                                                 {!isCurrentUser && selectedChat.type !== "dm" && (
                                                                      <p className="text-xs text-gray-500 mb-1">
                                                                           {sender?.name}
                                                                      </p>
                                                                 )}
                                                                 <div
                                                                      className={`rounded-lg p-3 ${
                                                                           isCurrentUser
                                                                                ? "bg-primary text-primary-foreground"
                                                                                : "bg-white border border-gray-200"
                                                                      }`}
                                                                 >
                                                                      <p className="text-sm whitespace-pre-wrap">
                                                                           {message.msgContent}
                                                                      </p>
                                                                 </div>
                                                                 <p className="text-xs text-gray-500 mt-1">
                                                                      {formatChatTime(message.createdAt as string)}
                                                                 </p>
                                                            </div>
                                                       </div>
                                                  </div>
                                             );
                                        })}
                                        <div ref={messagesEndRef} />
                                   </div>
                              </div>

                              {/* Message Input */}
                              <div className="p-4 border-t bg-white">
                                   <div className="flex items-center">
                                        <Button variant="ghost" size="icon" type="button">
                                             <Paperclip className="h-5 w-5 text-gray-500" />
                                        </Button>
                                        <div className="flex-1 mx-2">
                                             <Input
                                                  placeholder="Type a message..."
                                                  value={newMessage}
                                                  onChange={(e) => setNewMessage(e.target.value)}
                                                  onKeyDown={handleKeyDown}
                                                  className="border-gray-200"
                                             />
                                        </div>
                                        <Button size="icon" onClick={handleSendMessage} disabled={!newMessage.trim()}>
                                             <Send className="h-5 w-5" />
                                        </Button>
                                   </div>
                              </div>
                         </div>
                    ) : (
                         <div className="flex-1 flex items-center justify-center bg-gray-50">
                              <div className="text-center">
                                   <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                   <h3 className="text-lg font-medium text-gray-700">Select a conversation</h3>
                                   <p className="text-gray-500 mt-1">
                                        Choose a chat from the sidebar to start messaging
                                   </p>
                              </div>
                         </div>
                    )}

                    {/* Team Members Sidebar */}
                    <div className="w-64 border-l bg-white hidden lg:block">
                         <div className="p-4 border-b">
                              <h3 className="font-medium">Team Members</h3>
                         </div>
                         <div className="p-2 overflow-y-auto max-h-[calc(100vh-65px)]">
                              {fetchingMembers &&
                                   Array(4)
                                        .fill(null)
                                        .map((_, i) => (
                                             <div key={i} className="flex gap-3 items-center">
                                                  <Skeleton className="w-10 h-10 rounded-full" />
                                                  <div>
                                                       <Skeleton className="w-8 mb-3 h-2 rounded-md" />
                                                       <Skeleton className="w-24 h-2 rounded-md" />
                                                  </div>
                                             </div>
                                        ))}
                              {Array.isArray(members) &&
                                   !fetchingMembers &&
                                   members
                                        .filter((member) => member.id != user.uid)
                                        .map((user) => (
                                             <div
                                                  key={user.id}
                                                  className="flex items-center p-2 rounded-md hover:bg-gray-100 cursor-pointer"
                                                  onClick={() => {
                                                       const existingChat = dmMessages.find(
                                                            (chat) => chat.userId === user.id,
                                                       );
                                                       if (existingChat) {
                                                            setSelectedChat(existingChat);
                                                       } else {
                                                            const newChat: IChat = {
                                                                 userId: user.id,
                                                                 msgs: [],
                                                                 lastMsg: {},
                                                                 msgCount: 0,
                                                                 type: "dm",
                                                                 userData: user,
                                                                 participants: [user],
                                                            };
                                                            setDmMessages((prev) => [...prev, newChat]);
                                                            setSelectedChat(newChat);
                                                       }
                                                       refetchDMs();
                                                       setActiveTab("dm");
                                                  }}
                                             >
                                                  <div className="relative">
                                                       <Avatar className="h-9 w-9">
                                                            <AvatarImage
                                                                 src={user.avatar || "/placeholder.svg"}
                                                                 alt={user.name}
                                                            />
                                                            <AvatarFallback>{user.initials}</AvatarFallback>
                                                       </Avatar>
                                                       <span
                                                            className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${getStatusColor(
                                                                 user.status,
                                                            )}`}
                                                       ></span>
                                                  </div>
                                                  <div className="ml-3">
                                                       <p className="text-sm font-medium">{user.name}</p>
                                                       <p className="text-xs text-gray-500">
                                                            {user.status === "online" ? "Online" : `Offline`}
                                                       </p>
                                                  </div>
                                             </div>
                                        ))}
                         </div>
                    </div>
               </div>
          </Layout>
     );
};

export default ChatInterface;
