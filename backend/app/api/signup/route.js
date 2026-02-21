import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export async function POST(request) {
  try {
    const { username, password, tel, role } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: "Username and password are required" }, { status: 400 });
    }

    // 1. Hash the password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // 2. Generate a unique user_id
    // Since your database column 'user_id' is NOT NULL and not auto-generating, 
    // we generate a UUID here in the code.
    const user_id = crypto.randomUUID();

    // 3. Insert into Supabase matching your schema
    const { data, error } = await supabase
      .from('users')
      .insert([
        { 
          user_id,
          username, 
          password_hash, 
          tel: tel || null, 
          role: role || 'patient'
        }
      ])
      .select();

    if (error) {
      throw error;
    }

    return NextResponse.json({ 
      message: "User created successfully!", 
      user: {
        user_id: data[0].user_id,
        username: data[0].username,
        role: data[0].role
      }
    });
  } catch (error) {
    console.error("Signup Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
