import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import mqtt from 'mqtt';

export async function POST(req) {
    try {
        // 1. Verify the token (keeps your API secure)
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

        // 2. Extract only what the hardware needs
        const body = await req.json();
        const { alarms } = body;

        // 3. Send Alarms directly to ESP8266 via MQTT
        await new Promise((resolve, reject) => {
            const client = mqtt.connect('mqtts://l2901b8a.ala.asia-southeast1.emqxsl.com:8883', {
                username: 'mqtt_to_nextjs',
                password: 'mqtt_to_nextjs',
                clientId: `nextjs_${Math.random().toString(16).slice(3)}`
            });

            client.on('connect', () => {
                console.log("MQTT Connected! Bypassing DB and sending to hardware...");

                // Step A: Clear existing alarms on the machine
                client.publish('medicine/clear_alarm', 'clear');

                // Step B: Set new alarms
                if (alarms && Array.isArray(alarms)) {
                    // Limit to 7 to match MAX_ALARMS on the ESP8266
                    const alarmsToSet = alarms.slice(0, 7);

                    alarmsToSet.forEach(alarm => {
                        if (!alarm.time) return;

                        const [h, m] = alarm.time.split(':').map(Number);
                        const safeName = (alarm.name || "Meds").substring(0, 11);

                        const payload = JSON.stringify({
                            name: safeName,
                            h: h,
                            m: m
                        });

                        client.publish('medicine/set_alarm', payload);
                    });
                }

                // Add a small delay to ensure all payloads are sent
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
            { message: "Success! Alarms sent directly to hardware." },
            { status: 200 }
        );
    }
    catch (e) {
        console.error(e);
        return NextResponse.json(
            { error: e.message, status: 500 },
            { status: 500 }
        );
    }
}