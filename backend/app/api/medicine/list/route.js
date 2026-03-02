import {NextResponse} from 'next/server';
import sql from '../../../lib/db';

export async function GET(req) {
    try {
        // const query = await sql`SELECT d.drug_name, d.drug_id, d.warning FROM drugs d
        //                         JOIN WHERE username = ${}`
    }
    catch (e) {
        return NextResponse.json(
            {error: e, status: 500}
        )
    }
}