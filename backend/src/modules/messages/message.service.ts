import { firestore } from "firebase-admin";
import { db } from "src/configs/firebase";
import { COLLECTIONS } from "src/constants/firebase.collections";
import { IMessage, ReadMessageType } from "src/interfaces/message.interface";
import { ApiError } from "src/utils/api/api.response";
import { AuthServices } from "../auth/auth.service";
import dayjs from "dayjs";
import isYesterday from "dayjs/plugin/isYesterday";
import isToday from "dayjs/plugin/isToday";

dayjs.extend(isYesterday);
dayjs.extend(isToday);

export class MessageService {
  construct() {
    this.saveMessage = this.saveMessage.bind(this);
    this.deleteMessage = this.deleteMessage.bind(this);
    this.editMessage = this.editMessage.bind(this);
    this.readMessage = this.readMessage.bind(this);
    this.fetchDM = this.fetchDM.bind(this);
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
  async readMessage(messageId: string, readerData: ReadMessageType) {
    return await db.runTransaction(async (transaction) => {
      // Check messageId
      const messageRef = db.collection(COLLECTIONS.MESSAGES).doc(messageId);
      const messageSnap = await transaction.get(messageRef);

      if (!messageSnap.exists) {
        throw new ApiError(
          "The message you are trying to read is not found.",
          400
        );
      }

      transaction.update(messageRef, {
        readBy: firestore.FieldValue.arrayUnion(readerData),
      });
    });
  }

  // Fetch user messages
  async fetchDM(userId: string): Promise<any[]> {
    const sentFromMeQ = db
      .collection(COLLECTIONS.MESSAGES)
      .where("sentBy", "==", userId)
      .where("sentIn", "==", "dm")
      .orderBy("createdAt");
    const receievedByMeQ = db
      .collection(COLLECTIONS.MEETINGS)
      .where("receivedBy", "==", userId)
      .where("sentIn", "==", "dm")
      .orderBy("createdAt");

    const [sentFromMe, receievedByMe] = await Promise.all([
      sentFromMeQ.get(),
      receievedByMeQ.get(),
    ]);

    const combinedMsgs = [
      ...sentFromMe.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
      ...receievedByMe.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
    ] as IMessage[];

    // Parse user ids
    const userIds = new Set(
      combinedMsgs.map((doc) => {
        const isSentFromMe = doc.sentBy == userId;
        return isSentFromMe ? doc.receivedBy : doc.sentBy;
      })
    );

    // Unique user ids
    const uniqueUserIds = [...userIds];

    const chats = uniqueUserIds.map((uuid: string) => {
      return AuthServices.chatUserInfo(uuid).then((res) => {
        const msgs = combinedMsgs.filter(
          (msg) => msg.receivedBy == uuid || msg.sentBy == uuid
        );

        const lastMsgData = msgs[msgs.length - 1];
        const lastMsg = {
          id: lastMsgData.id,
          sentBy: lastMsgData.sentBy,
          msgContent: lastMsgData.msgContent,
          createdAt: dayjs(lastMsgData.createdAt).isToday()
            ? dayjs(lastMsgData.createdAt).format("hh:mm A")
            : dayjs(lastMsgData.createdAt).isYesterday()
            ? "Yesterday"
            : dayjs(lastMsgData.createdAt).format("ll"),
        };

        return {
          userId: uuid,
          userData: res,
          msgs,
          msgsCount: msgs.length,
          lastMsg,
          type: "dm",
        };
      });
    });

    const [result] = await Promise.all([await Promise.all(chats)]);
    return result;
  }
}
