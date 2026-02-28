import { NextRequest, NextResponse } from 'next/server';
import { getItem } from '@/lib/db';
import crypto from 'crypto';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { password } = await req.json();
    const item = getItem(id);

    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    if (!item.password) {
      // If no password set, just return content
      return NextResponse.json({ content: item.content });
    }

    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');

    if (hashedPassword !== item.password) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }

    return NextResponse.json({ content: item.content, files: item.files });
  } catch (error) {
    console.error('Error verifying password:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
