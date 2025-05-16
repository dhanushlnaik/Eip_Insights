import {useEffect, useState} from 'react';
import React from "react";
import ReactMarkdown from 'react-markdown';

interface PrConversationsProps {
    dataset: PR|null;
}

interface PR {
    type: string;
    title: string;
    url: string;
    state:string;
    prDetails: {
        prNumber: number;
        prTitle: string;
        prDescription: string;
        labels: string[];
        conversations: Conversation[];
        numConversations: number;
        participants: string[];
        commits: Commit[];
    };
}

interface Conversation {
    url: string;
    html_url: string;
    issue_url: string;
    id: number;
    node_id: string;
    user: {
        login: string;
        html_url: string;
        id: number;
        node_id: string;
        avatar_url: string;
    };
    created_at: string;
    submitted_at:string;
    updated_at: string;
    author_association: string;
    body: string;
    reactions: {
        url: string;
        total_count: number;
    };
    performed_via_github_app: null | Record<string, unknown>;
}

interface Commit {
    sha: string;
    node_id: string;
    commit: {
        author: {
            name: string;
            email: string;
            date: string;
        };
        committer: {
            name: string;
            email: string;
            date: string;
        };
        message: string;
        tree: {
            sha: string;
            url: string;
        };
        url: string;
        comment_count: number;
        verification: {
            verified: boolean;
            reason: string;
            signature: string;
            payload: string;
        };
    };
    url: string;
    html_url: string;
    comments_url: string;
    author: {
        login: string;
        id: number;
        node_id: string;
        avatar_url: string;
    };
    committer: {
        login: string;
        id: number;
        node_id: string;
        avatar_url: string;
    };
    parents: Parent[];
}

interface Parent {
    sha: string;
    url: string;
    html_url: string;
}


const PrConversations: React.FC<PrConversationsProps> = ({dataset}) => {
    const [data, setData] = useState<PR | null>(null);
    const [isLoading, setIsLoading] = useState(true);
const bg = "bg-[#2a003f]/60 backdrop-blur-md"; // main card background
const bg2 = "bg-[#1a002e]/60 backdrop-blur-md"; // inner box
const codeBg = "bg-[#350055]/70 text-pink-300"; // inline code
const preCodeBg = "bg-[#1b002e]/90 text-purple-300"; // code block

    useEffect(() => {
        setData(dataset);
        setIsLoading(false);
    }, [dataset]);
    return(
<>
  <div className="pt-8 border border-purple-500 rounded-xl">
    {isLoading ? (
      <div className="flex justify-center items-center h-[200px]">
        <svg
          className="animate-spin h-8 w-8 text-purple-400"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8H4z"
          ></path>
        </svg>
      </div>
    ) : (
      <>
        {data?.prDetails?.conversations?.map((comment) => (
          <div
            key={comment.id}
            className={`mx-8 mb-8 py-4 px-6 rounded-xl ${bg} shadow-md border border-purple-800`}
          >
            <div className="flex justify-between">
              <div className="flex space-x-4">
                <a
                  href={comment.user.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    src={comment.user.avatar_url}
                    alt={comment.user.login}
                    className="w-14 h-14 rounded-full hover:scale-110 transition-transform duration-200 shadow-md"
                  />
                </a>
                <div>
                  <p className="text-2xl font-bold text-purple-200">
                    {comment.user.login}
                  </p>
                  <p className="text-sm text-purple-400">
                    {comment.author_association}
                  </p>
                </div>
              </div>
            </div>

            <div
              className={`mt-4 mx-2 p-4 rounded-lg ${bg2} border border-purple-900`}
            >
              <ReactMarkdown
                components={{
                  code({ inline, children, ...props }: { inline?: boolean; children?: React.ReactNode }) {
                    return inline ? (
                      <code
                        className={`whitespace-break-spaces break-words px-2 py-1 rounded ${codeBg}`}
                        {...props}
                      >
                        {children}
                      </code>
                    ) : (
                      <pre
                        className={`overflow-x-auto p-4 rounded-md max-w-full m-0 ${preCodeBg}`}
                        {...props}
                      >
                        <code>{children}</code>
                      </pre>
                    );
                  },
                }}
              >
                {comment.body?.split('\r\n\r\n')[0] || ''}
              </ReactMarkdown>
            </div>

            <div className="mx-2 mt-2">
              <p className="text-sm font-semibold text-purple-300">
                {new Date(comment.created_at).toLocaleString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true,
                })}
              </p>
            </div>
          </div>
        ))}
      </>
    )}
  </div>
</>

    )
}

export default PrConversations;