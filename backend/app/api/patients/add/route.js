import {NextResponse} from 'next/server';
import sql from '../../../../lib/db';
import bcrypt from 'bcryptjs';

export async function POST(req) {
    try {

    } catch (e) {
        return NextResponse.json(
            {error: e}, {status: 500}
        )
    }
}