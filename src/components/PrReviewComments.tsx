'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';

interface PrConversationsProps {
  dataset: PR | null;
}
interface PR {
  type: string;
  title: string;
  state: string;
  url: string;
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
  reviewComments: Conversation[];
}

interface Conversation {
  url: string;
  html_url: string;
  issue_url: string;
  state: string;
  id: number;
  node_id: string;
  user: {
    login: string;
    html_url: string;
    id: number;
    node_id: string;
    avatar_url: string;
  };
  submitted_at: string;
  created_at: string;
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
    author: { name: string; email: string; date: string };
    committer: { name: string; email: string; date: string };
    message: string;
    tree: { sha: string; url: string };
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
  author: { login: string; id: number; node_id: string; avatar_url: string };
  committer: { login: string; id: number; node_id: string; avatar_url: string };
  parents: Parent[];
}

interface Parent {
  sha: string;
  url: string;
  html_url: string;
}

const PrComments: React.FC<PrConversationsProps> = ({ dataset }) => {
  const [data, setData] = useState<PR | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setData(dataset);
    setIsLoading(false);
  }, [dataset]);

  return (
    <div className="pt-8 border border-purple-400 rounded-xl">
      {isLoading ? (
        <div className="flex justify-center items-center h-48">
          <div className="w-10 h-10 border-4 border-purple-500 border-dashed rounded-full animate-spin" />
        </div>
      ) : (
        <div>
          {data?.reviewComments?.length === 0 ? (
            <div className="mx-8 p-8 flex justify-center items-center">
              <h2 className="text-2xl font-bold mt-2">No reviews yet!</h2>
            </div>
          ) : (
            data?.reviewComments?.map((comment) => (
              <div
                key={comment.id}
                className="mx-8 mb-8 rounded-lg py-4 px-4 bg-gray-100 dark:bg-gray-800"
              >
                <div className="flex justify-between">
                  <div className="flex space-x-4">
                    <Link href={comment.user.html_url}>
                      <img
                        src={comment.user.avatar_url}
                        alt={comment.user.login}
                        className="w-14 h-14 rounded-full hover:scale-110 duration-200"
                        
                      />
                    </Link>
                    <div>
                      <h3 className="text-2xl font-bold">{comment.user.login}</h3>
                      <p className="text-gray-400">{comment.state}</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 mx-8 mt-4 rounded-lg bg-gray-200 dark:bg-gray-700">
                  {comment.body.trim() === '' ? (
                    comment.state === 'APPROVED' ? (
                      <p className="text-lg font-bold">{comment.user.login} approved the changes.</p>
                    ) : comment.state === 'COMMENTED' ? (
                      <p className="text-lg font-bold">{comment.user.login} reviewed the changes.</p>
                    ) : null
                  ) : (
                    <ReactMarkdown>
                      {comment.body.split('\r\n\r\n')[0]}
                    </ReactMarkdown>
                  )}
                </div>

                <div className="mx-8">
                  <p className="text-sm font-bold mt-2">
                    {new Date(comment.submitted_at).toLocaleString('en-US', {
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
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default PrComments;
