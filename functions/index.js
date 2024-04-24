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

exports.v4exercise = require("./api/exercise");
exports.v4friend = require("./api/friend");
exports.v4history = require("./api/history");
exports.v4user = require("./api/user");
