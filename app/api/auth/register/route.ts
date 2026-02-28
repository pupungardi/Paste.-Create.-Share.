
import { NextRequest, NextResponse } from 'next/server';
import { createUser, getUserByEmail, hashPassword, User } from '@/lib/users';
import { nanoid } from 'nanoid';

export async function POST(req: NextRequest) {
  try {
    const { email, password, name } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const existingUser = getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 409 });
    }

    const newUser: User = {
      id: nanoid(),
      email,
      passwordHash: hashPassword(password),
      name,
      createdAt: Date.now(),
    };

    createUser(newUser);

    // In a real app, you'd set a session cookie here
    return NextResponse.json({ success: true, user: { id: newUser.id, email: newUser.email, name: newUser.name } });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
