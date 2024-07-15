const {getFirestore} = require("firebase-admin/firestore");
const { onRequest } = require("firebase-functions/v2/https");

const db = getFirestore();

exports.getapikey = onRequest(async (req, res) => {
    const uid = req.get("uid");
    const data = (await db.collection("users").doc(uid).get()).data();

    if (data == undefined) {
        res.json({
            ok: false,
            message: "Unauthorized"
        })
        return
    }

    res.json({
        apiKey: "4f028a66ebmshfa88837d9724c9cp186262jsnd3b23acf8006"
    })
});