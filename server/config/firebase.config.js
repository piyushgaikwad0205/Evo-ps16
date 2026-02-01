const admin = require('firebase-admin');
const path = require('path');

let firebaseApp;

/**
 * Initialize Firebase Admin SDK
 * Supports both service account file and environment variables
 */
const initializeFirebase = () => {
    if (firebaseApp) {
        return firebaseApp;
    }

    try {
        // Method 1: Using service account file
        if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
            const serviceAccountPath = path.resolve(
                __dirname,
                process.env.FIREBASE_SERVICE_ACCOUNT_PATH
            );
            const serviceAccount = require(serviceAccountPath);

            firebaseApp = admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
                projectId: serviceAccount.project_id,
            });

            console.log('✅ Firebase Admin initialized with service account file');
        }
        // Method 2: Using environment variables
        else if (
            process.env.FIREBASE_PROJECT_ID &&
            process.env.FIREBASE_PRIVATE_KEY &&
            process.env.FIREBASE_CLIENT_EMAIL
        ) {
            firebaseApp = admin.initializeApp({
                credential: admin.credential.cert({
                    projectId: process.env.FIREBASE_PROJECT_ID,
                    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
                    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                }),
                projectId: process.env.FIREBASE_PROJECT_ID,
            });

            console.log('✅ Firebase Admin initialized with environment variables');
        } else {
            console.warn(
                '⚠️  Firebase Admin not initialized - missing credentials. Phone auth will not work.'
            );
            return null;
        }

        return firebaseApp;
    } catch (error) {
        console.error('❌ Error initializing Firebase Admin:', error.message);
        return null;
    }
};

/**
 * Get Firebase Admin instance
 */
const getFirebaseAdmin = () => {
    if (!firebaseApp) {
        return initializeFirebase();
    }
    return firebaseApp;
};

/**
 * Verify Firebase ID token
 * @param {string} idToken - Firebase ID token from client
 * @returns {Promise<object>} Decoded token with user info
 */
const verifyFirebaseToken = async (idToken) => {
    try {
        const app = getFirebaseAdmin();
        if (!app) {
            throw new Error('Firebase Admin not initialized');
        }

        const decodedToken = await admin.auth().verifyIdToken(idToken);
        return decodedToken;
    } catch (error) {
        console.error('Error verifying Firebase token:', error.message);
        throw new Error('Invalid or expired Firebase token');
    }
};

/**
 * Get user by phone number
 * @param {string} phoneNumber - Phone number in E.164 format
 * @returns {Promise<object>} Firebase user record
 */
const getUserByPhoneNumber = async (phoneNumber) => {
    try {
        const app = getFirebaseAdmin();
        if (!app) {
            throw new Error('Firebase Admin not initialized');
        }

        const userRecord = await admin.auth().getUserByPhoneNumber(phoneNumber);
        return userRecord;
    } catch (error) {
        if (error.code === 'auth/user-not-found') {
            return null;
        }
        throw error;
    }
};

/**
 * Create custom token for user
 * @param {string} uid - Firebase user ID
 * @param {object} additionalClaims - Additional claims to add to token
 * @returns {Promise<string>} Custom token
 */
const createCustomToken = async (uid, additionalClaims = {}) => {
    try {
        const app = getFirebaseAdmin();
        if (!app) {
            throw new Error('Firebase Admin not initialized');
        }

        const customToken = await admin.auth().createCustomToken(uid, additionalClaims);
        return customToken;
    } catch (error) {
        console.error('Error creating custom token:', error.message);
        throw error;
    }
};

module.exports = {
    initializeFirebase,
    getFirebaseAdmin,
    verifyFirebaseToken,
    getUserByPhoneNumber,
    createCustomToken,
};
