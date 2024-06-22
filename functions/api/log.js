const {getFirestore, FieldValue} = require("firebase-admin/firestore");
const {onRequest} = require("firebase-functions/v2/https");
const { getMessaging } = require("firebase-admin/messaging");
const { v4 } = require("uuid");

const db = getFirestore();

exports.postlog = onRequest(async (req, res) => {
    let body = req.body;
    let id = body.id;

    if (id == null) {
        id = v4();
    }

    await db.collection("logs").doc(id).set(body);

    const allUserDocs = (await db.collection("users").get()).docs;
    const allUsers = allUserDocs.map((doc) => (doc.data()));
    const developers = allUsers.filter((user) => {
        return user.developer == true
    });

    const tokens = developers.map((user) => (user.fcmtoken));

    const messages = tokens.map((token) => {
        return {
            notification: {
                title: `DG Log`,
                body: `[${body.category}] - ${body.message}`
            },
            data: {
                destination: "logs"
            },
            token
        }
    });

    getMessaging().sendEach(messages);

    res.json({
        ok: true
    });
});

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