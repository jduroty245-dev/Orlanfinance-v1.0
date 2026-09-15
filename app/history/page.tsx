import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getTransactions } from '@/lib/services/transactions'
import TransactionHistory from '@/components/TransactionHistory'

export const metadata = {
  title: 'Transaction History | Orlanfinance',
  description: 'Browse, search and edit all your transactions',
}

export default async function HistoryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { transactions } = await getTransactions(user.id)

  // Serialize for the client component: convert Decimal -> number, Date -> ISO string
  const serialized = transactions.map(t => ({
    id: t.id,
    type: t.type as 'EXPENSE' | 'INCOME' | 'TRANSFER' | 'ADJUSTMENT',
    amount: Number(t.amount),
    note: t.note,
    date: t.date.toISOString(),
    category: t.category
      ? { id: t.category.id, name: t.category.name, icon: t.category.icon, color: t.category.color }
      : null,
    account: { id: t.account.id, name: t.account.name, icon: t.account.icon },
    transferToAccount: t.transferToAccount
      ? { id: t.transferToAccount.id, name: t.transferToAccount.name, icon: t.transferToAccount.icon }
      : null,
  }))

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 pb-24">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-blue-600 px-4 pt-10 pb-5 shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">History</h1>
            <p className="text-sm text-blue-100 mt-0.5">
              {serialized.length} {serialized.length === 1 ? 'transaction' : 'transactions'}
            </p>
          </div>
          <Link
            href="/transactions"
            className="flex items-center gap-1.5 rounded-xl bg-white/15 px-3 py-2 text-sm font-semibold text-white hover:bg-white/25 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l9-9 9 9M5 10v10a1 1 0 001 1h4v-6h4v6h4a1 1 0 001-1V10" />
            </svg>
            Dashboard
          </Link>
        </div>
      </div>

      {/* Interactive list — client component */}
      <TransactionHistory transactions={serialized} />

      {/* Floating Action Button */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2">
        <Link
          href="/transactions/new"
          className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg shadow-blue-600/30 hover:bg-blue-500 hover:scale-105 transition-all"
          aria-label="Add new transaction"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
        </Link>
      </div>
    </div>
  )
}
