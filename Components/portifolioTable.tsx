"use client";

import React, { useMemo, useState, useEffect } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { table_row } from "../Data/portifolio";
import axios from "axios";
import { io, Socket } from "socket.io-client";

type Props = {
  data: table_row[];
};

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://real-time-portfolio-dashboard-be.onrender.com";

export const socket: Socket = io(BASE_URL, {
  transports: ["polling", "websocket"],
  autoConnect: false,
});

export default function PortfolioTable({ data }: Props) {
  const [cmpData, setCmpData] = useState<Record<string, number>>({});
  const [fundamentalData, setFundamentalData] = useState<
    Record<string, { peRatio: number | null; lastestEarnings: number | null }>
  >({});
  const [cmpLoading, setCmpLoading] = useState(false);
  const [fundamentalLoading, setFundamentalLoading] = useState(false);

  // Real-time WebSocket Price Tracking Pipeline
  useEffect(() => {
    if (!data || data.length === 0) return;

    const symbols = data.map((d) => d.exchange_code);
    socket.connect();

    socket.on("connect", () => {
      socket.emit("subscribe:cmp", symbols);
    });

    socket.on("cmp:update", (payload) => {
      setCmpData((prev) => ({ ...prev, ...payload }));
      setCmpLoading(false);
    });

    setCmpLoading(true);

    return () => {
      socket.emit("unsubscribe:cmp");
      socket.off("cmp:update");
      socket.off("connect");
      socket.disconnect();
    };
  }, [data]);

  // Structural Fundamentals Data Collection Pipeline
  useEffect(() => {
    if (!data || data.length === 0) return;
    const fetchFundamentals = async () => {
      setFundamentalLoading(true);
      try {
        const uniqueStocks = Array.from(
          new Set(data.map((d) => `${d.exchange_code}-${d.exchange}`)),
        );
        const newEntries: Record<string, any> = {};

        await Promise.all(
          uniqueStocks.map(async (key) => {
            const [code, exchange] = key.split("-");
            if (fundamentalData[code]) return;
            try {
              const res = await axios.get(`${BASE_URL}/api/fundamentals`, {
                params: {
                  symbol: code,
                  exchange: exchange === "NSE" ? "NSE" : "BOM",
                },
              });
              newEntries[code] = res.data;
            } catch (err) {
              console.error(`Error fetching ${code}:`, err);
            }
          }),
        );
        if (Object.keys(newEntries).length > 0) {
          setFundamentalData((prev) => ({ ...prev, ...newEntries }));
        }
      } finally {
        setFundamentalLoading(false);
      }
    };
    fetchFundamentals();
  }, [data]);

  // Aggregated Portfolio Metrics (Optimized Fix Integrated)
  const total_investment = useMemo(() => {
    return data.reduce(
      (sum, stock) => sum + stock.purchase_price * stock.quantity,
      0,
    );
  }, [data]);

  const total_pv = useMemo(() => {
    return data.reduce((sum, stock) => {
      const cmp = cmpData[stock.exchange_code];
      const val = cmp
        ? cmp * stock.quantity
        : stock.purchase_price * stock.quantity;
      return sum + val;
    }, 0);
  }, [data, cmpData]);

  const total_gl = total_pv - total_investment;
  const total_gl_percentage =
    total_investment > 0 ? (total_gl / total_investment) * 100 : 0;

  // Structural Category Splitting Mechanics
  const sectorGroups = useMemo(() => {
    const groups: Record<string, table_row[]> = {};
    data.forEach((stock) => {
      if (!groups[stock.sector]) groups[stock.sector] = [];
      groups[stock.sector].push(stock);
    });
    return groups;
  }, [data]);

  const sectorInvestment = (stocks: table_row[]) =>
    stocks.reduce((sum, s) => sum + s.purchase_price * s.quantity, 0);

  const sectorPresentValue = (stocks: table_row[]) =>
    stocks.reduce((sum, s) => {
      const cmp = cmpData[s.exchange_code];
      return sum + (cmp ? cmp * s.quantity : s.purchase_price * s.quantity);
    }, 0);

  // TanStack Table Setup Attributes
  const columns = useMemo<ColumnDef<table_row>[]>(
    () => [
      { header: "Asset Details", accessorKey: "name" },
      { header: "Market / Ticker", accessorKey: "exchange_code" },
      { header: "Purchase Context", accessorKey: "purchase_price" },
      { header: "Live Value Indicators", accessorKey: "exchange_code" },
      { header: "Yield Context (P&L)", accessorKey: "exchange_code" },
      { header: "Structural Multiples", accessorKey: "exchange_code" },
    ],
    [],
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="w-full min-h-screen bg-[#0B0F19] text-gray-100 p-4 md:p-8 font-sans selection:bg-cyan-500/20 selection:text-cyan-400">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Workspace Title Header Block */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800/60 pb-5">
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 shadow-lg shadow-cyan-500/50" />
              Terminal Portfolio Engine
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              Real-time WebSocket data orchestration engine.
            </p>
          </div>

          {/* Global Network Feed Status Flags */}
          <div className="flex items-center gap-3 text-[11px] font-mono font-semibold bg-[#121826] px-4 py-2 rounded-xl border border-gray-800/80">
            <span className="text-gray-500">FEED:</span>
            {cmpLoading || fundamentalLoading ? (
              <span className="text-amber-400 flex items-center gap-1.5 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />{" "}
                SYNCING STREAM
              </span>
            ) : (
              <span className="text-cyan-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-ping" />{" "}
                CHANNELS HOT
              </span>
            )}
          </div>
        </div>

        {/* Executive Glassmorphic Financial Parameter Grid */}
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="bg-[#121826]/70 border border-gray-800/60 p-5 rounded-xl shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-gray-700" />
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
              Capital Investment
            </span>
            <span className="text-2xl font-mono font-bold text-white tracking-tight">
              ₹
              {total_investment.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
              })}
            </span>
          </div>

          <div className="bg-[#121826]/70 border border-gray-800/60 p-5 rounded-xl shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500" />
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
              Current Valuation
            </span>
            <span className="text-2xl font-mono font-bold text-cyan-400 tracking-tight">
              ₹{total_pv.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div
            className={`border p-5 rounded-xl shadow-2xl relative overflow-hidden transition-all ${total_gl >= 0 ? "bg-emerald-950/20 border-emerald-800/30" : "bg-rose-950/20 border-rose-800/30"}`}
          >
            <div
              className={`absolute top-0 left-0 w-1 h-full ${total_gl >= 0 ? "bg-emerald-500" : "bg-rose-500"}`}
            />
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
              Aggregate Net Returns
            </span>
            <div className="flex items-baseline gap-2">
              <span
                className={`text-2xl font-mono font-bold ${total_gl >= 0 ? "text-emerald-400" : "text-rose-400"}`}
              >
                {total_gl >= 0 ? "+" : ""}₹
                {total_gl.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </span>
              <span
                className={`text-xs font-mono font-bold ${total_gl >= 0 ? "text-emerald-400/80" : "text-rose-400/80"}`}
              >
                ({total_gl_percentage.toFixed(2)}%)
              </span>
            </div>
          </div>
        </div>

        {/* High Density Ledger Workplace Canvas */}
        <div className="bg-[#121826]/40 border border-gray-800/50 rounded-xl overflow-hidden shadow-2xl backdrop-blur-md">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs font-mono">
              {/* Table Column Headers */}
              <thead className="bg-[#121826] border-b border-gray-800 text-gray-400 text-[10px] uppercase tracking-widest font-bold">
                <tr>
                  <th className="p-4 text-left font-sans">Asset Details</th>
                  <th className="p-4 text-left font-sans">Market / Ticker</th>
                  <th className="p-4 text-right font-sans">Purchase Context</th>
                  <th className="p-4 text-right font-sans">Live Valuation</th>
                  <th className="p-4 text-right font-sans">Yield (P&L)</th>
                  <th className="p-4 text-right font-sans rounded-tr-xl">
                    Multiples & Metrics
                  </th>
                </tr>
              </thead>

              {/* Data Table Core Scope */}
              <tbody className="divide-y divide-gray-800/40">
                {Object.entries(sectorGroups).map(([sector, stocks]) => {
                  const sInv = sectorInvestment(stocks);
                  const sPv = sectorPresentValue(stocks);
                  const sGl = sPv - sInv;

                  return (
                    <React.Fragment key={sector}>
                      {/* Sector Separation Identifier Grid Row */}
                      <tr className="bg-[#161D2F]/60 border-y border-gray-800/80 font-sans font-bold">
                        <td
                          colSpan={2}
                          className="p-3.5 text-xs text-cyan-400 font-semibold uppercase tracking-wider"
                        >
                          {sector}
                        </td>
                        <td className="p-3.5 text-right text-gray-500 font-mono text-[11px]">
                          ₹
                          {sInv.toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                          })}
                        </td>
                        <td className="p-3.5 text-right text-cyan-400/90 font-mono text-[11px]">
                          ₹
                          {sPv.toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                          })}
                        </td>
                        <td
                          colSpan={2}
                          className={`p-3.5 text-right font-mono text-[11px] ${sGl >= 0 ? "text-emerald-400" : "text-rose-400"}`}
                        >
                          {sGl >= 0 ? "▲ +" : "▼ "}
                          {sGl.toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                          })}
                        </td>
                      </tr>

                      {/* Map Matrix Asset Allocation Rows */}
                      {stocks.map((stock) => {
                        const cmp = cmpData[stock.exchange_code];
                        const inv = stock.purchase_price * stock.quantity;
                        const pv = cmp ? cmp * stock.quantity : inv;
                        const gl = pv - inv;
                        const pct =
                          total_investment > 0
                            ? ((inv / total_investment) * 100).toFixed(2)
                            : "0.00";
                        const pe =
                          fundamentalData[stock.exchange_code]?.peRatio;
                        const eps =
                          fundamentalData[stock.exchange_code]?.lastestEarnings;

                        return (
                          <tr
                            key={stock.exchange_code}
                            className="hover:bg-[#161d2f]/20 transition-colors group"
                          >
                            {/* Asset Name Column */}
                            <td className="p-4 font-sans font-semibold text-gray-200 text-left border-r border-gray-800/20 group-hover:text-cyan-400 transition-colors">
                              {stock.name}
                            </td>

                            {/* Market Flag Badge Column */}
                            <td className="p-4 text-left border-r border-gray-800/20">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${cmp ? "bg-emerald-500 animate-pulse" : "bg-gray-600"}`}
                                />
                                <span className="text-gray-300 font-bold text-[11px]">
                                  {stock.exchange_code}
                                </span>
                                <span className="text-[9px] text-gray-500 font-sans border border-gray-800 px-1.5 py-0.5 rounded-md bg-[#0B0F19]">
                                  {stock.exchange}
                                </span>
                              </div>
                            </td>

                            {/* Purchase Cost Parameter Matrix */}
                            <td className="p-4 text-right border-r border-gray-800/20 text-gray-400">
                              <div className="font-bold text-gray-300">
                                ₹{stock.purchase_price.toFixed(2)}
                              </div>
                              <div className="text-[10px] text-gray-500 mt-0.5">
                                Qty: {stock.quantity}
                              </div>
                            </td>

                            {/* Live Valuation Output Data Fields */}
                            <td className="p-4 text-right border-r border-gray-800/20 bg-cyan-505/5">
                              <div className="font-bold text-white tracking-tight">
                                ₹
                                {pv.toLocaleString("en-IN", {
                                  minimumFractionDigits: 2,
                                })}
                              </div>
                              <div className="text-[10px] font-semibold text-cyan-500/80 mt-0.5">
                                CMP: ₹
                                {cmp
                                  ? cmp.toFixed(2)
                                  : stock.purchase_price.toFixed(2)}
                              </div>
                            </td>

                            {/* Live Floating P&L Yield Output Metric Data Fields */}
                            <td
                              className={`p-4 text-right border-r border-gray-800/20 font-bold ${gl >= 0 ? "text-emerald-400 bg-emerald-950/5" : "text-rose-400 bg-rose-950/5"}`}
                            >
                              <div>
                                {gl >= 0 ? "+" : ""}₹{gl.toFixed(2)}
                              </div>
                              <div className="text-[10px] opacity-80 mt-0.5">
                                {inv > 0
                                  ? ((gl / inv) * 100).toFixed(2)
                                  : "0.00"}
                                %
                              </div>
                            </td>

                            {/* Fundamental Multiples Evaluation Arrays */}
                            <td className="p-4 text-right text-gray-300">
                              <div className="flex items-center justify-end gap-1.5">
                                <span className="text-gray-500 text-[10px] font-sans">
                                  P/E:
                                </span>
                                <span className="font-bold text-gray-200">
                                  {pe ? pe.toFixed(1) : "—"}
                                </span>
                              </div>
                              <div className="flex items-center justify-end gap-1.5 mt-0.5 text-[10px]">
                                <span className="text-gray-500 font-sans">
                                  EPS:
                                </span>
                                <span className="text-gray-400">
                                  {eps ? eps.toFixed(1) : "—"}
                                </span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </React.Fragment>
                  );
                })}

                {/* Ultimate System Baseline Summary Metrics Node */}
                <tr className="bg-[#121826] text-white font-sans font-bold text-sm">
                  <td
                    colSpan={2}
                    className="p-4 rounded-bl-xl tracking-wide text-gray-300"
                  >
                    Portfolio Aggregate
                  </td>
                  <td className="p-4 text-right font-mono text-xs text-gray-400 font-medium">
                    ₹
                    {total_investment.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    })}
                  </td>
                  <td className="p-4 text-right font-mono text-xs text-cyan-400 font-bold tracking-tight">
                    ₹
                    {total_pv.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    })}
                  </td>
                  <td
                    className={`p-4 text-right font-mono text-xs font-bold ${total_gl >= 0 ? "text-emerald-400" : "text-rose-400"}`}
                  >
                    {total_gl >= 0 ? "+" : ""}₹
                    {total_gl.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    })}
                  </td>
                  <td className="p-4 text-right rounded-br-xl text-gray-600 font-mono text-xs">
                    {total_gl_percentage.toFixed(2)}% YLD
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
