import { Server } from "http";
import { Server as SocketServer, Socket } from "socket.io";
import { IMessage } from "src/interfaces/message.interface";
import { IProfile } from "src/interfaces/user.interface";
import { MessageService } from "src/modules/messages/message.service";
import { ApiError } from "src/utils/api/api.response";
import { Helper } from "src/utils/helpers";
import logger from "src/utils/logger/logger";

let io: SocketServer;
export const activeUsers = new Map<string, string>();

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

    // On online
    socket.on("online", (userId: string) => {
      activeUsers.set(userId, socket.id);
      console.log("Online users: ", activeUsers);
    });

    // On offline
    socket.on("offline", (userId: string) => {
      activeUsers.delete(userId);
      console.log(userId, " went offline");
    });

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

    // Setup to receive messages
    socket.on("setup", (userId: string) => {
      logger.debug("User made itself available for upcoming socket events");
      socket.join(userId);
    });

    // On sending messages
    socket.on(
      "send",
      ({
        msg: msgData,
        senderData,
      }: {
        msg: IMessage;
        senderData: IProfile;
      }) => {
        const { sentIn, receivedBy, sentBy } = msgData;

        console.log(`Sent Message (${sentIn}): `, msgData);

        logger.debug("Sender ID: " + sentBy);
        logger.debug("Receiver ID: " + receivedBy);

        // Send message
        io.to(receivedBy as string).emit("receive", {
          msg: {
            ...msgData,
            createdAt: Helper.formatChatTime(msgData.createdAt as string),
          },
          senderData: {
            ...senderData,
            initials:
              senderData?.firstName.charAt(0) + senderData?.lastName?.charAt(0),
            name: senderData?.firstName + " " + senderData?.lastName,
          },
        });

        // Save Message
        messageService
          .saveMessage(msgData)
          .then(() => null)
          .catch((error: any) => {
            throw new ApiError("Failed to save message", 400);
          });
      }
    );

    socket.on("readLastMsg", (data) => {
      logger.debug("Read last message");

      messageService
        .readMessage(data)
        .then(() => {
          io.to(data.sentBy).emit("readAck", {
            success: true,
          });
        })
        .catch(() => {
          socket.emit("readAck", { success: false });
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
    // socket.on(
    //   "read",
    //   (data: {
    //     messageId: string;
    //     readerData: ReadMessageType;
    //     receivedBy: string;
    //   }) => {
    //     const { messageId, readerData, receivedBy } = data;

    //     // Set read
    //     messageService
    //       .readMessage(messageId, readerData)
    //       .then(() => {
    //         io.to(receivedBy).emit("newReader", readerData);
    //       })
    //       .catch(() => {
    //         io.to(receivedBy).emit("readAck", { success: false });
    //       });
    //   }
    // );

    // On disconnect
    socket.on("disconnect", () => null);
  });
};

export default initializeSocket;
