// base template by gemini


import { NextResponse } from 'next/server';
import sql from '../../../lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request) {
    try {
        // 1. Get the data sent from the frontend
        const body = await request.json();
        const { username, password, tel, role, caretaker_id } = body;

        // 2. Basic validation to make sure we have the required fields
        if (!username || !password) {
            return NextResponse.json(
                { error: "Username and password are required" },
                { status: 400 }
            );
        }

        // 3. Check if the username is already taken
        const existingUser = await sql`SELECT username FROM users WHERE username = ${username} LIMIT 1`;

        if (existingUser.length > 0) {
            return NextResponse.json(
                { error: "Username is already taken" },
                { status: 409 } // 409 Conflict is the standard status for duplicates
            );
        }

        // 4. Hash the password securely
        const saltRounds = 10;
        const password_hash = await bcrypt.hash(password, saltRounds);

        // 5. Insert the new user into the database
        // We use RETURNING at the end to instantly get the newly created user's data back
        const newUser = await sql`
            INSERT INTO users (
                username, 
                password_hash, 
                tel, 
                role, 
                caretaker_id
            ) VALUES (
                ${username}, 
                ${password_hash}, 
                ${tel || null}, 
                ${role || 'user'}, 
                ${caretaker_id || null}
            ) 
            RETURNING user_id, username, role, tel;
        `;

        // 6. Return success message and the new user's safe data (no password hash!)
        return NextResponse.json({
            message: "User created successfully!",
            user: newUser[0]
        }, { status: 201 }); // 201 Created is the standard status for successful inserts

    } catch (error) {
        console.error("Signup Error:", error);
        return NextResponse.json(
            { error: "Internal server error", details: error.message },
            { status: 500 }
        );
    }
}