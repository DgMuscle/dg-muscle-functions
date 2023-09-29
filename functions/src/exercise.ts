import {onRequest} from "firebase-functions/v2/https";
import {getFirestore, FieldValue} from "firebase-admin/firestore";

const db = getFirestore();

export const postExercise = onRequest(async (req, res) => {
    const uid = req.get("uid");
    const exercise_id: string = req.body["id"];
    const exercise_name: string = req.body["name"];
    const exercise_part: string = req.body["part"];
    const exercise_order: number = req.body["order"];
    const favorite: boolean = req.body["favorite"] ?? false;
  
    if (exercise_id == null || exercise_name == null || exercise_order == null) {
      res.json({
        ok: false,
        message: "exercise requires id, name, order"
      })
    }
  
    if (typeof(exercise_order) != "number") {
      res.json({
        ok: false,
        message: "exercise order must be integer number"
      })
    }
  
    if (typeof(favorite) != "boolean") {
      res.json({
        ok: false, 
        message: "favorite must be boolean"
      })
    }
  
    const data = {
      name: exercise_name,
      part: exercise_part,
      order: exercise_order,
      favorite,
      created_at: FieldValue.serverTimestamp()
    };
  
    await db.collection(`users/${uid}/exercises`).doc(exercise_id).set(data);
    res.json({
      ok: true
    });
  });