import React from 'react';
import ReactMarkdown from 'react-markdown';

interface MarkdownBoxProps {
  text: string | undefined;
}

const MarkdownBox: React.FC<MarkdownBoxProps> = ({ text }) => {
  return (
    <div
      className="border border-purple-500 p-4 rounded-lg max-w-full overflow-hidden break-words whitespace-pre-wrap bg-[#2a003f]/60 backdrop-blur-md shadow-md"
    >
      <div className="text-lg text-purple-200">
        <ReactMarkdown
          components={{
            code({ inline, children, ...props }: React.HTMLAttributes<HTMLElement> & { inline?: boolean }) {
              return inline ? (
                <code
                  className="inline-block whitespace-break-spaces break-words bg-[#350055]/70 text-pink-300 px-2 py-1 rounded"
                  {...props}
                >
                  {children}
                </code>
              ) : (
                <pre
                  className="overflow-x-auto bg-[#1b002e]/90 text-purple-300 p-4 rounded-md max-w-full m-0"
                  {...(props as React.HTMLAttributes<HTMLPreElement>)}
                >
                  <code>{children}</code>
                </pre>
              );
            },
          }}
        >
          {text || ''}
        </ReactMarkdown>
      </div>
    </div>
  );
};

export default MarkdownBox;
