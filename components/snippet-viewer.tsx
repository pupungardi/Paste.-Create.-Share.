'use client';

import { useState } from 'react';
import { Calendar, Download, File, Box, Code, Library, Copy, Check } from 'lucide-react';
import ClientCopyButton from '@/components/client-copy-button';
import { TypeIcon } from '@/components/type-icon';
import { highlightCode } from '@/lib/highlight';

interface RegistryFile {
  filename: string;
  content: string;
  language: string;
  type: string;
}

interface SnippetViewerProps {
  id: string;
  files: RegistryFile[];
  createdAt: number;
  expiresAt?: number;
  registryUrl: string;
  curlCommand: string;
  password?: string; // If provided, it means we are authenticated
}

export default function SnippetViewer({ 
  id, 
  files, 
  createdAt, 
  expiresAt, 
  registryUrl, 
  curlCommand,
  password 
}: SnippetViewerProps) {
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const activeFile = files[activeFileIndex] || files[0];

  const date = new Date(createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const expirationDate = expiresAt ? new Date(expiresAt).toLocaleString() : null;
  const highlightedCode = highlightCode(activeFile.content, activeFile.language);

  // If password is provided, append it to URLs
  const downloadUrl = `/r/${id}?password=${encodeURIComponent(password || '')}`;
  const registryUrlWithAuth = password ? `${registryUrl}?password=${encodeURIComponent(password)}` : registryUrl;
  const curlCommandWithAuth = password ? `${curlCommand}?password=${encodeURIComponent(password)}` : curlCommand;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
      {/* File Tabs */}
      {files.length > 1 && (
        <div className="flex items-center gap-1 px-2 pt-2 bg-neutral-50/50 border-b border-neutral-100 overflow-x-auto">
          {files.map((file, index) => (
            <button
              key={index}
              onClick={() => setActiveFileIndex(index)}
              className={`group relative flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-t-lg border-t border-x transition-all ${
                activeFileIndex === index 
                  ? 'bg-white border-neutral-200 text-neutral-900 -mb-px pb-2.5 z-10' 
                  : 'bg-transparent border-transparent text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100/50'
              }`}
            >
              <TypeIcon type={file.type} className="w-3 h-3" />
              <span className="max-w-[150px] truncate">{file.filename || 'Untitled'}</span>
            </button>
          ))}
        </div>
      )}

      {/* Toolbar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 bg-neutral-50/50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white border border-neutral-200 rounded-lg">
            <TypeIcon type={activeFile.type || 'File'} className="w-5 h-5 text-neutral-600" />
          </div>
          <div>
            <h1 className="font-semibold text-neutral-900">{activeFile.filename}</h1>
            <div className="flex items-center gap-2 text-xs text-neutral-500">
              <Calendar className="w-3 h-3" />
              {date}
              <span className="text-neutral-300">•</span>
              <span>{activeFile.language}</span>
              {activeFile.type && (
                <>
                  <span className="text-neutral-300">•</span>
                  <span className="bg-neutral-100 px-1.5 py-0.5 rounded text-neutral-600">{activeFile.type}</span>
                </>
              )}
              {expirationDate && (
                <>
                  <span className="text-neutral-300">•</span>
                  <span className="text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">Expires: {expirationDate}</span>
                </>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <ClientCopyButton content={activeFile.content} />
          <a 
            href={downloadUrl} 
            download={activeFile.filename}
            className="flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Download</span>
          </a>
        </div>
      </div>

      {/* Code Viewer */}
      <div className="relative overflow-x-auto">
        <pre className="p-6 text-sm font-mono leading-relaxed text-neutral-800 bg-white min-w-full">
          <code dangerouslySetInnerHTML={{ __html: highlightedCode }} />
        </pre>
      </div>

      {/* Usage Info */}
      <div className="p-6 bg-neutral-50 border-t border-neutral-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-sm">
            <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">Registry URL</h3>
            <div className="flex gap-2">
              <div className="flex-1 bg-neutral-50 border border-neutral-200 rounded-lg p-2 font-mono text-xs text-neutral-600 break-all flex items-center">
                {registryUrlWithAuth}
              </div>
              <ClientCopyButton content={registryUrlWithAuth} />
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-sm">
            <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">Quick Import</h3>
            <div className="flex gap-2">
              <div className="flex-1 bg-neutral-900 text-neutral-100 rounded-lg p-2 font-mono text-xs break-all flex items-center">
                {curlCommandWithAuth}
              </div>
              <ClientCopyButton content={curlCommandWithAuth} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
