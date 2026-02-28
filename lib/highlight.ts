
import hljs from 'highlight.js';

// Import common languages to reduce bundle size if we were bundling, 
// but for now we'll just rely on what hljs provides by default or import specific ones if needed.
// highlight.js includes common languages by default.

export interface LanguageResult {
  language: string;
  score: number;
}

export const detectLanguage = (code: string): string => {
  if (!code || code.trim().length === 0) return 'plaintext';
  
  // Limit detection to common languages to avoid false positives with obscure ones
  const subset = [
    'javascript', 'typescript', 'python', 'java', 'c', 'cpp', 'csharp', 
    'go', 'rust', 'php', 'ruby', 'swift', 'kotlin', 'scala', 'html', 
    'css', 'json', 'yaml', 'xml', 'sql', 'bash', 'markdown', 'dockerfile'
  ];

  try {
    const result = hljs.highlightAuto(code, subset);
    return result.language || 'plaintext';
  } catch (e) {
    return 'plaintext';
  }
};

export const getExtensionForLanguage = (language: string): string => {
  const map: Record<string, string> = {
    'javascript': 'js',
    'typescript': 'ts',
    'python': 'py',
    'java': 'java',
    'c': 'c',
    'cpp': 'cpp',
    'csharp': 'cs',
    'go': 'go',
    'rust': 'rs',
    'php': 'php',
    'ruby': 'rb',
    'swift': 'swift',
    'kotlin': 'kt',
    'scala': 'scala',
    'html': 'html',
    'css': 'css',
    'json': 'json',
    'yaml': 'yaml',
    'xml': 'xml',
    'sql': 'sql',
    'bash': 'sh',
    'markdown': 'md',
    'dockerfile': 'dockerfile',
    'plaintext': 'txt',
    'tsx': 'tsx',
    'jsx': 'jsx'
  };
  return map[language] || 'txt';
};

export const highlightCode = (code: string, language?: string): string => {
  if (language && hljs.getLanguage(language)) {
    try {
      return hljs.highlight(code, { language }).value;
    } catch (e) {}
  }
  return hljs.highlightAuto(code).value;
};
