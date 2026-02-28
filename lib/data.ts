
import { File, Box, Code, Library } from 'lucide-react';

export const EXPIRATION_OPTIONS = [
  { label: 'Never', value: 'never' },
  { label: '10 Minutes', value: (10 * 60 * 1000).toString() },
  { label: '1 Hour', value: (60 * 60 * 1000).toString() },
  { label: '24 Hours', value: (24 * 60 * 60 * 1000).toString() },
  { label: '7 Days', value: (7 * 24 * 60 * 60 * 1000).toString() },
];

export const TYPE_OPTIONS = [
  { label: 'File', value: 'File', icon: File },
  { label: 'Component', value: 'Component', icon: Box },
  { label: 'Hook', value: 'Hook', icon: Code },
  { label: 'Lib', value: 'Lib', icon: Library },
];

export const TYPE_CONFIG: Record<string, { label: string; prefix: string; placeholder: string }> = {
  File: { label: 'Save as', prefix: '~/', placeholder: 'AGENTS.md' },
  Component: { label: 'Save as', prefix: 'components/', placeholder: 'code-preview.tsx' },
  Hook: { label: 'Save as', prefix: 'hooks/', placeholder: 'use-copy-to-clipboard.ts' },
  Lib: { label: 'Save as', prefix: 'lib/', placeholder: 'fetcher.ts' },
};

export const LANGUAGES = [
  'typescript', 'tsx', 'javascript', 'jsx', 'json', 'markdown', 'css', 'plaintext'
];
