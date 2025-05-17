"use client";
import React, { useEffect, useState } from 'react';
import { BiGitMerge, BiLockAlt, BiGitBranch } from 'react-icons/bi';
import PrConversations from "@/components/PrConversations";
import PrComments from './PrReviewComments';
import {motion} from "framer-motion";
import MarkdownBox from './PrOrIssueDescription';
import SearchBox from './tools/SearchBar';
import Loader from './ui/Loader2';
import Header from './wrapper/Header';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from './ui/button';

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
        numFilesChanged:number;
    }
    reviewComments: Conversation[];
}

const labelGlowClasses: Record<string, string> = {
  green: 'bg-[#22c55e] text-white shadow-[0_4px_14px_0_rgba(34,197,94,0.4)] hover:shadow-[0_6px_20px_rgba(34,197,94,0.3)] hover:bg-[#16a34a] hover:scale-[1.03] transition duration-200 ease-linear',
  red: 'bg-[#ef4444] text-white shadow-[0_4px_14px_0_rgba(239,68,68,0.4)] hover:shadow-[0_6px_20px_rgba(239,68,68,0.3)] hover:bg-[#dc2626] hover:scale-[1.03] transition duration-200 ease-linear',
  purple: 'bg-[#8b5cf6] text-white shadow-[0_4px_14px_0_rgba(139,92,246,0.4)] hover:shadow-[0_6px_20px_rgba(139,92,246,0.3)] hover:bg-[#7c3aed] hover:scale-[1.03] transition duration-200 ease-linear',
  gray: 'bg-[#6b7280] text-white shadow-[0_4px_14px_0_rgba(107,114,128,0.4)] hover:shadow-[0_6px_20px_rgba(107,114,128,0.3)] hover:bg-[#4b5563] hover:scale-[1.03] transition duration-200 ease-linear',
  orange: 'bg-[#fb923c] text-white shadow-[0_4px_14px_0_rgba(251,146,60,0.4)] hover:shadow-[0_6px_20px_rgba(251,146,60,0.3)] hover:bg-[#f97316] hover:scale-[1.03] transition duration-200 ease-linear',
  pink: 'bg-[#ec4899] text-white shadow-[0_4px_14px_0_rgba(236,72,153,0.4)] hover:shadow-[0_6px_20px_rgba(236,72,153,0.3)] hover:bg-[#db2777] hover:scale-[1.03] transition duration-200 ease-linear',
  yellow: 'bg-[#facc15] text-white shadow-[0_4px_14px_0_rgba(250,204,21,0.4)] hover:shadow-[0_6px_20px_rgba(250,204,21,0.3)] hover:bg-[#ca8a04] hover:scale-[1.03] transition duration-200 ease-linear',
  lightGreen: 'bg-[#84cc16] text-white shadow-[0_4px_14px_0_rgba(132,204,22,0.4)] hover:shadow-[0_6px_20px_rgba(132,204,22,0.3)] hover:bg-[#65a30d] hover:scale-[1.03] transition duration-200 ease-linear',
};


interface Conversation {
    url: string;
    html_url: string;
    issue_url: string;
    state:string;
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


function getLabelColor(label: string) {
  switch (label) {
    case 's-withdrawn':
    case 's-stagnant':
    case 's-review':
    case 's-lastcall':
    case 's-final':
    case 's-draft':
    case 'javascript':
      return 'green';
    case 'ruby':
    case 'bug':
      return 'red';
    case 'r-website':
    case 'r-process':
    case 'r-other':
    case 'r-eips':
    case 'r-ci':
      return 'purple';
    case 'created-by-bot':
    case '1272989785':
      return 'gray';
    case 'c-new':
    case 'c-status':
    case 'c-update':
      return 'orange';
    case 'a-review':
      return 'pink';
    case 'e-blocked':
    case 'e-blocking':
    case 'e-circular':
    case 'e-consensus':
    case 'e-number':
    case 'e-review':
      return 'yellow';
    case 'enhancement':
    case 'dependencies':
    case 'question':
      return 'purple';
    case 'discussions-to':
      return 'lightGreen';
    default:
      return 'gray';
  }
}


interface PrPageProps {
    Type: string; 
    number:string;
  }

const PrPage: React.FC<PrPageProps> = ({ Type,number }) => {
    const [data, setData] = useState<PR | null>(null);
    const [isLoading, setIsLoading] = useState(true);


    // const path = usePathname();
    // const brokenpath = path ? path.split('/') : '';
    const prNumber = number;
    console.log(Type);
    console.log(prNumber);

useEffect(() => {
  if (prNumber) {
    const fetchData = async () => {
      try {
        console.log('Fetching data...');
        const response = await fetch(`/api/get-pr-details/${Type}/${prNumber}`);
        const jsonData = await response.json();
        console.log('API response:', jsonData);

        if (jsonData && typeof jsonData === 'object') {
          const {
            prNumber,
            prTitle,
            prDescription,
            labels,
            conversations,
            numConversations,
            participants,
            commits,
            numFilesChanged,
            reviewComments,
            type,
            title,
            url,
            state,
            // fallback to prDetails if above are missing
            prDetails = {}
          } = jsonData;

          const formattedData: PR = {
            type: type || prDetails.type || 'pull_request',
            title: title || prDetails.prTitle || '',
            url: url || prDetails.url || '',
            state: state || prDetails.state || '',
            prDetails: {
              prNumber: prNumber || prDetails.prNumber,
              prTitle: prTitle || prDetails.prTitle,
              prDescription: prDescription || prDetails.prDescription,
              labels: labels || prDetails.labels || [],
              conversations: conversations || prDetails.conversations || [],
              numConversations: numConversations || prDetails.conversations?.length || 0,
              participants: participants || prDetails.participants || [],
              commits: commits || prDetails.commits || [],
              numFilesChanged: numFilesChanged || prDetails.numFilesChanged || 0,
            },
            reviewComments: reviewComments || []
          };

          setData(formattedData);
        } else {
          console.error('API response is not an object:', jsonData);
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setIsLoading(false);
      }
    };
    fetchData();
  }
}, [prNumber, Type]);


    console.log(data);

    const ethBotFiltered = data?.prDetails?.conversations.filter(
        (item) => item.user.login === 'eth-bot'
    );
    const ethBotCount = ethBotFiltered?.length;
    const gitActionsBotFiltered = data?.prDetails?.conversations?.filter(
        (item) => item.user.login === 'github-actions[bot]'
    );
    const gitActionsBotCount = gitActionsBotFiltered?.length;
return (
  <>
    <div className="pb-10 mx-2 md:mx-2 lg:mx-40 px-5 md:px-5 lg:px-10 mt-5 md:mt-5 lg:mt-10">
      {isLoading ? (
        <div className="flex justify-center items-center h-screen">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Loader />
          </motion.div>
        </div>
      ) : (
        <>
          <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <Header title={"Pull Request"} subtitle={`#${data?.prDetails.prNumber}`} />
              {/* Uncomment if SearchBox needed on md+ */}
              {/* <div className="hidden md:block w-full max-w-[400px]">
                <SearchBox />
              </div> */}
            </div>

            <div className="block md:hidden w-full pt-4">
              <SearchBox />
            </div>

            <div
              className="flex flex-wrap items-center pt-8 gap-4 lg:gap-10 justify-center lg:justify-start text-center lg:text-left flex-col lg:flex-row"
            >
              {/* Image */}
              <Link href={`https://github.com/${data?.prDetails?.commits[0]?.author?.login}`} target="_blank" >
{data?.prDetails?.commits?.[0]?.author?.avatar_url && (
  <Image
    src={data.prDetails.commits[0].author.avatar_url}
    alt={data.prDetails.commits[0].author.login || 'Author'}
    width={80}
    height={80}
    className="rounded-full hover:scale-110 duration-200"
    
  />
)}

              </Link>

              {/* Title */}
              <h1 className="text-3xl mt-4 lg:mt-0">
                {data?.prDetails.prTitle}
              </h1>

              {/* Tag */}
              <div className="pt-4 lg:pt-0">
                <div className="flex justify-center lg:justify-start flex-wrap">
                  <div>
                    {data?.state === 'merged' ? (
                      <span className="flex items-center space-x-2 text-3xl px-4 py-2 rounded-xl bg-purple-600 text-white">
                        <BiGitMerge /> <span>Merged</span>
                      </span>
                    ) : data?.state === 'closed' ? (
                      <span className="flex items-center space-x-2 text-3xl px-4 py-2 rounded-xl bg-red-600 text-white">
                        <BiLockAlt /> <span>Closed</span>
                      </span>
                    ) : data?.state === 'open' ? (
                      <span className="flex items-center space-x-2 text-3xl px-4 py-2 rounded-xl bg-green-600 text-white">
                        <BiGitBranch /> <span>Open</span>
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-8">
              <div className="border border-purple-400 rounded-[0.55rem] grid grid-cols-1 md:grid-cols-2 gap-4 py-4 px-4 md:px-8">
                {/* Left Column */}
                <div className="pr-0 md:pr-4 border-0 md:border-r md:border-purple-400">
                  <table>
                    <tbody>
                      <tr>
                        <td className="pb-10 pr-8">
                          <span className="text-lg md:text-2xl font-bold">Commits:</span>
                        </td>
                        <td className="pb-10">
                          <Link href={`https://github.com/ethereum/EIPs/pull/${data?.prDetails?.prNumber}/commits`} target="_blank">
                            <div className="flex flex-wrap">
                              <div>
<span
  className="relative rounded-full px-4 py-1 text-lg md:text-2xl text-white backdrop-blur-md bg-gradient-to-br from-purple-500/30 to-purple-800/30 border border-white/20 shadow-inner shadow-purple-700/20 transition duration-300 hover:before:opacity-100 hover:scale-105"
>
  {data?.prDetails?.commits.length}

  {/* Flare effect on hover */}
  <span className="absolute inset-0 rounded-full opacity-0 transition duration-500 before:absolute before:inset-0 before:rounded-full before:bg-purple-500/40 before:blur-xl hover:before:opacity-60 z-[-1]" />
</span>

                              </div>
                            </div>
                          </Link>
                        </td>
                      </tr>
                      <tr>
                        <td className="pb-10 pr-8">
                          <span className="text-lg md:text-2xl font-bold">Files Changed:</span>
                        </td>
                        <td className="pb-10">
                          <Link href={`https://github.com/ethereum/EIPs/pull/${data?.prDetails?.prNumber}/files`} target="_blank">
                            <div className="flex flex-wrap">
                              <div>
<span
  className="relative rounded-full px-4 py-1 text-lg md:text-2xl text-white backdrop-blur-md bg-gradient-to-br from-purple-500/30 to-purple-800/30 border border-white/20 shadow-inner shadow-purple-700/20 transition duration-300 hover:before:opacity-100 hover:scale-105"
>
  {data?.prDetails?.numFilesChanged}

  {/* Flare effect on hover */}
  <span className="absolute inset-0 rounded-full opacity-0 transition duration-500 before:absolute before:inset-0 before:rounded-full before:bg-purple-500/40 before:blur-xl hover:before:opacity-60 z-[-1]" />
</span>
                              </div>
                            </div>
                          </Link>
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  {data?.prDetails?.labels.length !== 0 && (
                    <div className="pb-10">
                      <span className="text-lg md:text-2xl font-bold pb-5 block">Labels:</span>
                      <div className="flex flex-wrap gap-2">
{data?.prDetails?.labels.map((item) => (
  <span
    key={item}
    className={`px-4 py-2 rounded-full text-white ${labelGlowClasses[getLabelColor(item)]}`}
  >
    {item}
  </span>
))}

                      </div>
                    </div>
                  )}

                  <div>
                    <span className="text-lg md:text-2xl font-bold pb-5 block">Participants:</span>
                    <div className="flex flex-wrap gap-3">
                      {data?.prDetails?.participants.map((participant) => {
                        const matchingConversation = data?.prDetails?.conversations.find(
                          (conversation) => conversation.user.login === participant
                        );

                        return (
                          matchingConversation && (
                            <Link
                              key={participant}
                              href={`https://github.com/${matchingConversation.user.login}`}
                              target="_blank"
                            >
                              <Image
                                src={`${matchingConversation.user.avatar_url}`}
                                alt=""
                                width={50}
                                height={50}
                                className="rounded-full hover:scale-110 duration-200"
                                
                              />
                            </Link>
                          )
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="pl-0 md:pl-4">
                  <div className="flex items-center space-x-4 pb-6">
                    <span className="text-lg md:text-2xl font-bold">Link:</span>
                    <Link href={`${data?.url}`} target="_blank">
                      <Button variant={"purpleGlow"}>
                        Go to Github PR Page
                      </Button>
                    </Link>
                  </div>

                  <table>
                    <tbody>
                      <tr>
                        <td className="text-lg md:text-2xl pb-6 pr-8 flex items-center">
                          <Link href="https://github.com/eth-bot" target="_blank">
                            <Image
                              src="https://avatars.githubusercontent.com/u/85952233?v=4"
                              alt=""
                              width={50}
                              height={50}
                              className="rounded-full hover:scale-110 duration-200"
                            />
                          </Link>
                          <span className="ml-3">ETH-Bot Comments:</span>
                        </td>
                        <td className="text-xl">
<span
  className="relative rounded-full px-4 py-1 text-lg md:text-2xl text-white backdrop-blur-md bg-gradient-to-br from-purple-500/30 to-purple-800/30 border border-white/20 shadow-inner shadow-purple-700/20 transition duration-300 hover:before:opacity-100 hover:scale-105"
>
  {ethBotCount}

  {/* Flare effect on hover */}
  <span className="absolute inset-0 rounded-full opacity-0 transition duration-500 before:absolute before:inset-0 before:rounded-full before:bg-purple-500/40 before:blur-xl hover:before:opacity-60 z-[-1]" />
</span>
                        </td>
                      </tr>
                      <tr>
                        <td className="text-lg md:text-2xl pr-8 flex items-center">
                          <Link href="https://github.com/features/actions" target="_blank">
<Image
  src="https://avatars.githubusercontent.com/in/15368?s=80&v=4"
  alt="GitHub avatar"
  width={50}
  height={50}
  className="rounded-full hover:scale-110 duration-200"
/>

                          </Link>
                          <span className="ml-3">Github-Actions Bot:</span>
                        </td>
                        <td className="text-xl">
<span
  className="relative rounded-full px-4 py-1 text-lg md:text-2xl text-white backdrop-blur-md bg-gradient-to-br from-purple-500/30 to-purple-800/30 border border-white/20 shadow-inner shadow-purple-700/20 transition duration-300 hover:before:opacity-100 hover:scale-105"
>
  {gitActionsBotCount}

  {/* Flare effect on hover */}
  <span className="absolute inset-0 rounded-full opacity-0 transition duration-500 before:absolute before:inset-0 before:rounded-full before:bg-purple-500/40 before:blur-xl hover:before:opacity-60 z-[-1]" />
</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div>
              <h2 id="description" className="text-3xl font-bold py-8">
                Description
              </h2>

              <MarkdownBox text={data?.prDetails?.prDescription} />
            </div>

            <div>
              <h2 id="conversations" className="text-3xl font-bold py-8">
                All Conversations
              </h2>

              <PrConversations dataset={data} />
            </div>

            <div>
              <h2 id="review-comments" className="text-3xl font-bold py-8">
                Review Comments
              </h2>

              <PrComments dataset={data} />
            </div>
          </div>
        </>
      )}
    </div>
  </>
);

}

export default PrPage;