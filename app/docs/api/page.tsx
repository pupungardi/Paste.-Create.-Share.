import Link from 'next/link';
import { ArrowLeft, Copy, Check } from 'lucide-react';
import ClientCopyButton from '@/components/client-copy-button';

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      {/* Navigation */}
      <nav className="border-b border-neutral-200 bg-white/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="font-serif text-xl font-bold tracking-tight">
            PasteCN
          </Link>
          <div className="flex items-center gap-6 text-sm font-medium text-neutral-600">
            <Link href="/blog" className="hover:text-neutral-900 transition-colors">Blog</Link>
            <Link href="/docs/api" className="text-neutral-900">API</Link>
            <Link href="/login" className="hover:text-neutral-900 transition-colors">Login</Link>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 py-12 md:py-20">
        <div className="flex flex-col md:flex-row gap-12">
          {/* Sidebar */}
          <aside className="w-full md:w-64 flex-shrink-0">
            <div className="sticky top-24 space-y-8">
              <div>
                <h3 className="font-semibold text-neutral-900 mb-3">Getting Started</h3>
                <ul className="space-y-2 text-sm text-neutral-600">
                  <li><a href="#introduction" className="hover:text-neutral-900 transition-colors">Introduction</a></li>
                  <li><a href="#authentication" className="hover:text-neutral-900 transition-colors">Authentication</a></li>
                  <li><a href="#base-url" className="hover:text-neutral-900 transition-colors">Base URL</a></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900 mb-3">Endpoints</h3>
                <ul className="space-y-2 text-sm text-neutral-600">
                  <li><a href="#create-snippet" className="hover:text-neutral-900 transition-colors">Create Snippet</a></li>
                  <li><a href="#get-snippet" className="hover:text-neutral-900 transition-colors">Get Snippet</a></li>
                  <li><a href="#get-raw" className="hover:text-neutral-900 transition-colors">Get Raw Content</a></li>
                </ul>
              </div>
            </div>
          </aside>

          {/* Content */}
          <div className="flex-1 min-w-0 space-y-12">
            <section id="introduction" className="scroll-mt-24">
              <h1 className="text-4xl font-bold tracking-tight text-neutral-900 font-serif mb-4">
                API Documentation
              </h1>
              <p className="text-lg text-neutral-500 font-light leading-relaxed">
                Welcome to the PasteCN API documentation. Our API allows you to programmatically create, retrieve, and manage code snippets.
                It&apos;s designed to be simple, fast, and easy to use.
              </p>
            </section>

            <section id="base-url" className="scroll-mt-24">
              <h2 className="text-2xl font-bold text-neutral-900 mb-4">Base URL</h2>
              <div className="bg-white border border-neutral-200 rounded-xl p-4 font-mono text-sm text-neutral-600 flex items-center justify-between">
                <span>https://pastecn.com/api</span>
                <ClientCopyButton content="https://pastecn.com/api" />
              </div>
            </section>

            <section id="create-snippet" className="scroll-mt-24">
              <div className="flex items-center gap-3 mb-4">
                <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold font-mono">POST</span>
                <h2 className="text-2xl font-bold text-neutral-900">/registry</h2>
              </div>
              <p className="text-neutral-600 mb-6">Create a new snippet.</p>

              <h3 className="text-sm font-semibold text-neutral-900 mb-3">Request Body</h3>
              <div className="bg-neutral-900 rounded-xl overflow-hidden mb-6">
                <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/10">
                  <span className="text-xs text-neutral-400 font-mono">JSON</span>
                </div>
                <pre className="p-4 text-sm font-mono text-neutral-300 overflow-x-auto">
{`{
  "content": "console.log('Hello World');",
  "filename": "hello.js",        // Optional
  "language": "javascript",      // Optional
  "duration": "never",           // Optional: "never", "10m", "1h", "24h", "7d"
  "password": "secret-password"  // Optional
}`}
                </pre>
              </div>

              <h3 className="text-sm font-semibold text-neutral-900 mb-3">Response</h3>
              <div className="bg-neutral-900 rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/10">
                  <span className="text-xs text-neutral-400 font-mono">200 OK</span>
                </div>
                <pre className="p-4 text-sm font-mono text-neutral-300 overflow-x-auto">
{`{
  "success": true,
  "id": "abc123xyz",
  "url": "/r/abc123xyz"
}`}
                </pre>
              </div>
            </section>

            <section id="get-raw" className="scroll-mt-24">
              <div className="flex items-center gap-3 mb-4">
                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold font-mono">GET</span>
                <h2 className="text-2xl font-bold text-neutral-900">/r/:id</h2>
              </div>
              <p className="text-neutral-600 mb-6">Retrieve the raw content of a snippet.</p>

              <h3 className="text-sm font-semibold text-neutral-900 mb-3">Parameters</h3>
              <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden mb-6">
                <table className="w-full text-sm text-left">
                  <thead className="bg-neutral-50 border-b border-neutral-200">
                    <tr>
                      <th className="px-4 py-3 font-medium text-neutral-900">Name</th>
                      <th className="px-4 py-3 font-medium text-neutral-900">Type</th>
                      <th className="px-4 py-3 font-medium text-neutral-900">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200">
                    <tr>
                      <td className="px-4 py-3 font-mono text-neutral-600">id</td>
                      <td className="px-4 py-3 text-neutral-500">string</td>
                      <td className="px-4 py-3 text-neutral-500">The unique identifier of the snippet.</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-mono text-neutral-600">password</td>
                      <td className="px-4 py-3 text-neutral-500">string</td>
                      <td className="px-4 py-3 text-neutral-500">Required if the snippet is password protected.</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 className="text-sm font-semibold text-neutral-900 mb-3">Example</h3>
              <div className="bg-neutral-900 rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/10">
                  <span className="text-xs text-neutral-400 font-mono">cURL</span>
                  <ClientCopyButton content="curl https://pastecn.com/r/abc123xyz" />
                </div>
                <pre className="p-4 text-sm font-mono text-neutral-300 overflow-x-auto">
{`curl https://pastecn.com/r/abc123xyz`}
                </pre>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
