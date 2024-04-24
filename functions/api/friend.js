const {getFirestore, FieldValue} = require("firebase-admin/firestore");
const { v4 } = require("uuid");
const functions = require('firebase-functions');

const db = getFirestore();

exports.getrequests = functions.https.onRequest(async (req, res) => {
    const uid = req.get("uid");
    if (uid == undefined) {
        res.status(401)
        return
    }

    let snapshot = await db
    .collection("users")
    .doc(uid)
    .collection("friend_requests")
    .get();

    let datas = snapshot.docs.map((doc) => doc.data());

    res.json(datas)
});

exports.deleterequest = functions.https.onRequest(async (req, res) => {
    const uid = req.get("uid");
    if (uid == undefined) {
        res.status(401)
        return
    }

    const deleteId = req.body["deleteId"];

    await db
    .collection("users")
    .doc(uid)
    .collection("friend_requests")
    .doc(deleteId)
    .delete()

    res.json({
        ok: true
    });
});

exports.postrequest = functions.https.onRequest(async (req, res) => {
    const uid = req.get("uid");
    if (uid == undefined) {
        res.status(401)
        return
    }

    const fromId = uid;
    const toId = req.body["toId"];

    if (toId == undefined || toId == null) {
        res.status(400)
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

exports.getfriends = functions.https.onRequest(async (req, res) => {
    const uid = req.get("uid");
    if (uid == undefined) {
        res.status(401)
        return
    }

    const snapshot = await db.collection("users")
    .doc(uid)
    .collection("friends")
    .get();

    const datas = snapshot.docs.map((doc) => doc.data());
    res.json(datas)
});

exports.post = functions.https.onRequest(async (req, res) => {
    const uid = req.get("uid");
    if (uid == undefined) {
        res.status(401)
        return
    }

    const friendId = req.body["friendId"];

    await db.collection("users")
    .doc(uid)
    .collection("friends")
    .doc(friendId)
    .set();

    await db.collection("users")
    .doc(uid)
    .collection("friend_requests")
    .doc(friendId)
    .delete();

    res.json({ok: true})
});

exports.delete = functions.https.onRequest(async (req, res) => {
    const uid = req.get("uid");
    if (uid == undefined) {
        res.status(401)
        return
    }

    const friendId = req.body["friendId"];
    await db.collection("users")
    .doc(uid)
    .collection("friends")
    .doc(friendId)
    .delete();

    res.json({ok: true})
});
