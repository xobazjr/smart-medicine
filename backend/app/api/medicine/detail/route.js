import {NextResponse} from 'next/server';
import sql from '../../../../lib/db';

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const drugId = searchParams.get('drugId');
        const drug = await sql`select * from drugs where drug_id = ${drugId}`;
        return NextResponse.json(drug);
    }
    catch (e) {
        return NextResponse.json(
            {error: e, status: 500}
        )
    }
}