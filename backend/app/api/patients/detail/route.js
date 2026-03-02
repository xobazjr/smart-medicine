import {NextResponse} from 'next/server';
import sql from '../../../../lib/db';
import bcrypt from 'bcryptjs';

export async function GET(req) {
    try {

    } catch (e) {
        return NextResponse.json(
            {error: e}, {status: 500}
        )
    }
}