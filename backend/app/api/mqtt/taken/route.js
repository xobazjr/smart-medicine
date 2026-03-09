import { NextResponse } from 'next/server';
import sql from '../../../../lib/db';

export async function POST(req) {
    try {
        // This endpoint is intended to be called by a backend service (like an MQTT subscriber)
        // or potentially directly if the device could make HTTP requests (but here it uses MQTT).
        // Assuming you have a separate service or a Next.js API route that subscribes to MQTT
        // and forwards the data here, OR this route IS the webhook for the MQTT broker.

        // Based on your firmware code:
        // The device publishes to "medicine_box/taken"
        // The payload is: {"weight":"<diff>","time":"<timestamp>"}
        
        // However, the database table `medication_history` requires:
        // history_id (auto), drug_id, user_id, drug_name, status, meal_period, taken_at, scheduled_date

        // The firmware payload is missing CRITICAL information:
        // - Which user is this? (The device doesn't seem to send a user ID or device ID in the payload)
        // - Which drug was taken? (The device just knows "alarm triggered", not which drug ID)
        
        // To solve this, we need to make some assumptions or lookups.
        // Assumption 1: You have a mapping of Device -> User. 
        // Since the firmware has hardcoded MQTT credentials, maybe we can assume a single user for now 
        // or we need the topic to include the device ID (e.g., "medicine_box/DEVICE_001/taken").
        
        // For this implementation, I will assume the request body includes the necessary IDs.
        // If your MQTT broker forwards the message, you might need to enrich it with the user_id/drug_id 
        // before calling this API, OR we need to look it up here based on the time.

        const body = await req.json();
        
        // We expect the body to contain what the firmware sends + context
        // Firmware sends: { weight: "...", time: "..." }
        // We need: user_id, drug_id (or we find it)

        const { weight, time, user_id, drug_id } = body;

        // If we don't have user_id/drug_id, we can't insert into medication_history correctly.
        // BUT, if we assume the "time" matches a scheduled time for a user, we could try to find it.
        
        // Let's assume for now that the caller of this API (the MQTT bridge) provides the IDs.
        // If you are calling this directly from the ESP8266 (which you aren't, you use MQTT), 
        // you would need to change the firmware to send IDs.

        // Since I cannot change your architecture, I will write the code to insert the data
        // assuming we can get the missing fields or default them.

        // 1. Parse the time
        const takenAt = time ? new Date(time) : new Date();
        
        // 2. Determine status based on weight (simple logic)
        // If weight difference is positive and significant, it's "taken".
        // The firmware sends "weight" as the difference.
        const weightVal = parseFloat(weight);
        const status = weightVal > 1.0 ? 'taken' : 'missed'; // Threshold of 1g

        // 3. Insert into DB
        // We need to handle the case where drug_id/user_id might be missing if the MQTT payload is raw.
        // For now, I will insert with what we have, or fail if critical info is missing.
        
        if (!user_id || !drug_id) {
             // Fallback: Try to find a scheduled drug for this time? 
             // This is risky without more info.
             // Let's just return an error for now to be safe, or log it.
             console.warn("Received MQTT data but missing user_id or drug_id:", body);
             
             // OPTIONAL: If you want to log it anyway for debugging:
             // await sql`INSERT INTO raw_mqtt_logs (payload) VALUES (${JSON.stringify(body)})`;
             
             return NextResponse.json({ error: "Missing user_id or drug_id" }, { status: 400 });
        }

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
                ${drug_id},
                ${user_id},
                (SELECT drug_name FROM drugs WHERE drug_id = ${drug_id}), -- Look up name
                ${status},
                'unknown', -- Firmware doesn't know meal period
                ${takenAt},
                ${takenAt} -- Assuming scheduled for today
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
            { error: "Internal server error", details: error.message },
            { status: 500 }
        );
    }
}