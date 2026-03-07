import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import mqtt from 'mqtt';

export async function POST(req) {
    try {

        const authHeader = req.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json(
                { error: 'Unauthorized: Missing or invalid token' },
                { status: 401 }
            );
        }

        const token = authHeader.split(' ')[1];
        try {
            jwt.verify(token, process.env.JWT_SECRET || 'default_secret_key');
        } catch (err) {
            return NextResponse.json(
                { error: 'Unauthorized: Invalid token' },
                { status: 401 }
            );
        }

        const body = await req.json();
        const { alarms } = body;

        await new Promise((resolve) => {

            const client = mqtt.connect('mqtts://l2901b8a.ala.asia-southeast1.emqxsl.com:8883', {
                username: 'mqtt_to_nextjs',
                password: 'mqtt_to_nextjs',
                clientId: `nextjs_${Math.random().toString(16).slice(3)}`
            });

            client.on('connect', async () => {

                console.log("MQTT Connected! Sending alarms slowly...");

                // CLEAR OLD ALARMS
                client.publish('medicine/clear_alarm', 'clear');

                // wait longer so EEPROM wipe completes
                await new Promise(r => setTimeout(r, 3000));

                if (alarms && Array.isArray(alarms)) {

                    const alarmsToSet = alarms.slice(0, 7);

                    for (const alarm of alarmsToSet) {

                        if (!alarm.time) continue;

                        const [h, m] = alarm.time.split(':').map(Number);
                        const safeName = (alarm.name || "Meds").substring(0, 11);

                        const payload = JSON.stringify({
                            name: safeName,
                            h: h,
                            m: m
                        });

                        console.log("Sending:", payload);

                        client.publish('medicine/set_alarm', payload);

                        // small buffer flush delay
                        await new Promise(r => setTimeout(r, 300));

                        // MAIN delay so Arduino can process
                        await new Promise(r => setTimeout(r, 3000));
                    }
                }

                client.end();
                resolve(true);
            });

            client.on('error', (err) => {
                console.error('MQTT Connection Error:', err);
                client.end();
                resolve(false);
            });

        });

        return NextResponse.json(
            { message: "Success! Alarms synced perfectly to the medicine box." },
            { status: 200 }
        );

    } catch (e) {

        console.error(e);

        return NextResponse.json(
            { error: e.message },
            { status: 500 }
        );

    }
}