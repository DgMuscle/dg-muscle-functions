import {onRequest} from "firebase-functions/v2/https";
import {getFirestore, FieldValue} from "firebase-admin/firestore";

const db = getFirestore();

interface Set {
    weight: number;
    unit: string;
    reps: number;
}

interface Record {
    exerciseId: string;
    sets: [Set];
}

export const deleteHistory = onRequest(async (req, res) => {
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

export const getHistories = onRequest(async (req, res) => {
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

export const postHistory = onRequest(async (req, res) => {
  const uid = req.get("uid");
  const id: string = req.body["id"];
  const date: string = req.body["date"];
  const records: Record[] = req.body["records"] ?? [];
  const memo: string | undefined = req.body["memo"];

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

  interface Data {
    id: string;
    date: string;
    records: Record[];
    createdAt: FieldValue;
    memo?: string;
  }

  const data: Data = {
    id,
    date,
    records,
    createdAt: FieldValue.serverTimestamp(),
  };

  if (memo != undefined) {
    data.memo = memo;
  }

  await db.collection(`users/${uid}/histories`).doc(id).set(data);

  res.json({
    ok: true,
  });
});
