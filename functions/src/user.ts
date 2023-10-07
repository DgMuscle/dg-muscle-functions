import {onRequest} from "firebase-functions/v2/https";
import {getFirestore, FieldValue} from "firebase-admin/firestore";

const db = getFirestore();

export const postProfile = onRequest(async (req, res) => {
  interface BodySpec {
    weight: number;
    height: number;
    createdAt?: FieldValue;
  };

  interface Profile {
    id: string;
    displayName: string;
    photoURL?: string;
    specs: BodySpec[];
  };
  const uid = req.get("uid");
  let profile: Profile = req.body;

  if (typeof uid == "undefined") {
    res.json({
      ok: false,
      message: "authentication error",
    });
  }

  profile.specs = profile.specs.map((spec) => {
    if (typeof spec.createdAt == "undefined") {
      spec.createdAt = FieldValue.serverTimestamp();
    };
    return spec
  });

  await db.collection(`users`).doc(uid ?? "").set(profile);

  res.json({
    ok: true,
  });
});