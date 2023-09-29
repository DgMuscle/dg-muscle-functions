import {onRequest} from "firebase-functions/v2/https";
import {getFirestore, FieldValue} from "firebase-admin/firestore";

const db = getFirestore();

export const deleteExercise = onRequest(async (req, res) => {
  const uid = req.get("uid");
  const id: string = req.body["id"];

  if (typeof uid == 'undefined') {
    res.json({
      ok: false,
      message: "authentication error"
    });
  }

  if (id == null) {
    res.json({
      ok: false,
      message: "id is required"
    });
  }

  await db.collection("users").doc(uid!).collection("exercises").doc(id).delete();

  res.json({
    ok: true
  });
});

export const getExercises = onRequest(async (req, res) => {
  const uid = req.get("uid");
  const ref = db.collection("users").doc(uid!).collection("exercises");
  
  if (typeof uid == 'undefined') {
    res.json({
      ok: false,
      message: "authentication error"
    });
  }

  const snapshot = await ref.get();
  const data = snapshot.docs.map(doc => doc.data());
  
  res.json({
    data
  });
});

export const postExercise = onRequest(async (req, res) => {

  const uid = req.get("uid");
  const exercise_id: string = req.body["id"];
  const exercise_name: string = req.body["name"];
  const exercise_parts: string[] = req.body["parts"] ?? [];
  const exercise_order: number = req.body["order"];
  const favorite: boolean = req.body["favorite"] ?? false;

  if (typeof uid == 'undefined') {
    res.json({
      ok: false,
      message: "authentication error"
    });
  }
  
  if (exercise_id == null || exercise_name == null || exercise_order == null) {
    res.json({
      ok: false,
      message: "exercise requires id, name, order"
    });
  }
  
  if (typeof(exercise_order) != "number") {
    res.json({
      ok: false,
      message: "exercise order must be integer number"
    });
  }
  
  if (typeof(favorite) != "boolean") {
    res.json({
      ok: false, 
      message: "favorite must be boolean"
    });
  }
  
  const data = {
    id: exercise_id,
    name: exercise_name,
    parts: exercise_parts,
    order: exercise_order,
    favorite,
    created_at: FieldValue.serverTimestamp()
  };
  
  await db.collection(`users/${uid}/exercises`).doc(exercise_id).set(data);
  res.json({
    ok: true
  });
});