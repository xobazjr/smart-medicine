// base template by gemini

import { NextResponse } from 'next/server';
import sql from '../../../lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request) {
    try {
        const body = await request.json();
        // เพิ่มฟิลด์ให้ตรงกับตารางที่คุณมีในรูปภาพ (tel, webhooks)
        const { username, password, tel, role, caretaker_id, webhook_url_discord, webhook_url_line } = body;

        if (!username || !password) {
            return NextResponse.json(
                { error: "Username and password are required" },
                { status: 400 }
            );
        }

        // 3. ตรวจสอบ Username ซ้ำ
        const existingUser = await sql`SELECT username FROM users WHERE username = ${username} LIMIT 1`;
        if (existingUser.length > 0) {
            return NextResponse.json(
                { error: "Username is already taken" },
                { status: 409 }
            );
        }

        // 4. Hash Password
        const saltRounds = 10;
        const password_hash = await bcrypt.hash(password, saltRounds);

        // 5. Insert ข้อมูล (ลบ user_id ออกเพื่อให้ DB สร้าง UUID ให้เองอัตโนมัติ)
        const newUser = await sql`
            INSERT INTO users (
                username, 
                password_hash, 
                tel, 
                role, 
                caretaker_id,
                webhook_url_discord,
                webhook_url_line
            ) VALUES (
                ${username}, 
                ${password_hash}, 
                ${tel || null}, 
                ${role || 'user'}, 
                ${caretaker_id || null},
                ${webhook_url_discord || null},
                ${webhook_url_line || null}
            ) 
            RETURNING user_id, username, role, tel;
        `;

        return NextResponse.json({
            message: "User created successfully!",
            user: newUser[0]
        }, { status: 201 });

    } catch (error) {
        console.error("Signup Error:", error);
        return NextResponse.json(
            { error: "Internal server error", details: error.message },
            { status: 500 }
        );
    }
}