import { NextResponse } from 'next/server';
import sql from '../../../../lib/db';

export async function POST(req) {
    try {

        const body = await req.json();
        console.log("Incoming body:", body);

        const { weight, time, user_id, drug_id } = body;

        // parse time
        const takenAt = time ? new Date(time) : new Date();

        // determine status
        const weightVal = parseFloat(weight);
        const status = weightVal > 1.0 ? 'taken' : 'missed';

        // --- ensure valid user_id ---
        let uid = user_id;
        if (!uid) {
            const user = await sql`SELECT user_id FROM users LIMIT 1`;
            if (!user.length) {
                return NextResponse.json(
                    { error: "No users found in database" },
                    { status: 400 }
                );
            }
            uid = user[0].user_id;
        }

        // --- ensure valid drug_id ---
        let did = drug_id;
        if (!did) {
            const drug = await sql`SELECT drug_id, drug_name FROM drugs LIMIT 1`;
            if (!drug.length) {
                return NextResponse.json(
                    { error: "No drugs found in database" },
                    { status: 400 }
                );
            }
            did = drug[0].drug_id;
        }

        // get drug name safely
        const drugInfo = await sql`
            SELECT drug_name FROM drugs WHERE drug_id = ${did}
        `;

        const drugName = drugInfo.length ? drugInfo[0].drug_name : "unknown";

        const newHistory = await sql`
            INSERT INTO medication_history (
                drug_id,
                user_id,
                drug_name,
                status,
                meal_period,
                taken_at,
                scheduled_date
            ) VALUES (
                ${did},
                ${uid},
                ${drugName},
                ${status},
                'unknown',
                ${takenAt},
                ${takenAt}
            )
            RETURNING history_id
        `;

        return NextResponse.json({
            success: true,
            history_id: newHistory[0].history_id
        });

    } catch (error) {

        console.error("MQTT Taken Error:", error);

        return NextResponse.json(
            {
                error: "Internal server error",
                details: error.message
            },
            { status: 500 }
        );
    }
}