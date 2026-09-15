'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'

type TransactionType = 'EXPENSE' | 'INCOME' | 'TRANSFER' | 'ADJUSTMENT'

interface Category {
  id: string
  name: string
  icon: string | null
  color: string | null
}

interface Account {
  id: string
  name: string
  icon: string | null
}

interface Transaction {
  id: string
  type: TransactionType
  amount: number
  note: string | null
  date: string // ISO string
  category: Category | null
  account: Account
  transferToAccount: Account | null
}

type FilterType = 'ALL' | 'EXPENSE' | 'INCOME' | 'TRANSFER'

function formatNaira(amount: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

function getDateLabel(isoDate: string): string {
  const d = new Date(isoDate)
  const today = new Date()
  const yesterday = new Date()
  yesterday.setDate(today.getDate() - 1)

  const toDateStr = (date: Date) => date.toISOString().split('T')[0]

  if (isoDate === toDateStr(today)) return 'Today'
  if (isoDate === toDateStr(yesterday)) return 'Yesterday'

  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

export default function TransactionHistory({
  transactions,
}: {
  transactions: Transaction[]
}) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<FilterType>('ALL')

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()

    return transactions.filter(t => {
      // Filter chip
      if (filter !== 'ALL' && t.type !== filter) return false

      // Search: matches note OR category name
      if (q) {
        const inNote = (t.note ?? '').toLowerCase().includes(q)
        const inCategory = (t.category?.name ?? '').toLowerCase().includes(q)
        const inAccount = (t.account?.name ?? '').toLowerCase().includes(q)
        if (!inNote && !inCategory && !inAccount) return false
      }

      return true
    })
  }, [transactions, search, filter])

  // Group by date (YYYY-MM-DD key, already sorted desc by server)
  const grouped = useMemo(() => {
    const map = new Map<string, Transaction[]>()
    for (const t of filtered) {
      const dateKey = t.date.split('T')[0]
      if (!map.has(dateKey)) map.set(dateKey, [])
      map.get(dateKey)!.push(t)
    }
    return map
  }, [filtered])

  const filterOptions: { label: string; value: FilterType }[] = [
    { label: 'All', value: 'ALL' },
    { label: 'Expense', value: 'EXPENSE' },
    { label: 'Income', value: 'INCOME' },
    { label: 'Transfer', value: 'TRANSFER' },
  ]

  return (
    <div className="flex-1 px-4 py-4 space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
        </div>
        <input
          id="transaction-search"
          type="search"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by note or category…"
          className="w-full rounded-2xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        />
      </div>

      {/* Filter Chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {filterOptions.map(opt => (
          <button
            key={opt.value}
            onClick={() => setFilter(opt.value)}
            className={`flex-none rounded-full px-4 py-1.5 text-sm font-semibold transition-all ${
              filter === opt.value
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-300 hover:text-blue-600'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Empty state */}
      {grouped.size === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-500 mb-4">
            <span className="text-3xl">🔍</span>
          </div>
          <h3 className="text-lg font-bold text-gray-900">
            {search || filter !== 'ALL' ? 'No matching transactions' : 'No transactions yet'}
          </h3>
          <p className="mt-1 text-sm text-gray-500 max-w-xs">
            {search || filter !== 'ALL'
              ? 'Try a different search term or filter.'
              : 'Start tracking your expenses and income to see them here.'}
          </p>
        </div>
      )}

      {/* Grouped list */}
      {grouped.size > 0 && (
        <div className="space-y-6">
          {Array.from(grouped.entries()).map(([dateKey, txns]) => (
            <div key={dateKey}>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                {getDateLabel(dateKey)}
              </h3>

              <div className="space-y-1 bg-white rounded-2xl p-2 shadow-sm border border-gray-100">
                {txns.map((t, idx) => (
                  <Link
                    key={t.id}
                    href={`/transactions/${t.id}/edit`}
                    className={`flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 active:bg-gray-100 transition-colors ${
                      idx < txns.length - 1 ? 'border-b border-gray-50' : ''
                    }`}
                  >
                    {/* Left: icon + labels */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="flex h-10 w-10 flex-none items-center justify-center rounded-full"
                        style={{ backgroundColor: `${t.category?.color || '#cbd5e1'}20` }}
                      >
                        <span className="text-xl">
                          {t.category?.icon || (t.type === 'TRANSFER' ? '🔄' : '💰')}
                        </span>
                      </div>

                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {t.type === 'TRANSFER'
                            ? `Transfer${t.transferToAccount ? ` → ${t.transferToAccount.name}` : ''}`
                            : t.category?.name || 'Adjustment'}
                        </p>
                        <p className="text-xs text-gray-500 truncate max-w-[180px]">
                          {t.note ? t.note : t.account.name}
                        </p>
                      </div>
                    </div>

                    {/* Right: amount + account */}
                    <div className="text-right flex-none ml-2">
                      <p className={`text-sm font-bold ${
                        t.type === 'INCOME'
                          ? 'text-green-600'
                          : t.type === 'EXPENSE'
                          ? 'text-red-500'
                          : 'text-gray-500'
                      }`}>
                        {t.type === 'INCOME' ? '+' : t.type === 'EXPENSE' ? '−' : ''}
                        {formatNaira(t.amount)}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{t.account.name}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
