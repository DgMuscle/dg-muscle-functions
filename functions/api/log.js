const {getFirestore, FieldValue} = require("firebase-admin/firestore");
const {onRequest} = require("firebase-functions/v2/https");
const { getMessaging } = require("firebase-admin/messaging");

const db = getFirestore();

exports.getlogs = onRequest(async (req, res) => {
    const uid = req.get("uid");
    const userSnapshot = await db.collection("users").doc(uid ?? "").get();
    const user = userSnapshot.data();

    if (user.developer == true) {
        let logSnapshot = await db.collection("logs").get();
        let documents = logSnapshot.docs
        let data = documents.map((doc) => (doc.data()));

        res.json(data);

    } else {
        res.json({
            ok: false,
            message: "authentication error"
        });
    }
});