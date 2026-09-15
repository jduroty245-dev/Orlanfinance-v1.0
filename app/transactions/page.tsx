import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getAccountsWithBalances } from '@/lib/services/accounts'
import { getTransactions } from '@/lib/services/transactions'
import { formatNaira } from '@/lib/utils/currency'

export default async function TransactionsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const accounts = await getAccountsWithBalances(user.id)
  const { grouped: groupedTransactions } = await getTransactions(user.id)

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0)

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 pb-24">
      {/* Header & Total Balance */}
      <div className="bg-blue-600 px-4 py-8 text-white shadow-md">
        <h1 className="text-sm font-medium text-blue-100 uppercase tracking-wider">Total Balance</h1>
        <p className="mt-1 text-4xl font-bold tracking-tight">{formatNaira(totalBalance)}</p>
        
        {/* Account horizontal scroll */}
        <div className="mt-6 flex overflow-x-auto pb-2 -mx-4 px-4 gap-3 snap-x scrollbar-hide">
          {accounts.map(acc => (
            <div key={acc.id} className="snap-start flex-none w-48 rounded-2xl bg-white/10 p-4 backdrop-blur-sm border border-white/20">
              <div className="flex items-center gap-2">
                <span className="text-xl">{acc.icon || '🏦'}</span>
                <span className="text-sm font-semibold truncate">{acc.name}</span>
              </div>
              <p className="mt-2 text-lg font-bold">{formatNaira(acc.balance)}</p>
            </div>
          ))}
          <Link href="/accounts/new" className="snap-start flex-none w-16 flex items-center justify-center rounded-2xl bg-white/5 hover:bg-white/10 border border-white/20 border-dashed transition-colors">
            <span className="text-2xl">+</span>
          </Link>
        </div>
      </div>

      {/* Transactions List */}
      <div className="flex-1 px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Recent Activity</h2>
          {/* We could add filter chips here */}
        </div>

        {Object.keys(groupedTransactions).length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-500 mb-4">
              <span className="text-3xl">💸</span>
            </div>
            <h3 className="text-lg font-bold text-gray-900">No transactions yet</h3>
            <p className="text-sm text-gray-500 mt-1 max-w-xs mx-auto">
              Start tracking your expenses and income to see them here.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedTransactions).map(([date, transactions]) => {
              // Format date nicely (e.g. "Today", "Yesterday", or "15 Sep, 2026")
              const d = new Date(date)
              const today = new Date()
              const isToday = d.toDateString() === today.toDateString()
              
              return (
                <div key={date}>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                    {isToday ? 'Today' : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </h3>
                  <div className="space-y-3 bg-white rounded-2xl p-2 shadow-sm border border-gray-100">
                    {transactions.map(t => (
                      <div key={t.id} className="flex items-center justify-between p-2 rounded-xl hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div 
                            className="flex h-10 w-10 items-center justify-center rounded-full"
                            style={{ backgroundColor: `${t.category?.color || '#cbd5e1'}20` }}
                          >
                            <span className="text-xl">{t.category?.icon || (t.type === 'TRANSFER' ? '🔄' : '💰')}</span>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">
                              {t.type === 'TRANSFER' ? 'Transfer' : t.category?.name || 'Adjustment'}
                            </p>
                            <p className="text-xs text-gray-500 truncate max-w-[150px]">
                              {t.note || t.account.name}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-bold ${
                            t.type === 'INCOME' ? 'text-green-600' : 
                            t.type === 'EXPENSE' ? 'text-gray-900' : 
                            'text-gray-500'
                          }`}>
                            {t.type === 'INCOME' ? '+' : t.type === 'EXPENSE' ? '-' : ''}
                            {formatNaira(t.amount)}
                          </p>
                          {t.type === 'TRANSFER' && (
                            <p className="text-[10px] text-gray-400 uppercase tracking-wider">
                              To {t.transferToAccount?.name}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2">
        <Link 
          href="/transactions/new"
          className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg shadow-blue-600/30 hover:bg-blue-500 hover:scale-105 transition-all"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
        </Link>
      </div>
    </div>
  )
}
