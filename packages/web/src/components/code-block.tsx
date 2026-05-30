import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface CodeBlockProps {
  code: string;
  language?: string;
  showLineNumbers?: boolean;
  className?: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({
  code,
  language,
  showLineNumbers = true,
  className = '',
}) => {
  const [copied, setCopied] = useState(false);
  const lines = code.split('\n');

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`rounded-2xl overflow-hidden border border-noir-10 ${className}`}>
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-noir-05 border-b border-noir-10">
        <span className="text-[10px] font-mono text-noir-50 uppercase lowercase">
          {language || 'code'}
        </span>
        <button
          onClick={handleCopy}
          className="text-[10px] px-2 py-1 rounded-md bg-white border border-noir-10 text-noir-50 hover:text-structure transition-colors lowercase"
        >
          {copied ? 'copied!' : 'copy'}
        </button>
      </div>

      {/* Code */}
      <div className="overflow-x-auto max-h-[60vh] overflow-y-auto">
        <pre className="text-xs font-mono leading-6 m-0 bg-white">
          {lines.map((line, i) => {
            const isAdd = line.startsWith('+');
            const isDel = line.startsWith('-');
            const isHunk = line.startsWith('@@');
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.002 }}
                className={`flex ${
                  isAdd ? 'bg-green-50' : isDel ? 'bg-red-50' : isHunk ? 'bg-cerulean-20' : ''
                }`}
              >
                {showLineNumbers && (
                  <span className="select-none text-noir-20 text-right inline-block w-10 shrink-0 pr-3">
                    {i + 1}
                  </span>
                )}
                <span
                  className={
                    isAdd
                      ? 'text-green-700'
                      : isDel
                        ? 'text-signal'
                        : isHunk
                          ? 'text-cerulean font-semibold'
                          : 'text-noir-70'
                  }
                >
                  {line}
                </span>
              </motion.div>
            );
          })}
        </pre>
      </div>
    </div>
  );
};
