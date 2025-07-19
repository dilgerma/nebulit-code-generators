import { Router, Request, Response } from 'express';
import {loadPongoClient} from "../../common/loadPongoClient";
import {<%-readmodel%>ReadModel} from "./<%-readmodel%>Projection";

const router = Router();

router.get('/query/<%-readmodel%>-collection', async (req: Request, res: Response) => {
    // requireUser in your original code seems to expect some kind of context,
    // adapt it to Express req if needed, or pass false as in your original code.
    try {
        const account = req.query._id;
        const client = loadPongoClient();
        const db = client.db();
        const collection = db.collection<<%-readmodel%>ReadModel>('<%-readmodel%>-collection');

        const projection = await collection.findOne({ _id: account });

        // Serialize, handling bigint properly
        const sanitized = JSON.parse(
            JSON.stringify(projection, (key, value) =>
                typeof value === 'bigint' ? value.toString() : value
            )
        );

        return res.status(200).json(sanitized);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ ok: false, error: 'Server error' });
    }
});

export default router;
