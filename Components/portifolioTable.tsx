'use client'

import React, {useMemo, useState, useEffect} from 'react';
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable
} from '@tanstack/react-table';
import { table_row } from '../Data/portifolio';
import axios from 'axios'
import { BeatLoader } from 'react-spinners'

type Props = {
    data: table_row[]
}


export default function PortfolioTable({data}: Props) {
    
    const [cmpData, setCmpData] = useState<Record<string, number>>({})
    const [fundamentalData, setFundamentalData] = 
        useState<Record<string, {peRatio: number | null; lastestEarning: number | null}>>({})
    const [cmpLoading, setCmpLoading] = useState(false)
    const [fundamentalLoading, setFundamentalLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Fetch CMP Data

    useEffect(() => {
        if (!data || data.length === 0) return

        let intervalId: NodeJS.Timeout
        const fetchCmpData = async () => {
            setCmpLoading(true)
            setError(null)

            try {
                const symbols = data.map(d => d.exchange_code).join(',')

                const response = await axios.get(
                    'http://localhost:5001/api/cmp',
                    {
                        params: { symbols }
                    }
                )

                const result = response?.data
                setCmpData(result)

            }
            catch (err) {
                console.error('CMP fetch failed',err)
                setError('Failed to fetch CMP data')
                setCmpData({})
            }
            finally {
                setCmpLoading(false)
            }
        }

        // Periodic API call
        if (data.length > 0) {
            fetchCmpData()
        
            intervalId = setInterval(() => {
              fetchCmpData()
            }, 60_000) // every 60 seconds
        }
        
        return () => {
            if (intervalId) clearInterval(intervalId)
          }
    },[data])

    // Fetch P/e ratio and LES data

    useEffect(() => {

        if (!data || data.length === 0) return
        const fetchFundamentals = async () => {
            setFundamentalLoading(true)

            try {
                const uniqueStocks = Array.from(
                    new Set(data.map(d =>`${d.exchange_code}-${d.exchange}`))
                )

                const newEntries: Record<string, any> = {}

                await Promise.all(
                    uniqueStocks.map(async key => {
                        const [code, exchange] = key.split('-')

                        if (fundamentalData[code]) return

                        try {
                            const res = await axios.get(
                                'http://localhost:5001/api/fundamentals',
                                {
                                    params: {
                                        symbol: code,
                                        exchange: exchange === 'NSE' ? 'NSE' : 'BOM'
                                    }
                                }
                            )
                            newEntries[code] = res.data
                        } 
                        catch (err) {
                            console.error(`Error fetching ${code}:`, err)
                        }
                    })
                )
                // Update state once with all new items
                if (Object.keys(newEntries).length > 0) {
                    setFundamentalData(prev => ({ ...prev, ...newEntries }))
                }
            }
            finally {
                setFundamentalLoading(false)
            }
        }
        fetchFundamentals()
    },[data])

    // Calculate Total Investment

    const total_investment = useMemo(() => {
        return data.reduce((sum, stock) => {
            return sum + (stock.purchase_price * stock.quantity)
        }, 0)
    },[data])

    // Calculate Total Present value

    const total_pv = useMemo(() => {
        return data.reduce((sum, stock) => {
            const cmp = cmpData[stock.exchange_code]
            if (!cmp) return sum
            return sum + cmp * stock.quantity
        }, 0)
    },[data, cmpData])

    const total_gl = total_pv - total_investment

    // Sector Grouping
    
    const sectorGroups = useMemo(() => {
        const groups: Record<string, table_row[]> = {}

        data.forEach(stock => {
            if (!groups[stock.sector]) {
                groups[stock.sector] = []
            }
            groups[stock.sector].push(stock)
        })
        return groups
    },[data])

    // Total Investment sector-wise

    const sectorInvestment = (stocks: table_row[]) => (
        stocks.reduce((sum, s) => sum + (s.purchase_price * s.quantity),
        0
        )
    )

    // Total Present value sector-wise

    const sectorPresentValue = (stocks: table_row[]) => (
        stocks.reduce((sum, s) => {
            const cmp = cmpData[s.exchange_code]
            if (!cmp) return sum
            const total = sum + (cmp * s.quantity)
            return total
        },
        0
        )
    )

    const columns = useMemo<ColumnDef<table_row>[]>(
        () => [
            {
                header: 'Particulars',
                accessorKey: 'name'
            },
            {
                header: 'Purchase Price',
                accessorKey: 'purchase_price'
            },
            {
                header: 'Qty',
                accessorKey: 'quantity'
            },
            {
                header: 'CMP',
                cell: ({row}) => {
                    const code = row.original.exchange_code
                    console.log(code, cmpData[code], 'code')
                    const cmp = cmpData[code]
                    return cmp ? cmp.toLocaleString() : 'N/A'
                }
            },
            {
                header: 'Present Value',
                cell: ({row}) => {
                    const {quantity, exchange_code} = row.original
                    const cmp = cmpData[exchange_code]
                    
                    if (!cmp) return 'N/A'

                    const pv = cmp * quantity
                    return pv.toFixed(2)
                }
            },
            {
                header: 'Gain / Loss',
                cell: ({row}) => {
                    const {exchange_code, purchase_price, quantity} = row.original
                    const cmp = cmpData[exchange_code]
                    const investment = purchase_price * quantity

                    if (!cmp) return 'N/A'

                    const pv = cmp * quantity
                    const gl = pv - investment
                    const isGain = gl >= 0

                    return (
                        <span className={isGain ? 'text-green-600' : 'text-red-600'}>
                            {gl.toFixed(2).toLocaleString()}
                        </span>
                    )
                }
            },
            {
                header: 'Investment',
                cell: ({row}) => {
                    const {purchase_price,quantity} = row.original
                    const investment = purchase_price * quantity
                    return investment.toLocaleString()
                }
            },
            {
                header: 'Portfolio %',
                cell: ({row}) => {
                    const { purchase_price, quantity} = row.original
                    const investment = purchase_price * quantity 
                    const percentage = (investment / total_investment) * 100
                    return percentage.toFixed(2) + '%'
                }
            },
            {
                header: 'P/E',
                cell: ({ row }) => {
                  const code = row.original.exchange_code
                  const pe = fundamentalData[code]?.peRatio
                  return pe !== null && pe !== undefined ? pe.toFixed(2) : 'N/A'
                }
            },
            {
                header: 'Latest Earnings',
                cell: ({ row }) => {
                  const code = row.original.exchange_code
                  const earning = fundamentalData[code]?.lastestEarning
                  return earning !== null && earning !== undefined
                    ? earning.toFixed(2)
                    : 'N/A'
                }
            },
            {
                header: 'Exchange',
                accessorKey: 'exchange'
            },
            {
                header: 'Code',
                accessorKey: 'exchange_code'
            },
        ],
        [cmpData, total_investment, fundamentalData]
    )

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel()
    })

    return (
        <div className='overflow-x-auto'>

            {/*  CMP Loading Indicator */}
            {cmpLoading && (
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <BeatLoader size={8} color="#4B5563" />
                    <span>Updating live prices…</span>
                </div>
            )}

             {/*  Fundament Data Loading Indicator */}
            {fundamentalLoading && (
                <div className="flex items-center gap-2 text-sm text-blue-600 mb-2">
                    <BeatLoader size={8} color="#2563EB" />
                    <span>Loading fundamentals…</span>
                </div>
            )}

            {/*  Portfolio Table */}
            <table className='w-full border text-sm'>
                <thead className='bg-gray-400'>
                    {table.getHeaderGroups().map(headerGroup => (
                        <tr key={headerGroup.id}>
                            {headerGroup.headers.map(header => (
                                <th key={header.id} className='border p-2 text-left'>
                                    {flexRender(
                                        header.column.columnDef.header,
                                        header.getContext()
                                    )}
                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>

                <tbody>
                    {Object.entries(sectorGroups).map(([sector, stocks]) => {
                        const investment = sectorInvestment(stocks)
                        const presentValue = sectorPresentValue(stocks)
                        const gainLoss = presentValue - investment

                        return (
                            <React.Fragment key={sector}>
                                {/* Sector Calculation */}
                                <tr className='bg-gray-200 font-semibold border p-1'>
                                    <td colSpan={3} className='border p-1'>{sector}</td>
                                    <td className='border p-1 text-center'>-</td>
                                    <td className='border p-1 text-center'>{presentValue.toFixed(2)}</td>
                                    <td className={gainLoss >= 0 ? 'text-green-600 text-center' : 'text-red-600 text-center'}>
                                        {gainLoss.toFixed(2)}
                                    </td>
                                    <td className='border p-1 text-center'>{investment.toLocaleString()}</td>
                                    <td className='border p-1 text-center'>-</td>
                                    <td className='border p-1 text-center'>-</td>
                                    <td className='border p-1 text-center'>-</td>
                                    <td className='border p-1 text-center'>-</td>
                                    <td className='border p-1 text-center'>-</td>
                                </tr>

                                {/* Stock rows */}
                                {stocks.map(stock => {
                                    const cmp = cmpData[stock.exchange_code]
                                    const inv = stock.purchase_price * stock.quantity
                                    const pv = cmp ? cmp * stock.quantity : null
                                    const gl = pv !== null ? pv - inv : null
                                    const PortfolioPercentage = ((inv / total_investment) * 100).toFixed(2)

                                    return (
                                        <tr key={stock.exchange_code} className='border text-center'>
                                            <td className='border p-1 text-left'>{stock.name}</td>
                                            <td className='border p-1 '>{stock.purchase_price}</td>
                                            <td className='border p-1 '>{stock.quantity}</td>
                                            <td className='border p-1 '>{cmp ? cmp.toFixed(2) : "N/A"}</td>
                                            <td className='border p-1 '>{pv ? pv.toFixed(2) : 'N/A'}</td>
                                            <td className={
                                                `border border-black p-1 ${
                                                    gl === null
                                                      ? ''
                                                      : gl >= 0
                                                        ? 'text-green-600'
                                                        : 'text-red-600'
                                                  }`}>
                                                {gl ? gl.toFixed(2) : 'N/A'}</td>
                                            <td className='border p-1 '>{inv}</td>
                                            <td className='border p-1 '>{PortfolioPercentage + '%'}</td>
                                            <td className="border p-1">
                                                {fundamentalData[stock.exchange_code]?.peRatio ?? 'N/A'}
                                            </td>
                                            <td className="border p-1">
                                                {fundamentalData[stock.exchange_code]?.lastestEarning ?? 'N/A'}
                                            </td>
                                            <td className='border p-1 '>{stock.exchange}</td>
                                            <td className='border p-1 '>{stock.exchange_code}</td>
                                        </tr>
                                    )
                                })}
                            </React.Fragment>
                        )
                    })}
                
                    <tr className='bg-black text-white font-bold p-1 text-center'>
                        <td colSpan={3} className='p-1 border'>
                            Total Portfolio
                        </td>
                        <td className='p-1 border'>-</td>
                        <td className='p-1 border'>{total_pv.toFixed(2)}</td>
                        <td className={`p-1 border border-white ${total_gl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {total_gl.toFixed(2)}
                        </td>
                        <td className='p-1 border'>{total_investment.toLocaleString()}</td>
                        <td className='p-1 border'>-</td>
                        <td className='p-1 border'>-</td>
                        <td className='p-1 border'>-</td>
                        <td className='p-1 border'>-</td>
                        <td className='p-1 border'>-</td>
                    </tr>
                </tbody>
            </table>
        </div>
    )
}