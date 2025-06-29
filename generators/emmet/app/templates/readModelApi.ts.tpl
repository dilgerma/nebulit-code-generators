// app/api/contact/route.ts
import {NextRequest, NextResponse} from 'next/server';
import {<%-readModel%>ReadModel} from "@/app/slices/<%-slice%>/<%-readModel%>Projection";
import {loadPongoClient} from "@/app/common/loadPongoClient";

export async function GET(req: NextRequest) {
    try {
        const client = loadPongoClient()
        const db = client.db();
        const collection = db.collection<<%-readModel%>ReadModel>("<%-readModel%>-collection")
        const projection = await collection.find();

        return NextResponse.json(projection, {status: 200});
    } catch (err) {
        console.error(err);
        return NextResponse.json(
            {ok: false, error: 'Server error'},
            {status: 500}
        );
    }
}
