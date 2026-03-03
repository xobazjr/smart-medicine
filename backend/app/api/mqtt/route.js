import { NextResponse } from 'next/server';
import sql from '../../../lib/db';

export async function POST(req) {
    try {
        const body = await req.json();

        const { timestamp } = body;

        if (!timestamp) {
            return NextResponse.json({
                status: 400,
                error: "Key 'timestamp' not found in request body"
            }, { status: 400 });
        }

        await sql`UPDATE board_status SET timestamp = ${timestamp} WHERE name = 'esp8266_xbjr'`;
        return NextResponse.json({ status: 200, success: true }, { status: 200 } )
    } catch (e) {
        return NextResponse.json({
           status: 500, error: e
        }, {
            status: 500
        });
    }
}