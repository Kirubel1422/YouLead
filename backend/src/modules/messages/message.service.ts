import { db } from "src/configs/firebase";
import { COLLECTIONS } from "src/constants/firebase.collections";
import { IMessage } from "src/interfaces/message.interface";
import { ApiError } from "src/utils/api/api.response";
import { AuthServices } from "../auth/auth.service";
import dayjs from "dayjs";
import isYesterday from "dayjs/plugin/isYesterday";
import isToday from "dayjs/plugin/isToday";
import { Helper } from "src/utils/helpers";

dayjs.extend(isYesterday);
dayjs.extend(isToday);

export class MessageService {
  construct() {
    this.saveMessage = this.saveMessage.bind(this);
    this.deleteMessage = this.deleteMessage.bind(this);
    this.editMessage = this.editMessage.bind(this);
    this.readMessage = this.readMessage.bind(this);
    this.fetchDM = this.fetchDM.bind(this);
    this.readMessage = this.readMessage.bind(this);
  }

  // Save message
  async saveMessage(messageData: IMessage) {
    const msgData: IMessage = {
      ...messageData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await db.collection(COLLECTIONS.MESSAGES).doc().set(msgData);
  }

  // Delete message
  async deleteMessage(messageId: string, userId: string) {
    // Check messageId
    const messageRef = db.collection(COLLECTIONS.MESSAGES).doc(messageId);
    const messageSnap = await messageRef.get();

    if (!messageSnap.exists) {
      throw new ApiError(
        "The message you are trying to delete does not exist.",
        400
      );
    }

    // Check if the userId matches the messageDoc
    const messageData = messageSnap.data() as IMessage;
    if (messageData.sentBy != userId) {
      throw new ApiError("Unauthorized", 400);
    }

    // Delete
    await messageRef.delete();
  }

  // Edit message
  async editMessage(messageId: string, newMsg: string) {
    if (!newMsg) throw new ApiError("Message can't be empty", 400);

    // Check messageId
    const messageRef = db.collection(COLLECTIONS.MESSAGES).doc(messageId);
    const messageSnap = await messageRef.get();

    if (!messageSnap.exists) {
      throw new ApiError(
        "The message you are trying to edit is not found.",
        400
      );
    }

    // Update message document
    messageRef.update({ msgContent: newMsg });
  }

  // Read message - append to readBy array
  async readMessage(msgData: Partial<IMessage>) {
    return await db.runTransaction(async (transaction) => {
      // Check messageId
      const messageQ = db
        .collection(COLLECTIONS.MESSAGES)
        .where("createdAt", "==", msgData.createdAt)
        .where("sentBy", "==", msgData.sentBy)
        .where("receivedBy", "==", msgData.receivedBy)
        .limit(1);
      const messageSnap = await transaction.get(messageQ);

      if (messageSnap.empty) {
        throw new ApiError(
          "The message you are trying to read is not found.",
          400
        );
      }

      transaction.update(messageSnap.docs[0].ref, {
        isRead: true,
        readBy: [msgData.receivedBy],
      });
    });
  }

  async fetchDM(userId: string): Promise<any[]> {
    // Get messages WHERE user is either sender OR receiver
    const sentMessages = db
      .collection(COLLECTIONS.MESSAGES)
      .where("sentBy", "==", userId)
      .where("sentIn", "==", "dm")
      .orderBy("createdAt");

    const receivedMessages = db
      .collection(COLLECTIONS.MESSAGES) // Fixed collection name
      .where("receivedBy", "==", userId)
      .where("sentIn", "==", "dm")
      .orderBy("createdAt");

    const [sentSnapshot, receivedSnapshot] = await Promise.all([
      sentMessages.get(),
      receivedMessages.get(),
    ]);

    // Combine and sort all messages chronologically
    const allMessages = [
      ...sentSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
      ...receivedSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
    ].sort(
      (a: any, b: any) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    ) as IMessage[];

    // Group messages by conversation partner
    const chatMap = new Map<string, IMessage[]>();

    for (const msg of allMessages) {
      // Determine conversation partner ID
      const partnerId = msg.sentBy === userId ? msg.receivedBy : msg.sentBy;

      if (!chatMap.has(partnerId)) {
        chatMap.set(partnerId, []);
      }
      chatMap.get(partnerId)?.push(msg);
    }

    // Create chat objects
    const chatPromises = Array.from(chatMap.entries()).map(
      async ([partnerId, msgs]) => {
        const partnerInfo = await AuthServices.chatUserInfo(partnerId);

        return {
          userId: partnerId,
          userData: partnerInfo,
          msgs: msgs
            .sort(
              (a: any, b: any) =>
                new Date(a.createdAt).getTime() -
                new Date(b.createdAt).getTime()
            )
            .map((msg) => ({
              ...msg,
              createdAt: Helper.formatChatTime(msg.createdAt as string),
            })),
          msgsCount: msgs.length,
          lastMsg: {
            ...msgs[msgs.length - 1],
            createdAt: Helper.formatChatTime(
              msgs[msgs.length - 1].createdAt as string
            ),
          },
          type: "dm",
        };
      }
    );

    return Promise.all(chatPromises);
  }
}
