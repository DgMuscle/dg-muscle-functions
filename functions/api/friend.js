const {getFirestore, FieldValue} = require("firebase-admin/firestore");
const { v4 } = require("uuid");
const functions = require('firebase-functions');

const db = getFirestore();

exports.postrequest = functions.https.onRequest(async( req, res) => {
    const uid = req.get("uid");

    const fromId = uid;
    const toId = req.body["toId"];

    if (uid == undefined) {
        res.json({
            ok: false,
            message: "authentication error"
        })
        return
    }

    if (toId == undefined || toId == null) {
        res.status(400).json({
            ok: false,
            message: "not enough parameter"
        })
        return
    }

    await db
    .collection("users")
    .doc(toId)
    .collection("friend_requests")
    .doc(fromId)
    .set({
        fromId,
        createdAt: FieldValue.serverTimestamp()
    });

    res.json({
        ok: true
    });
});