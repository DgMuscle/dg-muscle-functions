import {onRequest} from "firebase-functions/v2/https";
import {getFirestore, FieldValue} from "firebase-admin/firestore";

const db = getFirestore();

export const getProfile = onRequest(async (req, res) => {
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

export const postProfile = onRequest(async (req, res) => {
  interface BodySpec {
    weight: number;
    height: number;
    createdAt: string;
  }

  interface Profile {
    id: string;
    displayName: string;
    photoURL?: string;
    specs: BodySpec[];
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
