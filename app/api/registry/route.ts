
import { NextRequest, NextResponse } from 'next/server';
import { saveItem, RegistryItem } from '@/lib/db';
import { nanoid } from 'nanoid';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { content, filename, language, duration, type, customCss, password, files } = body;

    if (!content && (!files || files.length === 0)) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    let expiresAt: number | undefined;
    if (duration && duration !== 'never') {
      const durationMs = parseInt(duration);
      if (!isNaN(durationMs)) {
        expiresAt = Date.now() + durationMs;
      }
    }

    let hashedPassword: string | undefined;
    if (password) {
      hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
    }

    const id = nanoid(10);
    
    // Construct files array
    let registryFiles = files;
    if (!registryFiles || registryFiles.length === 0) {
      registryFiles = [{
        content,
        filename: filename || 'untitled.txt',
        language: language || 'plaintext',
        type: type || 'File',
      }];
    }

    const newItem: RegistryItem = {
      id,
      files: registryFiles,
      createdAt: Date.now(),
      expiresAt,
      password: hashedPassword,
      // Legacy fields
      content: registryFiles[0].content,
      filename: registryFiles[0].filename,
      language: registryFiles[0].language,
      type: registryFiles[0].type,
      customCss,
    };

    saveItem(newItem);

    return NextResponse.json({ success: true, id, url: `/r/${id}` });
  } catch (error) {
    console.error('Error saving item:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
