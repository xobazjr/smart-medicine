import {NextResponse} from 'next/server';
import sql from '../../../../lib/db';
import bcrypt from 'bcryptjs';

export async function GET(req) {
    try {

        let patients = [];
        const { searchParams } = new URL(req.url);
        const caretaker = searchParams.get('caretaker_name');
        const find_caretaker = await sql`SELECT u.user_id FROM users u WHERE u.username = ${caretaker}`;
        const find_patient_from_caretaker = await sql`SELECT u.user_id FROM users u WHERE u.caretaker_id = ${find_caretaker[0].user_id}`;

        for (let i = 0; i < find_patient_from_caretaker.length; i++) {
            const userId = find_patient_from_caretaker[i].user_id;
            const user = await sql`select * from users u where u.user_id = ${userId}`;
            patients.push({
               username: user[0].username
            });
        }

        return NextResponse.json(patients);

    } catch (e) {
        return NextResponse.json(
            {error: e}, {status: 500}
        )
    }
}