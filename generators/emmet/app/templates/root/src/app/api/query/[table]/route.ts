// app/api/contact/route.ts
import {NextRequest, NextResponse} from 'next/server';
import {requireUser} from "@/app/supabase/requireUser";
import {loadPongoClient} from "@/app/common/loadPongoClient";

/*
example: http://localhost:54321/rest/v1/CartsWithProducts-collection?select=data:data->data->0&_id=eq.16
*/
export async function GET(req: NextRequest, {params}: { params: { table: string } }) {
    const principal = await requireUser(false)
    if (principal.error) {
        return principal
    }
    try {

        const parameters = await params
        const client = loadPongoClient()
        const db = client.db();
        const collection = db.collection<any>(parameters.table)


        const queryObject: Record<string, string> = {};

        const searchParams = new URLSearchParams(req.nextUrl.search)
        for (const [key, value] of searchParams.entries()) {
            queryObject[key] = value;
        }

        if (Object.keys(queryObject).length > 0) {
            const projection = await collection.findOne({
                ...queryObject
            });

            const data = {data: projection?.data}
            return NextResponse.json(sanitizeJson(data), {status: projection ? 200 : 404});
        } else {
            const projection = await collection.find({})
            const data = {data: projection.map(it => it.data)}
            return NextResponse.json(sanitizeJson(data), {status: 200});
        }

    } catch (err) {
        console.error
        (err);
        return NextResponse.json(
            {ok: false, error: 'Server error'},
            {status: 500}
        );
    }
}


function sanitizeJson(record: Record<string,any>) {
    return JSON.parse(JSON.stringify(record, (key, value) => typeof value == "bigint" ? value.toString() : value));
}