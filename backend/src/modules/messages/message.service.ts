import { firestore } from "firebase-admin";
import { db } from "src/configs/firebase";
import { COLLECTIONS } from "src/constants/firebase.collections";
import { IMessage, ReadMessageType } from "src/interfaces/message.interface";
import { ApiError } from "src/utils/api/api.response";

export class MessageService {
  construct() {
    this.saveMessage = this.saveMessage.bind(this);
    this.deleteMessage = this.deleteMessage.bind(this);
    this.editMessage = this.editMessage.bind(this);
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
}
