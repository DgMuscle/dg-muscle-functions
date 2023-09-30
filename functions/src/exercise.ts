import {onRequest} from "firebase-functions/v2/https";
import {getFirestore, FieldValue} from "firebase-admin/firestore";

const db = getFirestore();

export const deleteExercise = onRequest(async (req, res) => {
  const uid = req.get("uid");
  const id: string = req.body["id"];

  if (typeof uid == "undefined") {
    res.json({
      ok: false,
      message: "authentication error",
    });
  }

  if (id == null) {
    res.json({
      ok: false,
      message: "id is required",
    });
  }

  await db.collection("users")
    .doc(uid ?? "")
    .collection("exercises")
    .doc(id)
    .delete();

  res.json({
    ok: true,
  });
});

export const getExercises = onRequest(async (req, res) => {
  const uid = req.get("uid");

  if (typeof uid == "undefined") {
    res.json({
      ok: false,
      message: "authentication error",
    });
  }

  const ref = db.collection("users").doc(uid ?? "").collection("exercises");
  const snapshot = await ref.get();
  const data = snapshot.docs.map((doc) => doc.data());

  res.json(data);
});

export const postExercise = onRequest(async (req, res) => {
  const uid = req.get("uid");
  const exerciseId: string = req.body["id"];
  const exerciseName: string = req.body["name"];
  const exerciseParts: string[] = req.body["parts"] ?? [];
  const exerciseOrder: number = req.body["order"];
  const favorite: boolean = req.body["favorite"] ?? false;

  if (typeof uid == "undefined") {
    res.json({
      ok: false,
      message: "authentication error",
    });
  }

  if (exerciseId == null || exerciseName == null || exerciseOrder == null) {
    res.json({
      ok: false,
      message: "exercise requires id, name, order",
    });
  }

  if (typeof(exerciseOrder) != "number") {
    res.json({
      ok: false,
      message: "exercise order must be integer number",
    });
  }

  if (typeof(favorite) != "boolean") {
    res.json({
      ok: false,
      message: "favorite must be boolean",
    });
  }

  const data = {
    id: exerciseId,
    name: exerciseName,
    parts: exerciseParts,
    order: exerciseOrder,
    favorite,
    createdAt: FieldValue.serverTimestamp(),
  };

  await db.collection(`users/${uid}/exercises`).doc(exerciseId).set(data);
  res.json({
    ok: true,
  });
});
