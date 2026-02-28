'use client';

import { TypeIcon } from '@/components/type-icon';
import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Copy, Check, FileCode, ArrowRight, Loader2, Share2, Terminal, Trash2, Upload, Clock, Box, File, Code, Library, Plus, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { detectLanguage, getExtensionForLanguage } from '@/lib/highlight';
import { EXPIRATION_OPTIONS, TYPE_OPTIONS, TYPE_CONFIG, LANGUAGES } from '@/lib/data';

export default function Home() {
  const [files, setFiles] = useState<{
    id: string;
    content: string;
    filename: string;
    language: string;
    type: string;
    isManuallyNamed: boolean;
  }[]>([{
    id: '1',
    content: '',
    filename: '',
    language: 'plaintext',
    type: 'File',
    isManuallyNamed: false
  }]);
  const [activeFileId, setActiveFileId] = useState('1');
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishedId, setPublishedId] = useState<string | null>(null);
  const [registryUrl, setRegistryUrl] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [expiration, setExpiration] = useState('never');
  const [password, setPassword] = useState('');
  const [isPasswordEnabled, setIsPasswordEnabled] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const activeFile = files.find(f => f.id === activeFileId) || files[0];
  const typeConfig = TYPE_CONFIG[activeFile.type] || TYPE_CONFIG.File;

  // Debounced language detection for active file
  useEffect(() => {
    const timer = setTimeout(() => {
      if (activeFile.content.trim() && !activeFile.isManuallyNamed) {
        const lang = detectLanguage(activeFile.content);
        const ext = getExtensionForLanguage(lang);
        
        setFiles(prev => prev.map(f => {
          if (f.id === activeFileId) {
            return {
              ...f,
              language: lang,
              filename: `snippet.${ext}`
            };
          }
          return f;
        }));
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [activeFile.content, activeFile.isManuallyNamed, activeFileId]);

  const updateActiveFile = (updates: Partial<typeof activeFile>) => {
    setFiles(prev => prev.map(f => f.id === activeFileId ? { ...f, ...updates } : f));
  };

  const handleFilenameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateActiveFile({
      filename: e.target.value,
      isManuallyNamed: true
    });
  };

  const addNewFile = () => {
    const newId = Math.random().toString(36).substr(2, 9);
    setFiles(prev => [...prev, {
      id: newId,
      content: '',
      filename: '',
      language: 'plaintext',
      type: 'File',
      isManuallyNamed: false
    }]);
    setActiveFileId(newId);
  };

  const removeFile = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (files.length === 1) {
      // If it's the last file, just clear it
      setFiles([{
        id: '1',
        content: '',
        filename: '',
        language: 'plaintext',
        type: 'File',
        isManuallyNamed: false
      }]);
      setActiveFileId('1');
      return;
    }

    const newFiles = files.filter(f => f.id !== id);
    setFiles(newFiles);
    if (activeFileId === id) {
      setActiveFileId(newFiles[newFiles.length - 1].id);
    }
  };

  const handlePublish = async () => {
    if (files.every(f => !f.content.trim())) {
      toast.error('Please enter some content first');
      return;
    }

    setIsPublishing(true);
    try {
      const response = await fetch('/api/registry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          files: files.map(f => ({
            content: f.content,
            filename: f.filename || 'snippet.txt',
            language: f.language,
            type: f.type
          })),
          duration: expiration,
          password: isPasswordEnabled ? password : undefined,
        }),
      });

      if (!response.ok) throw new Error('Failed to publish');

      const data = await response.json();
      setPublishedId(data.id);
      
      // Construct the full URL
      const origin = window.location.origin;
      setRegistryUrl(`${origin}/r/${data.id}`);
      
      toast.success('Published successfully!');
    } catch (error) {
      toast.error('Failed to publish snippet');
      console.error(error);
    } finally {
      setIsPublishing(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const reset = () => {
    setPublishedId(null);
    setRegistryUrl('');
    setFiles([{
      id: '1',
      content: '',
      filename: '',
      language: 'plaintext',
      type: 'File',
      isManuallyNamed: false
    }]);
    setActiveFileId('1');
    setExpiration('never');
    setPassword('');
    setIsPasswordEnabled(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length === 0) return;

    const newFiles: {
      id: string;
      content: string;
      filename: string;
      language: string;
      type: string;
      isManuallyNamed: boolean;
    }[] = [];

    for (const file of droppedFiles) {
      if (file.size > 1024 * 1024) { // 1MB limit check
        toast.error(`File ${file.name} is too large (max 1MB)`);
        continue;
      }

      try {
        const text = await file.text();
        const lang = detectLanguage(text);
        newFiles.push({
          id: Math.random().toString(36).substr(2, 9),
          content: text,
          filename: file.name,
          language: lang,
          type: 'File',
          isManuallyNamed: true
        });
      } catch (error) {
        toast.error(`Failed to read file ${file.name}`);
      }
    }

    if (newFiles.length > 0) {
      setFiles(prev => {
        // If the current file is empty and unnamed, replace it
        if (prev.length === 1 && !prev[0].content && !prev[0].filename) {
          return newFiles;
        }
        return [...prev, ...newFiles];
      });
      setActiveFileId(newFiles[0].id);
      toast.success(`${newFiles.length} file(s) loaded`);
    }
  };

  return (
    <main className="min-h-screen p-4 md:p-8 lg:p-12 flex flex-col items-center justify-center">
      <div className="w-full max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[60px] leading-[60px] font-serif font-semibold text-[oklab(0.205_-0.00000207871_0.00000478327_/_0.8)]"
          >
            Paste. Create. Share.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-neutral-500 font-light"
          >
            Turn any file into a registry URL.
          </motion.p>
        </div>

        <AnimatePresence mode="wait">
          {!publishedId ? (
            <motion.div 
              key="editor"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`bg-white rounded-2xl shadow-sm border transition-colors overflow-hidden ${isDragging ? 'border-neutral-400 ring-2 ring-neutral-200' : 'border-neutral-200'}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {/* File Tabs */}
              <div className="flex items-center gap-1 px-2 pt-2 bg-neutral-50/50 border-b border-neutral-100 overflow-x-auto">
                {files.map(file => (
                  <button
                    key={file.id}
                    onClick={() => setActiveFileId(file.id)}
                    className={`group relative flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-t-lg border-t border-x transition-all ${
                      activeFileId === file.id 
                        ? 'bg-white border-neutral-200 text-neutral-900 -mb-px pb-2.5 z-10' 
                        : 'bg-transparent border-transparent text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100/50'
                    }`}
                  >
                    <TypeIcon type={file.type} className="w-3 h-3" />
                    <span className="max-w-[100px] truncate">{file.filename || 'Untitled'}</span>
                    <span 
                      onClick={(e) => removeFile(file.id, e)}
                      className={`opacity-0 group-hover:opacity-100 p-0.5 rounded-full hover:bg-neutral-200 transition-all ${files.length === 1 ? 'hidden' : ''}`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
                      </svg>
                    </span>
                  </button>
                ))}
                <button
                  onClick={addNewFile}
                  className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-neutral-600 transition-colors ml-1"
                  title="Add new file"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Toolbar */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100 bg-white">
                <div className="flex items-center gap-2 w-full max-w-md">
                  <TypeIcon type={activeFile.type} className="w-4 h-4 text-neutral-400" />
                  <div className="flex items-center gap-2 w-full">
                    <span className="items-center gap-2 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 hidden md:flex text-xs text-neutral-500 font-medium">
                      {typeConfig.label}
                    </span>
                    <span className="text-neutral-400 flex items-center gap-2 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 text-xs">
                      {typeConfig.prefix}
                    </span>
                    <input
                      data-slot="input-group-control"
                      type="text"
                      placeholder={typeConfig.placeholder}
                      value={activeFile.filename}
                      onChange={handleFilenameChange}
                      className="file:text-neutral-900 placeholder:text-neutral-400 selection:bg-neutral-900 selection:text-white border-neutral-200 h-9 w-full min-w-0 px-0 py-1 transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-neutral-400 focus-visible:ring-neutral-400/50 aria-invalid:ring-red-500/20 aria-invalid:border-red-500 flex-1 rounded-none border-0 bg-transparent shadow-none focus-visible:ring-0 font-mono text-sm"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {/* Type Selector */}
                  <div className="flex items-center gap-2">
                    <span className="text-neutral-500 flex items-center gap-2 text-sm [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" className="h-4 w-4">
                        <rect width="256" height="256" fill="none"></rect>
                        <line x1="208" y1="128" x2="128" y2="208" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="32"></line>
                        <line x1="192" y1="40" x2="40" y2="192" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="32"></line>
                      </svg>
                      <span className="text-xs hidden md:inline">Type:</span>
                    </span>
                    <div className="relative flex items-center">
                      <select
                        value={activeFile.type}
                        onChange={(e) => updateActiveFile({ type: e.target.value })}
                        className="appearance-none bg-transparent font-medium transition-all disabled:pointer-events-none disabled:opacity-50 outline-none hover:bg-neutral-100 py-1 text-sm shadow-none flex items-center h-6 gap-1 px-2 pr-6 rounded cursor-pointer text-neutral-900"
                      >
                        {TYPE_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-1 pointer-events-none text-neutral-500">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-down h-3 w-3 transition-transform">
                          <path d="m6 9 6 6 6-6"></path>
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Language Selector */}
                  <div className="flex items-center gap-2">
                    <span className="text-neutral-500 flex items-center gap-2 text-sm [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4">
                      <Code className="h-4 w-4" />
                      <span className="text-xs hidden md:inline">Language:</span>
                    </span>
                    <div className="relative flex items-center">
                      <select
                        value={activeFile.language}
                        onChange={(e) => updateActiveFile({ language: e.target.value })}
                        className="appearance-none bg-transparent font-medium transition-all disabled:pointer-events-none disabled:opacity-50 outline-none hover:bg-neutral-100 py-1 text-sm shadow-none flex items-center h-6 gap-1 px-2 pr-6 rounded cursor-pointer text-neutral-900"
                      >
                        {LANGUAGES.map((lang) => (
                          <option key={lang} value={lang}>
                            {lang === 'plaintext' ? 'Plain Text' : 
                             lang === 'tsx' ? 'TSX' :
                             lang === 'jsx' ? 'JSX' :
                             lang === 'json' ? 'JSON' :
                             lang === 'css' ? 'CSS' :
                             lang === 'typescript' ? 'TypeScript' :
                             lang === 'javascript' ? 'JavaScript' :
                             lang === 'markdown' ? 'Markdown' :
                             lang.charAt(0).toUpperCase() + lang.slice(1)}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-1 pointer-events-none text-neutral-500">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-down h-3 w-3 transition-transform">
                          <path d="m6 9 6 6 6-6"></path>
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Editor Area */}
              <div className="relative group">
                <textarea
                  data-slot="input-group-control"
                  ref={textareaRef}
                  value={activeFile.content}
                  onChange={(e) => updateActiveFile({ content: e.target.value })}
                  placeholder={`// Paste your code here...\n// Or drag and drop a file here.`}
                  className="border-input placeholder:text-neutral-400 focus-visible:border-neutral-400 focus-visible:ring-neutral-400/50 aria-invalid:ring-red-500/20 aria-invalid:border-red-500 flex field-sizing-content w-full px-4 transition-[color,box-shadow] outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm resize-none rounded-none border-0 bg-transparent py-4 shadow-none focus-visible:ring-0 flex-1 font-mono text-sm min-h-[400px]"
                  spellCheck={false}
                />
                <div className="absolute bottom-4 right-4 text-xs font-mono text-neutral-400 pointer-events-none">
                  {activeFile.content.length} chars
                </div>
                {isDragging && (
                  <div className="absolute inset-0 bg-white/80 flex items-center justify-center backdrop-blur-sm pointer-events-none">
                    <div className="text-center space-y-2">
                      <Upload className="w-10 h-10 text-neutral-400 mx-auto" />
                      <p className="text-neutral-500 font-medium">Drop file to upload</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer Actions */}
              <div className="p-4 bg-neutral-50 border-t border-neutral-100 flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <button
                    onClick={reset}
                    className="text-neutral-400 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-50"
                    title="Clear content"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  {/* Expiration Selector */}
                  <div className="flex items-center gap-2 text-neutral-500">
                    <Clock className="w-4 h-4" />
                    <select
                      value={expiration}
                      onChange={(e) => setExpiration(e.target.value)}
                      className="bg-transparent text-sm font-medium text-neutral-600 border-none focus:ring-0 p-0 cursor-pointer hover:text-neutral-900"
                    >
                      {EXPIRATION_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Password Input */}
                  <div className="flex items-center gap-2 text-neutral-500 border-l border-neutral-200 pl-4">
                    <Lock className={`w-4 h-4 ${isPasswordEnabled ? 'text-neutral-900' : 'text-neutral-400'}`} />
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setIsPasswordEnabled(!isPasswordEnabled)}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:ring-offset-2 ${
                          isPasswordEnabled ? 'bg-neutral-900' : 'bg-neutral-200'
                        }`}
                      >
                        <span
                          className={`${
                            isPasswordEnabled ? 'translate-x-5' : 'translate-x-1'
                          } inline-block h-3 w-3 transform rounded-full bg-white transition-transform`}
                        />
                      </button>
                      <AnimatePresence>
                        {isPasswordEnabled && (
                          <motion.input
                            initial={{ width: 0, opacity: 0 }}
                            animate={{ width: 128, opacity: 1 }}
                            exit={{ width: 0, opacity: 0 }}
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                            className="bg-transparent text-sm font-medium text-neutral-600 placeholder:text-neutral-400 border-none focus:ring-0 p-0 transition-all outline-none"
                          />
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handlePublish}
                  disabled={isPublishing || files.every(f => !f.content.trim())}
                  className="flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-white px-6 py-2.5 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {isPublishing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    <>
                      Create Snippet
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-2xl mx-auto"
            >
              <div className="rounded-lg border p-4 mb-6 bg-neutral-50 border-neutral-200">
                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-neutral-200">
                  <Terminal className="w-4 h-4 text-neutral-400" />
                  <span className="text-xs text-neutral-400 font-mono">
                    {files.length > 1 ? `${files.length} files` : (files[0].filename || 'snippet.txt')}
                  </span>
                </div>
                <div className="[&_>div]:!border-none [&_>div]:!rounded-none [&_pre]:!bg-transparent">
                  <div className="relative">
                    <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white [&_pre]:!bg-transparent [&_pre]:p-4 [&_pre]:text-sm [&_code]:!text-sm">
                      <pre className="shiki github-light" style={{ backgroundColor: '#fff', color: '#24292e' }} tabIndex={0}>
                        <code>
                          <span className="line"><span>{files[0].content.slice(0, 100)}{files[0].content.length > 100 ? '...' : ''}</span></span>
                        </code>
                      </pre>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-6 mt-4 text-xs text-neutral-500">
                  <button 
                    onClick={() => window.open(`${window.location.origin}/v/${publishedId}`, '_blank')}
                    className="flex items-center gap-2 hover:text-neutral-900 transition-colors w-fit group"
                  >
                    <Share2 className="h-3 w-3" />
                    <span>Preview:</span>
                    <code className="font-mono">{window.location.host}/v/{publishedId}</code>
                    <Copy className="h-3 w-3 opacity-30 group-hover:opacity-100 transition-opacity" />
                  </button>
                  <button 
                    onClick={() => copyToClipboard(registryUrl)}
                    className="flex items-center gap-2 hover:text-neutral-900 transition-colors w-fit group"
                  >
                    <FileCode className="h-3 w-3" />
                    <span>JSON:</span>
                    <code className="font-mono">{registryUrl.replace(/^https?:\/\//, '')}</code>
                    <Copy className="h-3 w-3 opacity-30 group-hover:opacity-100 transition-opacity" />
                  </button>
                </div>
              </div>
              
              <div className="flex justify-center mt-8">
                <button
                  onClick={reset}
                  className="text-neutral-500 hover:text-neutral-900 text-sm font-medium flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Create New Snippet
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </main>
  );
}
