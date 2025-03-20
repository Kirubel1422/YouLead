import admin, { ServiceAccount } from "firebase-admin";
import { ENV } from "src/constants/dotenv";
import serviceAccount from "admin-sdk.json";
import logger from "src/utils/logger/logger";

const fireFirebase = async () => {
  try {
    await admin.initializeApp({
      storageBucket: ENV.FIREBASE_STRORAGE_BUCKET,
      credential: admin.credential.cert(serviceAccount as ServiceAccount),
      databaseURL: ENV.FIREBASE_DATABASE_URL,
    });

    logger.info("Firebase initiallized successfully");
  } catch (error: any) {
    logger.error("Firebase couldn't be initiallized" + error.message);
  }
};

fireFirebase();

const db = admin.firestore();
const auth = admin.auth();

export { auth, db, fireFirebase };
