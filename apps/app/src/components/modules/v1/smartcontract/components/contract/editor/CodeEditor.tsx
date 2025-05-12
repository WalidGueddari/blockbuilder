'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Editor from '@monaco-editor/react';
import { CheckCircle2, Copy, Download } from 'lucide-react';
import { useState } from 'react';

interface CodeEditorProps {
  code: string;
  onChange: (value: string | undefined) => void;
  className?: string;
}

export const CodeEditor = ({ code, onChange, className = '' }: CodeEditorProps) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadCode = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contract.sol`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className={className}>
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-lg font-medium">Generated Solidity Code</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
            onClick={copyToClipboard}
          >
            {copied ? (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
            {copied ? 'Copied!' : 'Copy'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
            onClick={downloadCode}
          >
            <Download className="h-4 w-4" />
            Download
          </Button>
        </div>
      </div>
      <Card>
        <CardContent className="p-0">
          <div className="h-[70vh]">
            <Editor
              height="100%"
              defaultLanguage="solidity"
              value={code}
              onChange={onChange}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                wordWrap: 'on',
                automaticLayout: true,
                tabSize: 2,
                scrollBeyondLastLine: false,
                formatOnPaste: true,
                formatOnType: true,
              }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
