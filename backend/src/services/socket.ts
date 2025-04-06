import { Server } from "http";
import { Server as SocketServer, Socket } from "socket.io";
import { IMessage, ReadMessageType } from "src/interfaces/message.interface";
import { MessageService } from "src/modules/messages/message.service";
import { ApiError } from "src/utils/api/api.response";
import logger from "src/utils/logger/logger";

let io: SocketServer;
const initializeSocket = (server: Server) => {
  // Create Instance
  const messageService = new MessageService();

  // Create socket instance
  io = new SocketServer(server, {
    cors: {
      origin: "*",
    },
  });

  io.on("connection", async (socket: Socket) => {
    console.log("New socket connection: ", socket.id);

    // Join Project Room
    socket.on("joinProjectRoom", (projectId) => {
      logger.debug("Joined project");
      socket.join(projectId);
    });

    // Join Task Room
    socket.on("joinTaskRoom", (taskId) => {
      logger.debug("Joined Room");
      socket.join(taskId);
    });

    // Join Inbox
    socket.on("joinInbox", (partnerId) => {
      logger.debug("Joined Inbox");
      socket.join(partnerId);
    });

    // On sending messages
    socket.on("send", (msgData: IMessage) => {
      const { sentIn, receivedBy } = msgData;

      console.log(`Sent Message (${sentIn}): `, msgData);

      // Send message
      io.to(receivedBy as string).emit("receive", msgData);

      // Save Message
      messageService
        .saveMessage(msgData)
        .then(() => null)
        .catch((error: any) => {
          throw new ApiError("Failed to save message", 400);
        });
    });

    // On edit messages
    socket.on("edit", (data: Partial<IMessage>) => {
      const { msgContent, receivedBy, id: msgId } = data;

      // Update firestore document
      messageService
        .editMessage(msgId as string, msgContent as string)
        .then(() => {
          // Send a refetching signal
          io.to(receivedBy as string).emit("mutation", { refetch: true });
        })
        .catch((err: any) => {
          socket.emit("editAck", { success: false });
        });
    });

    // On delete message
    socket.on(
      "delete",
      (data: { messageId: string; userId: string; receivedBy: string }) => {
        const { messageId, userId, receivedBy } = data;

        // Delete Message Doc from Firestore
        messageService
          .deleteMessage(messageId, userId)
          .then(() => {
            // Send a refetching signal
            io.to(receivedBy).emit("mutation", { refetch: true });
          })
          .catch(() => {
            socket.emit("deleteAck", { success: false });
          });
      }
    );

    // On read message
    socket.on(
      "read",
      (data: {
        messageId: string;
        readerData: ReadMessageType;
        receivedBy: string;
      }) => {
        const { messageId, readerData, receivedBy } = data;

        // Set read
        messageService
          .readMessage(messageId, readerData)
          .then(() => {
            io.to(receivedBy).emit("newReader", readerData);
          })
          .catch(() => {
            io.to(receivedBy).emit("readAck", { success: false });
          });
      }
    );

    // On disconnect
    socket.on("disconnect", () => null);
  });
};

export default initializeSocket;
