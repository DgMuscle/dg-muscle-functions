import {onRequest} from "firebase-functions/v2/https";
import {getFirestore, FieldValue} from "firebase-admin/firestore";

const db = getFirestore();

export const getprofile = onRequest(async (req, res) => {
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

export const getprofiles = onRequest(async (req, res) => {
  const snapshot = await db.collection("users").get()
  let datas = snapshot.docs.map((doc) => doc.data());
  res.json(datas);
});

export const postprofile = onRequest(async (req, res) => {
  interface Profile {
    id: string;
    displayName: string;
    photoURL?: string;
    updatedAt?: FieldValue;
  }

  const uid = req.get("uid");
  const profile: Profile = req.body;
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