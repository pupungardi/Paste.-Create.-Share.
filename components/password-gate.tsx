'use client';

import { useState } from 'react';
import { Lock, ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { highlightCode } from '@/lib/highlight';
import ClientCopyButton from '@/components/client-copy-button';
import { Download } from 'lucide-react';

import SnippetViewer from '@/components/snippet-viewer';

interface PasswordGateProps {
  id: string;
  filename: string;
  language: string;
  registryUrl: string;
  curlCommand: string;
  createdAt: number;
  expiresAt?: number;
}

export default function PasswordGate({ id, filename, language, registryUrl, curlCommand, createdAt, expiresAt }: PasswordGateProps) {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [files, setFiles] = useState<any[] | null>(null);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/registry/${id}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        throw new Error('Invalid password');
      }

      const data = await response.json();
      
      // Handle legacy content response or new files response
      if (data.files) {
        setFiles(data.files);
      } else if (data.content) {
        setFiles([{
          filename,
          content: data.content,
          language,
          type: 'File'
        }]);
      }
      
      toast.success('Access granted');
    } catch (error) {
      toast.error('Invalid password');
      setPassword('');
    } finally {
      setIsLoading(false);
    }
  };

  if (files) {
    return (
      <SnippetViewer 
        id={id}
        files={files}
        createdAt={createdAt}
        expiresAt={expiresAt}
        registryUrl={registryUrl}
        curlCommand={curlCommand}
        password={password}
      />
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden p-8 md:p-12 text-center max-w-md mx-auto">
      <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <Lock className="w-8 h-8 text-neutral-400" />
      </div>
      
      <h2 className="text-2xl font-bold text-neutral-900 mb-2">Password Protected</h2>
      <p className="text-neutral-500 mb-8">This snippet is protected by a password.</p>

      <form onSubmit={handleVerify} className="space-y-4">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter password"
          className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-neutral-400 focus:ring-2 focus:ring-neutral-100 outline-none transition-all"
          autoFocus
        />
        
        <button
          type="submit"
          disabled={isLoading || !password}
          className="w-full bg-neutral-900 hover:bg-neutral-800 text-white px-6 py-3 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Verifying...
            </>
          ) : (
            <>
              Unlock Snippet
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
