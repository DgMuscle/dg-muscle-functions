import {onRequest} from "firebase-functions/v2/https";
import {getFirestore, FieldValue} from "firebase-admin/firestore";

const db = getFirestore();

export const deleteexercise = onRequest(async (req, res) => {
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

export const getexercises = onRequest(async (req, res) => {
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

// Override exercise datas by exercises of req.body
export const setexercises = onRequest(async (req, res) => {
  interface Exercise {
    id: string;
    name: string;
    parts: string[];
    favorite: boolean;
    order: number;
    createdAt?: FieldValue;
  }

  const uid = req.get("uid");
  let exercises: Exercise[] = req.body;

  if (typeof uid == "undefined") {
    res.json({
      ok: false,
      message: "authentication error",
    });
  }

  exercises = exercises.map((exercise) => {
    if (typeof exercise.createdAt == "undefined") {
      exercise.createdAt = FieldValue.serverTimestamp();
    }
    return exercise;
  });

  await deleteCollection(db, `users/${uid}/exercises`);

  const promises = exercises.map((exercise) => {
    db.collection(`users/${uid}/exercises`).doc(exercise.id).set(exercise);
  });

  await Promise.all(promises);

  res.json({
    ok: true,
  });
});

/**
 * Represents a deleteCollection.
 * @constructor
 * @param {FirebaseFirestore.Firestore} db - The db of firestore.
 * @param {string} collectionPath - The path of collection to remove
 */
async function deleteCollection(
  db: FirebaseFirestore.Firestore,
  collectionPath: string
) {
  const collectionRef = db.collection(collectionPath);
  const query = collectionRef;

  return new Promise((resolve, reject) => {
    deleteQueryBatch(db, query, resolve).catch(reject);
  });
}

/**
 * @callback resolve
 * @param  {unknown?} value   - Index of array element
 */

/**
 * Represents a deleteQueryBatch.
 * @constructor
 * @param {FirebaseFirestore.Firestore} db - The db of firestore.
 * @param {
 * FirebaseFirestore.Query<FirebaseFirestore.DocumentData>
 * } query - The query to conduct.
 * @param {resolve} resolve - The resolve function.
 * @return {void} - Return of resulve callback.
 */
async function deleteQueryBatch(
  db: FirebaseFirestore.Firestore,
  query: FirebaseFirestore.Query<FirebaseFirestore.DocumentData>,
  resolve: (value?: unknown) => void
) {
  const snapshot = await query.get();

  const batchSize = snapshot.size;
  if (batchSize === 0) {
    // When there are no documents left, we are done
    resolve();
    return;
  }

  // Delete documents in a batch
  const batch = db.batch();
  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });
  await batch.commit();

  // Recurse on the next process tick, to avoid
  // exploding the stack.
  process.nextTick(() => {
    deleteQueryBatch(db, query, resolve);
  });
}

export const postexercise = onRequest(async (req, res) => {
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
