const {getFirestore, FieldValue} = require("firebase-admin/firestore");
const { getMessaging } = require("firebase-admin/messaging");
const {onRequest} = require("firebase-functions/v2/https");

const db = getFirestore();

exports.getrequests = onRequest(async (req, res) => {
    const uid = req.get("uid");
    if (uid == undefined) {
        res.status(401).json({
            ok: false,
            message: "Not authorized"
        })
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

exports.deleterequest = onRequest(async (req, res) => {
    const uid = req.get("uid");
    if (uid == undefined) {
        res.status(401).json({
            ok: false,
            message: "Not authorized"
        })
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

exports.postrequest = onRequest(async (req, res) => {
    const uid = req.get("uid");
    if (uid == undefined) {
        res.status(401).json({
            ok: false,
            message: "Not authorized"
        })
        return
    }

    const fromId = uid;
    const toId = req.body["toId"];

    if (toId == undefined || toId == null) {
        res.status(400).json({
            ok: false,
            message: "Empty parameter"
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

    // push notification to opponent
    const sender = (await db.collection("users").doc(uid).get()).data()
    const receiver = (await db.collection("users").doc(toId).get()).data()
    if (receiver.fcmtoken != null ) {
        const message = {
            notification: {
                title: `Friend Request`,
                body: `${sender.displayName ?? sender.id} send friend request`
            },
            data: {
                destination: "friend_request"
            },
            token: `${receiver.fcmtoken}`
        }
        getMessaging().send(message)
    }

    res.json({
        ok: true
    });
});

exports.getfriends = onRequest(async (req, res) => {
    const uid = req.get("uid");
    if (uid == undefined) {
        res.status(401).json({
            ok: false,
            message: "Not authorized"
        })
        return
    }

    const snapshot = await db.collection("users")
    .doc(uid)
    .collection("friends")
    .get();

    const datas = snapshot.docs.map((doc) => doc.data());
    res.json(datas)
});

exports.post = onRequest(async (req, res) => {
    const uid = req.get("uid");
    if (uid == undefined) {
        res.status(401).json({
            ok: false,
            message: "Not authorized"
        })
        return
    }

    const friendId = req.body["friendId"];

    await db.collection("users")
    .doc(uid)
    .collection("friends")
    .doc(friendId)
    .set({uid: friendId});

    await db.collection("users")
    .doc(uid)
    .collection("friend_requests")
    .doc(friendId)
    .delete();

    await db.collection("users")
    .doc(friendId)
    .collection("friends")
    .doc(uid)
    .set({uid: uid})

    // friendId 한테 푸시메시지
    const sender = (await db.collection("users").doc(uid).get()).data()
    const receiver = (await db.collection("users").doc(friendId).get()).data()
    if (receiver.fcmtoken != null ) {
        const message = {
            notification: {
                title: `Friend Accepted`,
                body: `${sender.displayName ?? sender.id} accepted friend request`
            },
            data: {
                destination: "friend_list"
            },
            token: `${receiver.fcmtoken}`
        }
        getMessaging().send(message)
    }

    res.json({ok: true})
});

exports.delete = onRequest(async (req, res) => {
    const uid = req.get("uid");
    if (uid == undefined) {
        res.status(401).json({
            ok: false,
            message: "Not authorized"
        })
        return
    }

    const friendId = req.body["friendId"];
    await db.collection("users")
    .doc(uid)
    .collection("friends")
    .doc(friendId)
    .delete();

    await db.collection("users")
    .doc(friendId)
    .collection("friends")
    .doc(uid)
    .delete();

    res.json({ok: true})
});
