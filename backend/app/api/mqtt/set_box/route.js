import { NextResponse } from 'next/server';
import sql from '../../../../lib/db';
import jwt from 'jsonwebtoken';
import mqtt from 'mqtt';

export async function POST(req) {
    try {
        // 1. Verify the token
        const authHeader = req.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json(
                { error: 'Unauthorized: Missing or invalid token' },
                { status: 401 }
            );
        }

        const token = authHeader.split(' ')[1];
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret_key');
        } catch (err) {
            return NextResponse.json(
                { error: 'Unauthorized: Invalid token' },
                { status: 401 }
            );
        }

        const body = await req.json();
        const {
            username,
            alarms, // Array of { name: "Morning", time: "08:00" }
            start_date, start_time, total_drugs,
            each_taken, description, warning, image_url,
            take_morning, take_noon, take_evening, take_bedtime,
            timing, frequency
        } = body;

        // Default drug_name to "Box Routine" if not provided, so it doesn't break the DB insert
        const drug_name = body.drug_name || "Box Routine";

        const user_id_result = await sql`select user_id from users where username = ${username}`;

        if (!user_id_result || user_id_result.length === 0 || !user_id_result[0].user_id) {
            return NextResponse.json(
                { error: "User id is invalid", status: 204 },
                { status: 204 }
            )
        }

        const user_id = user_id_result[0].user_id;

        // 2. Save to Database
        const newMedicine = await sql`
            INSERT INTO drugs (
                drug_name, start_date, start_time, total_drugs,
                each_taken, description, warning, image_url,
                take_morning, take_noon, take_evening, take_bedtime,
                timing, frequency, user_id
            ) VALUES (
                ${drug_name}, ${start_date || ""}, ${start_time || ""},
                ${total_drugs || 0}, ${each_taken || 0}, ${description || ""},
                ${warning || ""}, ${image_url || ""}, ${take_morning || 0},
                ${take_noon || 0}, ${take_evening || 0}, ${take_bedtime || 0},
                ${timing || "after"}, ${frequency || "daily"}, ${user_id}
            ) RETURNING drug_id`;

        // 3. Send Alarms to ESP8266 via MQTT
        await new Promise((resolve, reject) => {
            const client = mqtt.connect('mqtts://l2901b8a.ala.asia-southeast1.emqxsl.com:8883', {
                username: 'mqtt_to_nextjs',
                password: 'mqtt_to_nextjs',
                clientId: `nextjs_${Math.random().toString(16).slice(3)}`
            });

            client.on('connect', () => {
                console.log("MQTT Connected!");

                // Step A: Clear existing alarms on the machine
                client.publish('medicine/clear_alarm', 'clear');

                // Step B: Set new alarms
                if (alarms && Array.isArray(alarms)) {
                    // Limit to 7 to match MAX_ALARMS on the ESP8266
                    const alarmsToSet = alarms.slice(0, 7);

                    alarmsToSet.forEach(alarm => {
                        if (!alarm.time) return;

                        // Parse "07:30" into 7 and 30
                        const [h, m] = alarm.time.split(':').map(Number);

                        // Use the alarm label (e.g., "Box 1" or "Morning") and ensure it's under 12 chars
                        const safeName = (alarm.name || "Meds").substring(0, 11);

                        const payload = JSON.stringify({
                            name: safeName,
                            h: h,
                            m: m
                        });

                        // Publish to the topic the ESP8266 is listening to
                        client.publish('medicine/set_alarm', payload);
                    });
                }

                // Add a small delay to ensure all payloads are sent before closing the connection
                setTimeout(() => {
                    client.end();
                    resolve(true);
                }, 500);
            });

            client.on('error', (err) => {
                console.error('MQTT Connection Error:', err);
                client.end();
                resolve(false);
            });
        });

        return NextResponse.json(
            {
                message: "Routine created and sent to hardware successfully",
                drug_id: newMedicine[0].drug_id
            }, { status: 201 }
        );
    }
    catch (e) {
        console.error(e);
        return NextResponse.json(
            { error: e.message, status: 500 },
            { status: 500 }
        )
    }
}