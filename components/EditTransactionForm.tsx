'use client'

import { useActionState, useState } from 'react'
import { editTransaction } from '@/app/transactions/actions'
import { TransactionType } from '@/prisma/generated/client/enums'
import Link from 'next/link'

type Category = { id: string; name: string; icon: string | null; color: string | null }
type Account = { id: string; name: string; icon: string | null; balance: number }

interface DefaultValues {
  type: TransactionType
  amount: string // formatted string like "5,000"
  accountId: string
  categoryId: string | null
  transferToAccountId: string | null
  date: string // ISO date string "YYYY-MM-DD"
  note: string | null
}

export default function EditTransactionForm({
  transactionId,
  categories,
  accounts,
  defaultValues,
}: {
  transactionId: string
  categories: Category[]
  accounts: Account[]
  defaultValues: DefaultValues
}) {
  const [type, setType] = useState<TransactionType>(defaultValues.type)
  const [amount, setAmount] = useState(defaultValues.amount)

  const boundAction = editTransaction.bind(null, transactionId)

  const [state, action, isPending] = useActionState(
    async (prevState: any, formData: FormData) => {
      const res = await boundAction(formData)
      return res || { error: null }
    },
    { error: null } as { error: string | null }
  )

  const formatAmountInput = (val: string) => {
    const clean = val.replace(/\D/g, '')
    if (!clean) return ''
    return new Intl.NumberFormat('en-US').format(Number(clean))
  }

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(formatAmountInput(e.target.value))
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 pb-20">
      <div className="bg-white px-4 py-4 shadow-sm flex items-center justify-between sticky top-0 z-10">
        <h1 className="text-xl font-bold text-gray-900">Edit Transaction</h1>
        <Link href="/history" className="text-gray-500 font-medium hover:text-gray-700 transition-colors">
          Cancel
        </Link>
      </div>

      <div className="mx-auto w-full max-w-md p-4">
        <form action={action} className="space-y-6">

          {/* Type Toggle */}
          <div className="flex rounded-xl bg-gray-100 p-1">
            {(['EXPENSE', 'INCOME', 'TRANSFER'] as TransactionType[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-all ${
                  type === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {t.charAt(0) + t.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
          <input type="hidden" name="type" value={type} />

          {/* Amount Input */}
          <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100 text-center">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Amount</label>
            <div className="flex items-center justify-center text-5xl font-bold text-gray-900">
              <span className="text-3xl text-gray-400 mr-1">₦</span>
              <input
                type="text"
                name="amount"
                inputMode="numeric"
                value={amount}
                onChange={handleAmountChange}
                placeholder="0"
                className="w-full bg-transparent outline-none text-center placeholder-gray-300"
                required
              />
            </div>
          </div>

          <div className="space-y-4 rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
            {/* Account Select */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {type === 'TRANSFER' ? 'From Account' : 'Account'}
              </label>
              <select
                name="accountId"
                required
                defaultValue={defaultValues.accountId}
                className="w-full rounded-lg border border-gray-300 py-3 px-3 text-gray-900 bg-gray-50 focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
              >
                {accounts.map(a => (
                  <option key={a.id} value={a.id}>
                    {a.icon} {a.name} (₦{a.balance.toLocaleString()})
                  </option>
                ))}
              </select>
            </div>

            {/* Transfer: To Account */}
            {type === 'TRANSFER' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">To Account</label>
                <select
                  name="transferToAccountId"
                  required
                  defaultValue={defaultValues.transferToAccountId ?? ''}
                  className="w-full rounded-lg border border-gray-300 py-3 px-3 text-gray-900 bg-gray-50 focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">Select destination...</option>
                  {accounts.map(a => (
                    <option key={a.id} value={a.id}>{a.icon} {a.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Category (Expense / Income only) */}
            {type !== 'TRANSFER' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {categories.map(c => (
                    <label key={c.id} className="cursor-pointer">
                      <input
                        type="radio"
                        name="categoryId"
                        value={c.id}
                        defaultChecked={c.id === defaultValues.categoryId}
                        required
                        className="peer sr-only"
                      />
                      <div className="rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 peer-checked:border-blue-500 peer-checked:bg-blue-50 peer-checked:text-blue-700 transition-all flex items-center gap-2">
                        <span>{c.icon}</span>
                        {c.name}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                name="date"
                required
                defaultValue={defaultValues.date}
                className="w-full rounded-lg border border-gray-300 py-3 px-3 text-gray-900 bg-gray-50 focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* Note */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Note (Optional)</label>
              <input
                type="text"
                name="note"
                defaultValue={defaultValues.note ?? ''}
                placeholder="What was this for?"
                className="w-full rounded-lg border border-gray-300 py-3 px-3 text-gray-900 bg-gray-50 focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {state?.error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-100">
              {state.error}
            </div>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="flex w-full justify-center rounded-xl bg-blue-600 px-4 py-4 text-sm font-bold text-white shadow-sm hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 disabled:opacity-50 transition-colors"
          >
            {isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  )
}
