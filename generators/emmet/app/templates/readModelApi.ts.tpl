// app/api/contact/route.ts
import {NextRequest, NextResponse} from 'next/server';
import {<%-readModel%>ReadModel} from "@/app/slices/<%-slice%>/<%-readModel%>Projection";
import {loadPongoClient} from "@/app/common/loadPongoClient";

export async function GET(req: NextRequest, { params }: { params: { <%-idAttribute%>: string }}) {
    try {
        //still async
        const parameters = await params
        const client = loadPongoClient()
        const db = client.db();
        const collection = db.collection<<%-readModel%>ReadModel>("<%-readModel%>-collection")
         const projection = await collection.findOne({
                    _id: parameters.<%-idAttribute%>,
                });
        // make sure not to serialize big ints
         const sanitized = JSON.parse(JSON.stringify(projection, (key, value) =>
               typeof value === 'bigint' ? value.toString() : value
          ));

        return NextResponse.json(sanitized, {status: 200});
    } catch (err) {
        console.error(err);
        return NextResponse.json(
            {ok: false, error: 'Server error'},
            {status: 500}
        );
    }
}
