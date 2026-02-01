const admin = require("firebase-admin");

let initialized = false;

function initializeFirebaseAdmin() {
  if (initialized) return;

  try {
    const serviceAccountRaw = process.env.FIREBASE_SERVICE_ACCOUNT;
    const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

    if (serviceAccountRaw) {
      const credential = JSON.parse(serviceAccountRaw);
      admin.initializeApp({
        credential: admin.credential.cert(credential),
      });
      initialized = true;
      return;
    }

    if (serviceAccountPath) {
      const credential = require(serviceAccountPath);
      admin.initializeApp({
        credential: admin.credential.cert(credential),
      });
      initialized = true;
      return;
    }

    // Fallback: try bundled service account if present (development only)
    try {
      const credential = require("../config/campus-connects-49a93-firebase-adminsdk-fbsvc-59565367de.json");
      admin.initializeApp({
        credential: admin.credential.cert(credential),
      });
      initialized = true;
    } catch (e) {
      console.warn("Firebase Admin not initialized. Set FIREBASE_SERVICE_ACCOUNT or FIREBASE_SERVICE_ACCOUNT_PATH.");
    }
  } catch (err) {
    console.error("Error initializing Firebase Admin:", err.message);
  }
}

initializeFirebaseAdmin();

async function sendToTokens(tokens, notification, data = {}) {
  if (!initialized || !tokens || tokens.length === 0) return { successCount: 0, failureCount: 0 };
  const payload = {
    notification,
    data: Object.fromEntries(Object.entries(data).map(([k, v]) => [k, String(v)])),
  };
  try {
    const response = await admin.messaging().sendEachForMulticast({ tokens, ...payload });
    return { successCount: response.successCount, failureCount: response.failureCount };
  } catch (err) {
    console.error("FCM send error:", err.message);
    return { successCount: 0, failureCount: tokens.length };
  }
}

module.exports = {
  sendToTokens,
};

