
import { getItem } from '@/lib/db';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { Calendar, Download, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import ClientCopyButton from '@/components/client-copy-button';
import { highlightCode } from '@/lib/highlight';
import { TypeIcon } from '@/components/type-icon';
import PasswordGate from '@/components/password-gate';
import 'highlight.js/styles/github.css'; // Or any other style

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const item = getItem(id);
  
  if (!item) {
    return {
      title: 'Not Found - Paste. Create. Share.',
    };
  }

  return {
    title: `${item.filename} - Paste. Create. Share.`,
    description: `View ${item.filename} on Paste. Create. Share.`,
  };
}

import SnippetViewer from '@/components/snippet-viewer';

export default async function ViewerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = getItem(id);

  if (!item) {
    notFound();
  }

  const registryUrl = `${process.env.APP_URL || 'http://localhost:3000'}/r/${item.id}`;
  const curlCommand = `curl ${registryUrl} -o ${item.filename || 'snippet.zip'}`;

  // If password protected, don't send content to client initially
  const isLocked = !!item.password;
  
  // Normalize files
  const files = item.files || [{
    filename: item.filename || 'untitled.txt',
    content: item.content || '',
    language: item.language || 'plaintext',
    type: item.type || 'File'
  }];

  return (
    <div className="min-h-screen bg-[#f5f5f5] p-4 md:p-8">
      {item.customCss && (
        <style dangerouslySetInnerHTML={{ __html: item.customCss }} />
      )}
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link 
            href="/"
            className="flex items-center gap-2 text-neutral-500 hover:text-neutral-900 transition-colors font-medium text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Registry
          </Link>
          <div className="text-sm font-mono text-neutral-400">
            ID: {item.id}
          </div>
        </div>

        {/* Main Card */}
        {isLocked ? (
          <div className="p-8 bg-neutral-50/30">
            <PasswordGate 
              id={item.id} 
              filename={item.filename || 'snippet'} 
              language={item.language || 'plaintext'}
              registryUrl={registryUrl}
              curlCommand={curlCommand}
              createdAt={item.createdAt}
              expiresAt={item.expiresAt}
            />
          </div>
        ) : (
          <SnippetViewer 
            id={item.id}
            files={files}
            createdAt={item.createdAt}
            expiresAt={item.expiresAt}
            registryUrl={registryUrl}
            curlCommand={curlCommand}
          />
        )}
      </div>
    </div>
  );
}
