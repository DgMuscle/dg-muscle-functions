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

    // 이미 친구이거나 삭제된 계정이라면 거절
    let friendsSnapshot = await db.collection("users").doc(uid).collection("friends").get();
    let friends = friendsSnapshot.docs.map((doc) => (doc.data()));
    let friendsIds = friends.map((friend) => (friend.uid));

    // 특정 문자열이 friendsIds 배열에 포함되어 있는지 확인
    let isIncluded = friendsIds.includes(toId);

    if (isIncluded) {
        res.json({
            ok: false,
            message: "Already friend"
        });
        return
    }

    let opponent = (await db.collection("users").doc(toId).get()).data();

    if (opponent.deleted == true) {
        res.json({
            ok: false,
            message: "Deleted Account"
        });
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
    if (receiver.fcmToken != null ) {
        const message = {
            notification: {
                title: `Friend Request`,
                body: `${sender.displayName ?? sender.id} send friend request`
            },
            data: {
                destination: "friend_request"
            },
            token: `${receiver.fcmToken}`
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
    if (receiver.fcmToken != null ) {
        const message = {
            notification: {
                title: `Friend Accepted`,
                body: `${sender.displayName ?? sender.id} accepted friend request`
            },
            data: {
                destination: "friend_list"
            },
            token: `${receiver.fcmToken}`
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
