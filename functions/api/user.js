const {getFirestore, FieldValue} = require("firebase-admin/firestore");
const functions = require('firebase-functions');

const db = getFirestore();

exports.getprofile = functions.https.onRequest(async (req, res) => {
  const uid = req.get("uid");

  if (typeof uid == "undefined") {
    res.json({
      ok: false,
      message: "authentication error",
    });
  }

  const snapshot = await db.collection("users").doc(uid ?? "").get();
  const data = snapshot.data();
  res.json(data);
});

exports.getprofiles = functions.https.onRequest(async (req, res) => {
  const snapshot = await db.collection("users").get();
  const datas = snapshot.docs.map((doc) => doc.data());
  res.json(datas);
});

exports.postprofile = functions.https.onRequest(async (req, res) => {
  const uid = req.get("uid");
  const profile = req.body;
  profile.updatedAt = FieldValue.serverTimestamp();

  if (typeof uid == "undefined") {
    res.json({
      ok: false,
      message: "authentication error",
    });
  }

  await db.collection("users").doc(uid ?? "").set(profile);

  res.json({
    ok: true,
  });
});
