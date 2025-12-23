'use client';

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import {
  oneDark,
  oneLight,
} from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useTheme } from 'next-themes';
import { useTranslations } from 'next-intl';

type CodeBlockProps = {
  code: string;
  language?: string;
  showCopyButton?: boolean;
};

const languageMap: Record<string, string> = {
  python: 'python',
  python3: 'python',
  py: 'python',
  javascript: 'javascript',
  js: 'javascript',
  node: 'javascript',
  nodejs: 'javascript',
  typescript: 'typescript',
  ts: 'typescript',
  tsx: 'tsx',
  java: 'java',
  kotlin: 'kotlin',
  swift: 'swift',
  cpp: 'cpp',
  'c++': 'cpp',
  c: 'c',
  csharp: 'csharp',
  'c#': 'csharp',
  go: 'go',
  golang: 'go',
  rust: 'rust',
  php: 'php',
  ruby: 'ruby',
  rb: 'ruby',
};

function detectLanguage(code: string, languageName?: string): string {
  if (languageName) {
    const normalized = languageName.toLowerCase().replace(/\s+/g, '');
    return languageMap[normalized] || normalized;
  }

  const snippet = code.trim().slice(0, 200).toLowerCase();

  if (snippet.includes('def ') || snippet.includes('import ')) return 'python';
  if (snippet.includes('console.log') || snippet.includes('function'))
    return 'javascript';
  if (snippet.includes('package ') || snippet.includes('fmt.')) return 'go';
  if (snippet.includes('#include') || snippet.includes('std::')) return 'cpp';
  if (snippet.includes('public class')) return 'java';
  if (snippet.includes('fn main') || snippet.includes('println!'))
    return 'rust';

  return 'text';
}

export function CodeBlock({
  code,
  language,
  showCopyButton = true,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();
  const t = useTranslations('CodeBlock');

  const detectedLanguage = useMemo(
    () => detectLanguage(code, language),
    [code, language],
  );

  const highlightStyle = resolvedTheme === 'dark' ? oneDark : oneLight;

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success(t('copySuccess'));
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(t('copyError'));
    }
  };

  return (
    <div
      className="bg-muted/30 relative rounded-md border p-4"
      role="region"
      aria-label="Code block"
    >
      {showCopyButton && (
        <Button
          variant="ghost"
          size="sm"
          onClick={copyToClipboard}
          className="absolute top-2 right-2 z-10 h-8 text-xs"
          aria-label={copied ? t('copiedLabel') : t('copy')}
          disabled={copied}
        >
          {copied ? (
            <>
              <Check className="mr-1 h-3 w-3" aria-hidden="true" />
              {t('copiedLabel')}
            </>
          ) : (
            <>
              <Copy className="mr-1 h-3 w-3" aria-hidden="true" />
              {t('copy')}
            </>
          )}
        </Button>
      )}
      {mounted ? (
        <SyntaxHighlighter
          language={detectedLanguage}
          style={highlightStyle}
          customStyle={{
            margin: 0,
            borderRadius: '0.375rem',
            fontSize: '0.875rem',
            lineHeight: '1.5',
            background: 'transparent',
          }}
          showLineNumbers
          wrapLines
          wrapLongLines
          aria-label={`Code block in ${detectedLanguage}`}
        >
          {code}
        </SyntaxHighlighter>
      ) : (
        <pre className="bg-muted/30 text-muted-foreground rounded-md border p-4 text-xs">
          {code}
        </pre>
      )}
    </div>
  );
}
