const {getFirestore, FieldValue} = require("firebase-admin/firestore");
const {onRequest} = require("firebase-functions/v2/https");

const db = getFirestore();

exports.deletehistory = onRequest(async (req, res) => {
  const uid = req.get("uid");
  const id = req.body.id;

  if (uid == undefined) {
    res.json({
      ok: false,
      message: "authentication error",
    });
  }

  if (id == undefined) {
    res.json({
      ok: false,
      message: "id is required",
    });
  }

  await db.collection("users")
    .doc(uid ?? "")
    .collection("histories")
    .doc(id)
    .delete();

  res.json({
    ok: true,
  });
});

exports.getfriendhistories = onRequest(async (req, res) => {
  const friendId = req.query.friendId;

  const snapshot = await db.collection("users")
  .doc(friendId)
  .collection("histories")
  .orderBy("date", "desc")
  .limit(365)
  .get();

  const datas = snapshot.docs.map((doc) => doc.data());

  res.json(datas);
});

exports.gethistories = onRequest(async (req, res) => {
  const uid = req.get("uid");
  const lastId = req.query.lastId;
  const limit = req.query.limit ?? "365";

  if (typeof uid == "undefined") {
    res.json({
      ok: false,
      message: "authentication error",
    });
  }

  let ref = db.collection("users").doc(uid ?? "")
    .collection("histories")
    .orderBy("date", "desc");

  if (typeof lastId == "string") {
    const previousSnapshot = await db.collection("users")
      .doc(uid ?? "")
      .collection("histories")
      .doc(lastId).get();
    ref = ref.startAfter(previousSnapshot);
  }

  const snapshot = await ref.limit(Number(limit)).get();
  const data = snapshot.docs.map((doc) => doc.data());

  res.json(data);
});

exports.posthistory = onRequest(async (req, res) => {
  const uid = req.get("uid");
  const id = req.body["id"];
  const date = req.body["date"];
  const records = req.body["records"] ?? [];
  const memo = req.body["memo"];
  const runV2 = req.body["runV2"];

  if (typeof uid == "undefined") {
    res.json({
      ok: false,
      message: "authentication error",
    });
  }

  if (id == null || date == null || records.length == 0) {
    res.json({
      ok: false,
      message: "wrong parameter",
    });
  }

  const data = {
    id,
    date,
    records,
    createdAt: FieldValue.serverTimestamp(),
  };

  if (memo != undefined) {
    data.memo = memo;
  }

  if (runV2 != undefined) {
    data.runV2 = runV2;
  }

  await db.collection(`users/${uid}/histories`).doc(id).set(data);

  res.json({
    ok: true,
  });
});