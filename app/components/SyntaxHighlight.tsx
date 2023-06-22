import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/cjs/styles/prism";

import tsx from "react-syntax-highlighter/dist/cjs/languages/prism/tsx";
import typescript from "react-syntax-highlighter/dist/cjs/languages/prism/typescript";
import bash from "react-syntax-highlighter/dist/cjs/languages/prism/bash";
import markdown from "react-syntax-highlighter/dist/cjs/languages/prism/markdown";
import json from "react-syntax-highlighter/dist/cjs/languages/prism/json";

SyntaxHighlighter.registerLanguage("tsx", tsx);
SyntaxHighlighter.registerLanguage("typescript", typescript);
SyntaxHighlighter.registerLanguage("bash", bash);
SyntaxHighlighter.registerLanguage("markdown", markdown);
SyntaxHighlighter.registerLanguage("json", json);

import { useState } from "react";
import { MdContentCopy, MdCheck } from "react-icons/md";

const SyntaxHighlight: object = {
  code({ inline, className, children, ...props }: any) {
    const match = /language-(\w+)/.exec(className || "");
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
      navigator.clipboard.writeText(children);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 3000);
    };

    return !inline && match ? (
      <div className="max-w-2xl min-w-[25rem] bg-[#3a404d] rounded-md overflow-hidden mt-4 mb-6">
        <div className="flex justify-between px-4 py-2 text-white text-xs items-center">
          <p className="text-sm">{match[1]}</p>
          {copied ? (
            <button className="py-1 inline-flex items-center gap-1">
              <MdCheck className="text-base mr-1" /> Copied!
            </button>
          ) : (
            <button
              onClick={handleCopy}
              className="py-1 inline-flex items-center gap-1"
            >
              <MdContentCopy className="text-base mr-1" /> Copy code
            </button>
          )}
        </div>

        <SyntaxHighlighter
          style={oneDark}
          language={match[1]}
          children={children}
          customStyle={{ padding: "25px", margin: "0px", borderRadius: "0px" }}
          wrapLongLines={true}
        />
      </div>
    ) : (
      <code className={className} {...props}>
        {children}
      </code>
    );
  },
};

export default SyntaxHighlight;
