/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */
const {initializeApp} = require("firebase-admin/app");

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

initializeApp()

exports.v3exercise = require("./api/exercise");
exports.v3history = require("./api/history");
exports.v3user = require("./api/user");
