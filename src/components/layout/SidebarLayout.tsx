'use client';
import Image from 'next/image';
import React, { useEffect, useState, ReactNode, JSX } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronRight } from 'lucide-react';
import {
  ActivityIcon,
  ListChecks,
  LayoutDashboard,
  BrainCircuit,
  BarChart3,
  FolderKanban,
  BookMarked,
  Users,
  FileText,
  Search,
  GitPullRequest,
  Trophy,
  FilePen,
  CalendarClock,
} from 'lucide-react';
import SearchBox from '../tools/SearchBar';
import Loader from '../ui/Loader2';

interface MenuItem {
  label: string;
  href?: string;
  children?: MenuItem[];
}

interface SidebarLayoutProps {
  children: ReactNode;
}

const iconsMap: Record<string, React.ReactNode> = {
  'Pectra': <ActivityIcon />,
  'All EIPs': <ListChecks />,
  'All': <ListChecks />,
  'EIP': <Search />,
  'ERC': <Search />,
  'RIP': <Search />,
  'Tools': <FolderKanban />,
  'Analytics': <BarChart3 />,
  'Boards': <LayoutDashboard />,
  'Editors & Reviewers Leaderboard': <Trophy />,
  'EIP Proposal Builder': <FilePen />,
  'Search By': <ListChecks />,
  'Author': <Users />,
  'SearchEip': <Search />,
  'EIP Title': <FileText />,
  'PR/ISSUE': <GitPullRequest />,
  'Insight': <BrainCircuit />,
  '2025': <CalendarClock />,
  '2024': <CalendarClock />,
  '2023': <CalendarClock />,
  '2022': <CalendarClock />,
  '2021': <CalendarClock />,
  '2020': <CalendarClock />,
  '2019': <CalendarClock />,
  '2018': <CalendarClock />,
  '2017': <CalendarClock />,
  '2016': <CalendarClock />,
  '2015': <CalendarClock />,
  'Jan': <CalendarClock />,
  'Feb': <CalendarClock />,
  'Mar': <CalendarClock />,
  'Apr': <CalendarClock />,
  'May': <CalendarClock />,
  'Jun': <CalendarClock />,
  'Jul': <CalendarClock />,
  'Aug': <CalendarClock />,
  'Sep': <CalendarClock />,
  'Oct': <CalendarClock />,
  'Nov': <CalendarClock />,
  'Dec': <CalendarClock />,
  'Resources': <BookMarked />,
};

const getMonthsTillYear = (year: number): MenuItem[] =>
  ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m) => ({
    label: m,
    href: `/insight/${year}/${m.toLowerCase()}`,
  }));

const SidebarLayout: React.FC<SidebarLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [selectedLabel, setSelectedLabel] = useState<string>('Pectra');
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  const [dynamicYears, setDynamicYears] = useState<MenuItem[]>([]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    const currentYear = new Date().getFullYear();
    setDynamicYears([{ label: String(currentYear), children: getMonthsTillYear(currentYear) }]);
  }, []);

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  const toggleExpand = (path: string) => {
    setExpandedItems((prev) => {
      const newExpandedItems: Record<string, boolean> = {};
      const level = path.split('/').length;

      for (const key in prev) {
        if (key.split('/').length !== level) {
          newExpandedItems[key] = prev[key];
        }
      }

      newExpandedItems[path] = !prev[path];
      return newExpandedItems;
    });
  };

  const handleMenuClick = (label: string) => {
    setSelectedLabel(label);
    if (isMobile) setIsSidebarOpen(false);
  };

  const renderMenu = (items: MenuItem[], level = 0, parentPath = ''): JSX.Element => (
    <div className={`pl-${level * 4}`}>
      {items.map((item) => {
        const currentPath = parentPath ? `${parentPath}/${item.label}` : item.label;
        const isExpanded = expandedItems[currentPath];

        return (
          <div className="mb-2" key={item.label}>
            {item.children ? (
              <div className="flex flex-col">
                <button
                  className="flex items-center justify-between px-3 py-2 hover:bg-gray-800 rounded"
                  onClick={() => toggleExpand(currentPath)}
                >
                  <div className="flex items-center gap-2">
                    {iconsMap[item.label] && <span>{iconsMap[item.label]}</span>}
                    {isSidebarOpen && <span>{item.label}</span>}
                  </div>
                  {isSidebarOpen && (isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />)}
                </button>
                {isExpanded && (
                  <div className="ml-4 border-l border-gray-600 pl-2">
                    {renderMenu(item.children, level + 1, currentPath)}
                  </div>
                )}
              </div>
            ) : (
              <Link
                href={item.href || '#'}
                className={`flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-800 ${selectedLabel === item.label ? 'bg-gray-800' : ''}`}
                onClick={() => handleMenuClick(item.label)}
              >
                {iconsMap[item.label] && <span>{iconsMap[item.label]}</span>}
                {isSidebarOpen && <span>{item.label}</span>}
              </Link>
            )}
          </div>
        );
      })}
    </div>
  );

  const menuStructure: MenuItem[] = [
    { label: 'Pectra', href: '/upgrade' },
    {
      label: 'All EIPs',
      children: [
        { label: 'All', href: '/all' },
        { label: 'EIP', href: '/eip' },
        { label: 'ERC', href: '/erc' },
        { label: 'RIP', href: '/rip' },
      ],
    },
    {
      label: 'Tools',
      children: [
        { label: 'Analytics', href: '/Analytics' },
        { label: 'Boards', href: '/boards' },
        { label: 'Editors & Reviewers Leaderboard', href: '/Reviewers' },
        { label: 'EIP Proposal Builder', href: '/proposalbuilder' },
        {
          label: 'Search By',
          children: [
            { label: 'Author', href: '/authors' },
            { label: 'EIP', href: '/SearchEip' },
            { label: 'EIP Title', href: '/SearchEipTitle' },
            { label: 'PR/ISSUE', href: '/SearchPRSandISSUES' },
          ],
        },
      ],
    },
    {
      label: 'Insight',
      children: [
        ...dynamicYears,
        { label: '2024', children: getMonthsTillYear(2024) },
        { label: '2023', children: getMonthsTillYear(2023) },
        { label: '2022', children: getMonthsTillYear(2022) },
        { label: '2021', children: getMonthsTillYear(2021) },
        { label: '2020', children: getMonthsTillYear(2020) },
        { label: '2019', children: getMonthsTillYear(2019) },
        { label: '2018', children: getMonthsTillYear(2018) },
        { label: '2017', children: getMonthsTillYear(2017) },
        { label: '2016', children: getMonthsTillYear(2016) },
        { label: '2015', children: getMonthsTillYear(2015) },
      ],
    },
    { label: 'Resources', href: '/resources' },
  ];

  return (
    <div className="flex h-screen bg-[#0d1117] text-white relative">
      <div className={`${isMobile ? (isSidebarOpen ? 'w-full' : 'w-20') : (isSidebarOpen ? 'w-64' : 'w-20')} transition-all duration-300 bg-[#0d1117] border-r border-gray-700 p-4 flex flex-col z-50`}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Image src="/EIPsInsights.gif" width={30} height={30} alt="logo" />
            {isSidebarOpen && <span className="font-bold text-lg whitespace-nowrap">EIPs Insight</span>}
          </div>
          <button onClick={toggleSidebar} className="text-white p-1 rounded hover:bg-gray-800">
            {isSidebarOpen ? '✖' : '☰'}
          </button>
        </div>

        <nav className="flex flex-col gap-2 overflow-y-auto hide-scrollbar">
          {renderMenu(menuStructure)}
        </nav>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden relative hide-scrollbar">
        <div className="sticky top-0 z-10 bg-[#0d1117] border-b border-gray-700 px-4 h-[75px] flex items-center justify-between">
          <h1 className="text-xl font-semibold">{selectedLabel}</h1>
          <SearchBox />
        </div>
        <div className="min-h-[calc(100vh-75px)]">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader />
            </div>
          ) : (
            children
          )}
        </div>
      </div>
    </div>
  );
};

export default SidebarLayout;
