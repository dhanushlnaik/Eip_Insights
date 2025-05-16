import React, { useState, useEffect } from 'react';
import CopyLink from './CopyLink';
import { useToast } from '@/hooks/use-toast';
import ReactECharts from 'echarts-for-react';
import { Download as DownloadIcon } from '@mynaui/icons-react';
import { ChevronDownIcon } from 'lucide-react';

interface LabelData {
  _id: string;
  category: string;
  monthYear: string;
  type: string;
  count: number;
}

interface PRDetails {
  repo: string;
  prNumber: number;
  prTitle: string;
  labels: string[];
  created_at: string;
  closed_at: string | null;
  merged_at: string | null;
}
const availableLabels = [
  'a-review',
  'e-review',
  'e-consensus',
  'stagnant',
  'stale',
  'created-by-bot',
  "miscellaneous"
];

const EipsLabelChart = () => {
  const [chartData, setChartData] = useState<LabelData[]>([]);
  const [prDetails, setPrDetails] = useState<PRDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRepo, setSelectedRepo] = useState('eips');
  const [showLabels, setShowLabels] = useState<Record<string, boolean>>(
    availableLabels.reduce((acc, label) => ({ ...acc, [label]: true }), {})
  );
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [chartResponse, prResponse] = await Promise.all([
          fetch(`/api/eipslabelchart/${selectedRepo}`),
          fetch(`/api/${selectedRepo}prdetails2`)
        ]);
        
        const chartData = await chartResponse.json();
        const prData = await prResponse.json();
        
        setChartData(chartData);
        setPrDetails(prData);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: 'Error fetching data',
          description: 'Could not load chart or PR details data',
          duration: 5000,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedRepo, toast]);

  const toggleLabel = (label: string) => {
    setShowLabels(prev => ({
      ...prev,
      [label]: !prev[label]
    }));
  };

  const convertToCSV = (data: PRDetails[]) => {
    const headers = ['Repo', 'PR Number', 'PR Title', 'Labels', 'Created At', 'Closed At', 'Merged At'];
    const rows = data.map(pr => [
      pr.repo,
      pr.prNumber,
      `"${pr.prTitle.replace(/"/g, '""')}"`, // Escape quotes in title
      `"${pr.labels.join(', ')}"`, // Wrap labels in quotes
      pr.created_at,
      pr.closed_at || '',
      pr.merged_at || ''
    ]);
  
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  const handleDownload = () => {
    // Filter PRs that have at least one of the selected labels
    const filteredPRs = prDetails.filter(pr => 
      pr.labels.some(label => showLabels[label])
    );

    if (filteredPRs.length === 0) {
      toast({
        title: 'No data to download',
        description: 'No PRs match the currently selected labels',
        duration: 3000,
      });
      return;
    }

    // Create CSV data
    // const csvData = convertToCSV(filteredPRs);
    const csvData = convertToCSV(filteredPRs);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${selectedRepo}-pr-details-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

const renderChart = () => {
  if (!Array.isArray(chartData)) return null;

  // Transform the data
  const transformedData = chartData.reduce((acc: Record<string, Record<string, number>>, { monthYear, type, count }) => {
    let effectiveType = type;
    if (!availableLabels.includes(type) && showLabels.miscellaneous) {
      effectiveType = 'miscellaneous';
    }

    if (showLabels[effectiveType]) {
      if (!acc[monthYear]) acc[monthYear] = {} as Record<string, number>;
      acc[monthYear][effectiveType] = (acc[monthYear][effectiveType] || 0) + count;
    }

    return acc;
  }, {});

  const allLabelsSet = new Set<string>();

  const categories = Object.keys(transformedData).sort((a, b) => a.localeCompare(b));
  const seriesDataMap: Record<string, number[]> = {};

  for (const month of categories) {
    const monthData = transformedData[month];
    Object.entries(monthData).forEach(([label, count]) => {
      if (!seriesDataMap[label]) {
        seriesDataMap[label] = Array(categories.length).fill(0);
      }
      const index = categories.indexOf(month);
      seriesDataMap[label][index] = count;
      allLabelsSet.add(label);
    });
  }

  const getColor = (type: string): string => {
    if (type.startsWith('a-')) return '#FFA500';
    if (type.startsWith('e-')) {
      const eColors: Record<string, string> = {
        'e-review': '#4169E1', 'e-consensus': '#1E90FF', 'e-blocked': '#4682B4',
        'e-blocking': '#5F9EA0', 'e-circular': '#00BFFF', 'e-number': '#87CEFA'
      };
      return eColors[type] || '#4169E1';
    }
    if (type.startsWith('w-')) {
      const wColors: Record<string, string> = {
        'w-response': '#FF6347', 'w-ci': '#CD5C5C', 'w-stale': '#DC143C', 'w-dependency': '#FF4500'
      };
      return wColors[type] || '#FF6347';
    }
    if (type.startsWith('c-')) {
      const cColors: Record<string, string> = {
        'c-new': '#32CD32', 'c-status': '#3CB371', 'c-update': '#2E8B57'
      };
      return cColors[type] || '#32CD32';
    }
    if (type.startsWith('s-')) {
      const sColors: Record<string, string> = {
        's-draft': '#9370DB', 's-final': '#8A2BE2', 's-lastcall': '#9932CC',
        's-review': '#BA55D3', 's-stagnant': '#800080', 's-withdrawn': '#D8BFD8'
      };
      return sColors[type] || '#9370DB';
    }
    if (type.startsWith('t-')) {
      const tColors: Record<string, string> = {
        't-core': '#20B2AA', 't-erc': '#48D1CC', 't-informational': '#40E0D0',
        't-interface': '#00CED1', 't-meta': '#008B8B', 't-networking': '#5F9EA0',
        't-process': '#66CDAA', 't-security': '#7FFFD4'
      };
      return tColors[type] || '#20B2AA';
    }
    if (type.startsWith('r-')) {
      const rColors: Record<string, string> = {
        'r-ci': '#FF69B4', 'r-eips': '#DB7093', 'r-other': '#FF1493',
        'r-process': '#C71585', 'r-website': '#FFC0CB'
      };
      return rColors[type] || '#FF69B4';
    }
    const fixedColors: Record<string, string> = {
      bug: '#FF0000',
      enhancement: '#00FF00',
      dependencies: '#FFFF00',
      stagnant: '#8B008B',
      stale: '#B22222',
      'created-by-bot': 'green',
      'discussions-to': '#778899',
      question: '#98FB98',
      javascript: '#F0E68C',
      ruby: '#E9967A',
      unlabeled: '#A9A9A9',
      '1272989785': '#000000',
    };

    return fixedColors[type] || '#A9A9A9';
  };

  const series = Array.from(allLabelsSet).map((label) => ({
    name: label.length > 15 ? label.slice(0, 12) + '...' : label,
    type: 'bar',
    stack: 'total',
    emphasis: { focus: 'series' },
    itemStyle: { color: getColor(label) },
    data: seriesDataMap[label]
  }));

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
    },
    legend: {
      top: 10,
      type: 'scroll',
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '10%',
      containLabel: true,
    },
    xAxis: [
      {
        type: 'category',
        data: categories.map((month) => {
          const [year, monthNum] = month.split('-');
          return `${new Date(Number(year), Number(monthNum) - 1).toLocaleString('default', { month: 'short' })} '${year.slice(-2)}`;
        }),
        axisLabel: {
          rotate: 0,
        },
      },
    ],
    yAxis: [
      {
        type: 'value',
      },
    ],
    series,
    dataZoom: [
      {
        type: 'slider',
        start: 0,
        end: 100,
        bottom: 0,
      },
    ],
  };

  return <ReactECharts option={option} style={{ height: '500px', width: '100%' }} />;
};

  return (
    <div className="p-4">
      <div className="bg-white p-6 rounded-md shadow-sm">
        {loading ? (
          <div className="text-center py-10 text-gray-600">Loading chart data...</div>
        ) : (
          <>
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-6">
              {/* Title */}
              <h2 className="text-xl font-semibold text-black flex-shrink-0 flex items-center gap-2">
                EIPs Label Distribution
                <CopyLink link="https://eipsinsight.com//Analytics#EIPsLabelChart" />
              </h2>

              {/* Controls */}
              <div className="flex flex-col md:flex-row items-center gap-6">
                {/* Repo Selector */}
                <div className="min-w-[200px]">
                  <div className="relative">
                    <select
                      value={selectedRepo}
                      onChange={(e) => setSelectedRepo(e.target.value)}
                      className="w-[200px] bg-blue-500 text-white py-2 px-4 rounded-md shadow focus:outline-none"
                    >
                      <option value="eips">EIPs</option>
                      <option value="ercs">ERCs</option>
                    </select>
                    <ChevronDownIcon className="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-white pointer-events-none" />
                  </div>
                </div>

                {/* Labels Dropdown */}
                <div className="min-w-[200px] relative group">
                  <div className="relative">
                    <button className="w-[200px] bg-blue-500 text-white py-2 px-4 rounded-md shadow focus:outline-none">
                      Labels
                    </button>
                    <div className="absolute z-10 mt-2 hidden group-hover:block bg-white border border-gray-200 rounded-md shadow-md max-h-80 overflow-y-auto w-full">
                      {/* Select All / Remove All */}
                      <div className="flex justify-between px-3 py-2 border-b border-gray-200">
                        <button
                          className="text-blue-600 text-sm hover:underline"
                          onClick={() => {
                            const allSelected: Record<string, boolean> = {};
                            availableLabels.forEach((label) => (allSelected[label] = true));
                            setShowLabels(allSelected);
                          }}
                        >
                          Select All
                        </button>
                        <button
                          className="text-red-500 text-sm hover:underline"
                          onClick={() => {
                            const noneSelected: Record<string, boolean> = {};
                            availableLabels.forEach((label) => (noneSelected[label] = false));
                            setShowLabels(noneSelected);
                          }}
                        >
                          Remove All
                        </button>
                      </div>
                      {/* Label Checkboxes */}
                      {availableLabels.map((label) => (
                        <label
                          key={label}
                          className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={showLabels[label]}
                            onChange={() => toggleLabel(label)}
                            className="mr-2 text-blue-600"
                          />
                          {label}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Download Button */}
                <button
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2"
                  onClick={handleDownload}
                >
                  <DownloadIcon className="w-4 h-4" />
                  Download PR Data
                </button>
              </div>
            </div>

            {/* Chart */}
            {renderChart()}
          </>
        )}
      </div>
    </div>
  );
}

export default EipsLabelChart;