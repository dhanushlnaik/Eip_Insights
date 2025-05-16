'use client';
import { motion } from 'motion/react';
import Link from 'next/link';
import React, { useMemo, useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
  SortingState,
  ColumnFiltersState,
} from '@tanstack/react-table';

interface EIP {
  eip: string;
  title: string;
  author: string;
  type: string; // Added the missing 'type' property
  status: string; // Added the missing 'status' property
  category: string; // Added the missing 'category' property
  discussion: string; // Added the missing 'discussion' property
}

const PectraData = [
  {
    eip: '2537',
    title: 'Precompile for BLS12-381 curve operations',
    author:
      'Alex Vlasov (@shamatar), Kelly Olson (@ineffectualproperty), Alex Stokes (@ralexstokes), Antonio Sanso (@asanso)',
    link: 'https://eipsinsight.com/eips/eip-2537',
    type: 'Standards Track',
    status: 'Draft',
    category: 'Core',
    discussion:
      'https://ethereum-magicians.org/t/eip2537-bls12-precompile-discussion-thread/4187',
  },
  {
    eip: '2935',
    title: 'Serve historical block hashes from state',
    author:
      'Vitalik Buterin (@vbuterin), Tomasz Stanczak (@tkstanczak), Guillaume Ballet (@gballet), Gajinder Singh (@g11tech), Tanishq Jasoria (@tanishqjasoria), Ignacio Hagopian (@jsign), Jochem Brouwer (@jochem-brouwer)',
    link: 'https://eipsinsight.com/eips/eip-2935',
    type: 'Standards Track',
    status: 'Draft',
    category: 'Core',
    discussion:
      'https://ethereum-magicians.org/t/eip-2935-save-historical-block-hashes-in-state/4565',
  },
  {
    eip: '6110',
    title: 'Supply validator deposits on chain',
    author:
      'Mikhail Kalinin (@mkalinin), Danny Ryan (@djrtwo), Peter Davies (@petertdavies)',
    link: 'https://eipsinsight.com/eips/eip-6110',
    type: 'Standards Track',
    status: 'Draft',
    category: 'Core',
    discussion:
      'https://ethereum-magicians.org/t/eip-6110-supply-validator-deposits-on-chain/12072',
  },
  {
    eip: '7002',
    title: 'Execution layer triggerable withdrawals',
    author:
      'Danny Ryan (@djrtwo), Mikhail Kalinin (@mkalinin), Ansgar Dietrichs (@adietrichs), Hsiao-Wei Wang (@hwwhww), lightclient (@lightclient)',
    link: 'https://eipsinsight.com/eips/eip-7002',
    type: 'Standards Track',
    status: 'Draft',
    category: 'Core',
    discussion:
      'https://ethereum-magicians.org/t/eip-7002-execution-layer-triggerable-exits/14195',
  },
  {
    eip: '7251',
    title: 'Increase the MAX_EFFECTIVE_BALANCE',
    author:
      'mike (@michaelneuder), Francesco (@fradamt), dapplion (@dapplion), Mikhail (@mkalinin), Aditya (@adiasg), Justin (@justindrake), lightclient (@lightclient)',
    link: 'https://eipsinsight.com/eips/eip-2251',
    type: 'Standards Track',
    status: 'Draft',
    category: 'Core',
    discussion:
      'https://ethereum-magicians.org/t/eip-7251-increase-the-max-effective-balance/15982',
  },
  {
    eip: '7549',
    title: 'Move committee index outside Attestation',
    author: 'dapplion (@dapplion)',
    link: 'https://eipsinsight.com/eips/eip-7549',
    type: 'Standards Track',
    status: 'Draft',
    category: 'Core',
    discussion:
      'https://ethereum-magicians.org/t/eip-7549-move-committee-index-outside-attestation/16390',
  },

  {
    eip: '7685',
    title: 'General purpose execution layer requests',
    author: 'lightclient (@lightclient)',
    link: 'https://eipsinsight.com/eips/eip-7685',
    type: 'Standards Track',
    status: 'Draft',
    category: 'Core',
    discussion:
      'https://ethereum-magicians.org/t/eip-7685-general-purpose-execution-layer-requests/19668',
  },
  {
    eip: '7702',
    title: 'Set EOA account code',
    author:
      'Vitalik Buterin (@vbuterin), Sam Wilson (@SamWilsn), Ansgar Dietrichs (@adietrichs), Matt Garnett (@lightclient)',
    link: 'https://eipsinsight.com/eips/eip-7702',
    type: 'Standards Track',
    status: 'Draft',
    category: 'Core',
    discussion:
      'https://ethereum-magicians.org/t/eip-set-eoa-account-code-for-one-transaction/19923',
  },
  {
    eip: '7691',
    title: 'Blob throughput increase',
    author:
      'Parithosh Jayanthi (@parithosh), Toni Wahrstätter (@nerolation), Sam Calder-Mason (@samcm), Andrew Davis (@savid), Ansgar Dietrichs (@adietrichs)',
    link: 'https://eipsinsight.com/eips/eip-7691',
    type: 'Standards Track',
    status: 'Draft',
    category: 'Core',
    discussion:
      'https://ethereum-magicians.org/t/eip-7691-blob-throughput-increase/19694',
  },
  {
    eip: '7623',
    title: 'Increase calldata cost',
    author: 'Toni Wahrstätter (@nerolation), Vitalik Buterin (@vbuterin)',
    link: 'https://eipsinsight.com/eips/eip-7623',
    type: 'Standards Track',
    status: 'Draft',
    category: 'Core',
    discussion:
      'https://ethereum-magicians.org/t/eip-7623-increase-calldata-cost/18647',
  },
  {
    eip: '7840',
    title: 'Add blob schedule to EL config files',
    author: 'lightclient (@lightclient)',
    link: 'https://eipsinsight.com/eips/eip-7840',
    type: 'Standards Track',
    status: 'Draft',
    category: 'Core',
    discussion:
      'https://ethereum-magicians.org/t/add-blob-schedule-to-execution-client-configuration-files/22182',
  },
  //   {
  //     eip: "3670",
  //     title: "EOF - Code Validation",
  //     author: "Alex Beregszaszi (@axic), Andrei Maiboroda (@gumb0), Paweł Bylica (@chfast)",
  //     link: "https://eipsinsight.com/eips/eip-3670",
  //     type:"Standards Track",
  //   category:"Core",
  //   discussion:"https://ethereum-magicians.org/t/eip-3670-eof-code-validation/6693"
  // },
  //   {
  //     eip: "4200",
  //     title: "EOF - Static relative jumps",
  //     author: "Alex Beregszaszi (@axic), Andrei Maiboroda (@gumb0), Paweł Bylica (@chfast)",
  //     link: "https://eipsinsight.com/eips/eip-4200",
  //     type:"Standards Track",
  //   category:"Core",
  //   discussion:"https://ethereum-magicians.org/t/eip-3920-static-relative-jumps/7108"
  // },
  //   {
  //     eip: "4750",
  //     title: "EOF - Functions",
  //     author: "Andrei Maiboroda (@gumb0), Alex Beregszaszi (@axic), Paweł Bylica (@chfast)",
  //     link: "https://eipsinsight.com/eips/eip-4750",
  //     type:"Standards Track",
  //   category:"Core",
  //   discussion:"https://ethereum-magicians.org/t/eip-4750-eof-functions/8195"
  // },
  //   {
  //     eip: "5450",
  //     title: "EOF - Stack Validation",
  //     author: "Andrei Maiboroda (@gumb0), Paweł Bylica (@chfast), Alex Beregszaszi (@axic), Danno Ferrin (@shemnon)",
  //     link: "https://eipsinsight.com/eips/eip-5450",
  //     type:"Standards Track",
  //   category:"Core",
  //   discussion:"https://ethereum-magicians.org/t/eip-5450-eof-stack-validation/10410"
  // },
  //   {
  //     eip: "6206",
  //     title: "EOF - JUMPF and non-returning functions",
  //     author: "Andrei Maiboroda (@gumb0), Alex Beregszaszi (@axic), Paweł Bylica (@chfast), Matt Garnett (@lightclient)",
  //     link: "https://eipsinsight.com/eips/eip-6206",
  //     type:"Standards Track",
  //   category:"Core",
  //   discussion:"https://ethereum-magicians.org/t/eip-4750-eof-functions/8195"
  // },
  //   {
  //     eip: "7069",
  //     title: "Revamped CALL instructions",
  //     author: "Alex Beregszaszi (@axic), Paweł Bylica (@chfast), Danno Ferrin (@shemnon), Andrei Maiboroda (@gumb0), Charles Cooper (@charles-cooper)",
  //     link: "https://eipsinsight.com/eips/eip-7069",
  //     type:"Standards Track",
  //   category:"Core",
  //   discussion:"https://ethereum-magicians.org/t/eip-revamped-call-instructions/14432"
  // },
  //   {
  //     eip: "7480",
  //     title: "EOF - Data section access instructions",
  //     author: "Andrei Maiboroda (@gumb0), Alex Beregszaszi (@axic), Paweł Bylica (@chfast)",
  //     link: "https://eipsinsight.com/eips/eip-7480",
  //     type:"Standards Track",
  //   category:"Core",
  //   discussion:"https://ethereum-magicians.org/t/eip-7480-eof-data-instructions/15414"
  // },
  //   {
  //     eip: "7620",
  //     title: "EOF Contract Creation",
  //     author: "Alex Beregszaszi (@axic), Paweł Bylica (@chfast), Andrei Maiboroda (@gumb0), Piotr Dobaczewski (@pdobacz)",
  //     link: "https://eipsinsight.com/eips/eip-7620",
  //     type:"Standards Track",
  //   category:"Core",
  //   discussion:"https://ethereum-magicians.org/t/eip-7620-eof-contract-creation-instructions/18625"
  // },
  //   {
  //     eip: "7698",
  //     title: "EOF - Creation transaction",
  //     author: "Piotr Dobaczewski (@pdobacz), Andrei Maiboroda (@gumb0), Paweł Bylica (@chfast), Alex Beregszaszi (@axic)",
  //     link: "https://eipsinsight.com/eips/eip-7698",
  //     type:"Standards Track",
  //   category:"Core",
  //   discussion:"https://ethereum-magicians.org/t/eip-7698-eof-creation-transaction/19784"
  // },
];


const PectraTable = () => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const convertAndDownloadCSV = () => {
    if (PectraData && PectraData.length > 0) {
      const headers = Object.keys(PectraData[0]).join(",") + "\n";
      const csvRows = PectraData.map((item) => {
        const values = Object.values(item).map((value) =>
          typeof value === "string" && value.includes(",")
            ? `"${value}"`
            : value
        );
        return values.join(",");
      });
      const csvContent = headers + csvRows.join("\n");
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "Pectra.csv";
      a.click();
      window.URL.revokeObjectURL(url);
    }
  };

  const factorAuthor = (data: string) => {
    const list = data.split(",");
    if (list[list.length - 1]?.trim() === "al.") list.pop();
    return list;
  };

  const columnHelper = createColumnHelper<EIP>();
  const columns = useMemo(() => [
    columnHelper.accessor("eip", {
      header: "EIP",
      cell: (info) => (
        <Link href={`/eips/eip-${info.getValue()}`}>
          <span className="bg-purple-700/30 border border-purple-500/30 px-2 py-1 rounded-md shadow-md hover:scale-105 transition">
            {info.getValue()}
          </span>
        </Link>
      ),
    }),
    columnHelper.accessor("title", {
      header: "Title",
      cell: (info) => (
        <Link
          href={`/eips/eip-${info.row.original.eip}`}
          className="hover:text-fuchsia-200 transition"
        >
          {info.getValue()}
        </Link>
      ),
    }),
    columnHelper.accessor("author", {
      header: "Author",
      cell: (info) => (
        <div className="flex flex-wrap gap-1">
          {factorAuthor(info.getValue()).map((item, i) => {
            const raw = item[item.length - 1];
            const t = raw.substring(1, raw.length - 1);
            const isEmail = raw.endsWith(">");
            return (
              <Link
                key={i}
                href={isEmail ? `mailto:${t}` : `https://github.com/${t}`}
                target="_blank"
                className="underline underline-offset-2 hover:text-pink-400"
              >
                {item}
              </Link>
            );
          })}
        </div>
      ),
    }),
    columnHelper.accessor("type", {
      header: "Type",
      cell: (info) => <span className="text-purple-300">{info.getValue()}</span>,
    }),
    columnHelper.accessor("category", {
      header: "Category",
      cell: (info) => <span className="text-teal-300">{info.getValue()}</span>,
    }),
    columnHelper.accessor("discussion", {
      header: "Discussion",
      cell: (info) => (
        <button
          onClick={() => window.open(info.getValue(), "_blank")}
          className="bg-gradient-to-br from-purple-600 to-pink-500 hover:brightness-110 text-white px-4 py-2 rounded-md text-sm shadow-md"
        >
          View
        </button>
      ),
    }),
  ], [columnHelper]);

  const table = useReactTable({
    data: PectraData,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 15 }}
      className="p-6 mt-6 mb-10 max-w-7xl mx-auto rounded-2xl shadow-2xl border border-purple-200/40 bg-gradient-to-br from-gray-900/50 to-gray-800/60 backdrop-blur-2xl text-white"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">
          Pectra - [{PectraData.length}]
        </h2>
        <button
          onClick={convertAndDownloadCSV}
          className="bg-purple-600 hover:bg-purple-700 text-white text-sm px-4 py-2 rounded-md shadow-md"
        >
          Download Report
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="text-purple-100">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="px-4 py-2 bg-purple-800/50">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {header.column.getCanFilter() && (
                      <div className="mt-2">
                        <input
                          type="text"
                          placeholder="Filter..."
                          value={(header.column.getFilterValue() ?? "") as string}
                          onChange={(e) => header.column.setFilterValue(e.target.value)}
                          className="bg-white/10 border border-purple-300/20 rounded px-2 py-1 mt-1 text-white text-xs w-full focus:outline-none focus:ring-1 focus:ring-purple-500"
                        />
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="hover:bg-white/10 transition">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="text-center px-4 py-3">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-6 text-sm">
        <div className="text-purple-300">
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {table.getPageCount()}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            className="px-3 py-1 rounded-md bg-purple-500/30 text-white hover:bg-purple-500/50 disabled:opacity-40"
          >
            {"<<"}
          </button>
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="px-3 py-1 rounded-md bg-purple-500/30 text-white hover:bg-purple-500/50 disabled:opacity-40"
          >
            {"<"}
          </button>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="px-3 py-1 rounded-md bg-purple-500/30 text-white hover:bg-purple-500/50 disabled:opacity-40"
          >
            {">"}
          </button>
          <button
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
            className="px-3 py-1 rounded-md bg-purple-500/30 text-white hover:bg-purple-500/50 disabled:opacity-40"
          >
            {">>"}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default PectraTable;
