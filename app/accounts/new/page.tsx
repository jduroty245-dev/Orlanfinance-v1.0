'use client'

import { useActionState, useState } from 'react'
import { addAccount } from '../actions'

const PRESET_BANKS = [
  { name: 'OPay', type: 'WALLET', color: '#00B853', icon: '📱' },
  { name: 'Moniepoint', type: 'BANK', color: '#0052FF', icon: '🏦' },
  { name: 'GTBank', type: 'BANK', color: '#DD4F05', icon: '🏦' },
  { name: 'Kuda', type: 'BANK', color: '#40196D', icon: '📱' },
  { name: 'PalmPay', type: 'WALLET', color: '#551C91', icon: '📱' },
  { name: 'Zenith', type: 'BANK', color: '#E3000F', icon: '🏦' },
  { name: 'Access', type: 'BANK', color: '#E35205', icon: '🏦' },
  { name: 'UBA', type: 'BANK', color: '#D40000', icon: '🏦' },
  { name: 'FirstBank', type: 'BANK', color: '#003B5C', icon: '🏦' },
  { name: 'PiggyVest', type: 'SAVINGS', color: '#083E9E', icon: '🐷' },
  { name: 'Cowrywise', type: 'SAVINGS', color: '#0066F5', icon: '📈' },
  { name: 'Cash', type: 'CASH', color: '#10B981', icon: '💵' },
]

export default function NewAccountPage() {
  const [selectedPreset, setSelectedPreset] = useState<typeof PRESET_BANKS[0] | null>(null)
  const [accountName, setAccountName] = useState('')

  const [state, action, isPending] = useActionState(
    async (prevState: any, formData: FormData) => {
      const res = await addAccount(formData)
      return res || { error: null }
    },
    { error: null } as { error: string | null }
  )

  const handlePresetSelect = (preset: typeof PRESET_BANKS[0]) => {
    setSelectedPreset(preset)
    setAccountName(preset.name)
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 pb-20">
      <div className="bg-blue-600 px-4 py-8 text-white shadow-md">
        <h1 className="text-2xl font-bold">Add an Account</h1>
        <p className="mt-1 text-blue-100 text-sm">
          Select your bank or wallet to start tracking.
        </p>
      </div>

      <div className="mx-auto w-full max-w-md p-4">
        <form className="mt-4 space-y-6 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700">Quick Select</h3>
            <div className="grid grid-cols-3 gap-3">
              {PRESET_BANKS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => handlePresetSelect(preset)}
                  className={`flex flex-col items-center justify-center rounded-xl border p-3 transition-all ${
                    selectedPreset?.name === preset.name
                      ? 'border-blue-500 bg-blue-50 shadow-sm ring-1 ring-blue-500'
                      : 'border-gray-200 bg-white hover:bg-gray-50'
                  }`}
                >
                  <span className="text-2xl mb-1">{preset.icon}</span>
                  <span className="text-xs font-medium text-gray-700 truncate w-full text-center">
                    {preset.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-100 pt-6 space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Account Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={accountName}
                onChange={(e) => {
                  setAccountName(e.target.value)
                  if (selectedPreset && e.target.value !== selectedPreset.name) {
                    setSelectedPreset(null)
                  }
                }}
                className="mt-1 block w-full rounded-lg border-gray-300 py-3 px-4 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-50 text-base font-semibold"
                placeholder="e.g. GTBank Salary"
              />
            </div>

            <input type="hidden" name="type" value={selectedPreset?.type || 'BANK'} />
            <input type="hidden" name="icon" value={selectedPreset?.icon || '🏦'} />
            <input type="hidden" name="color" value={selectedPreset?.color || '#3b82f6'} />
          </div>

          {state?.error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
              {state.error}
            </div>
          )}

          <button
            formAction={action}
            disabled={isPending}
            className="mt-6 flex w-full justify-center rounded-xl bg-blue-600 px-4 py-4 text-sm font-bold text-white shadow-sm hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 disabled:opacity-50"
          >
            {isPending ? 'Creating Account...' : 'Continue'}
          </button>
        </form>
      </div>
    </div>
  )
}
