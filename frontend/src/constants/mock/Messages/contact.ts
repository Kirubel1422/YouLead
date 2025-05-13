// Mock data - replace with actual API calls
export const mockContacts: any[] = [
     {
          id: "1",
          name: "Alice Johnson",
          lastMessage: "Can you review the latest design?",
          lastMessageTime: "10:30 AM",
          unreadCount: 2,
          isOnline: true,
     },
     {
          id: "2",
          name: "Bob Smith",
          lastMessage: "Meeting at 3 PM",
          lastMessageTime: "Yesterday",
          isOnline: false,
     },
     // Add more mock contacts
];

export const mockMessages: any[] = [
     {
          id: "1",
          content: "Hi, how's the project going?",
          sender: { id: "1", name: "Alice Johnson" },
          timestamp: "10:30 AM",
          isMe: false,
     },
     {
          id: "2",
          content: "It's going well! I've completed the initial designs.",
          sender: { id: "current-user", name: "Me" },
          timestamp: "10:31 AM",
          isMe: true,
     },
     // Add more mock messages
];
