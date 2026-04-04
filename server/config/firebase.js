import admin from "firebase-admin";
import { createRequire } from "module";
const require = createRequire(import.meta.url);

// Load service account JSON (do NOT commit this file)
const serviceAccount = require("../../firebase-service-account.json");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

export const firestore = admin.firestore();