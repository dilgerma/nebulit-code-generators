// app/api/contact/route.ts
import { NextRequest, NextResponse } from 'next/server';
import {<%-command%>Command, handle<%-command%>} from "@/app/slices/<%-slice%>/<%-command%>Command";

export async function POST(req: NextRequest) {
    try {
        const command = (await req.json()) as <%-command%>Command;
        await handle<%-command%>(command.data.<%-idAttribute%>, command)
        return NextResponse.json({ ok: true }, { status: 200 });
    } catch (err) {
        console.error(err);
        return NextResponse.json(
            { ok: false, error: 'Server error' },
            { status: 500 }
        );
    }
}
