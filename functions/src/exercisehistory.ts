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

export const getHistories = onRequest(async (req, res) => {
    const uid = req.get("uid");
    const lastId = req.query.lastId;

    if (typeof uid == "undefined") {
        res.json({
            ok: false,
            message: "authentication error",
        });
    }

    let ref = db.collection("users").doc(uid ?? "").collection("histories").orderBy("date", "desc");

    if (typeof lastId == "string") {
        const previousSnapshot = await db.collection("users").doc(uid ?? "").collection("histories").doc(lastId).get();
        ref = ref.startAfter(previousSnapshot);
    }

    const snapshot = await ref.limit(100).get();

    const data = snapshot.docs.map((doc) => doc.data());

    res.json({
        data
    });
});

export const postHistory = onRequest(async (req, res) => {
    const uid = req.get("uid");
    const id: string = req.body["id"];
    const date: string = req.body["date"];
    const records: Record[] = req.body["records"] ?? [];

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

    await db.collection(`users/${uid}/histories`).doc(id).set(data);

    res.json({
        ok: true,
    });
});
