
import { NextRequest, NextResponse } from 'next/server';
import { getItem } from '@/lib/db';
import crypto from 'crypto';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const item = getItem(id);

  if (!item) {
    return new NextResponse('Not Found', { status: 404 });
  }

  // Check password protection
  if (item.password) {
    const url = new URL(req.url);
    const password = url.searchParams.get('password');

    if (!password) {
      return new NextResponse('Password Required', { status: 401 });
    }

    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
    if (hashedPassword !== item.password) {
      return new NextResponse('Invalid Password', { status: 401 });
    }
  }

  // Return raw content with appropriate headers
  return new NextResponse(item.content, {
    headers: {
      'Content-Type': 'text/plain',
      'Content-Disposition': `inline; filename="${item.filename}"`,
    },
  });
}
