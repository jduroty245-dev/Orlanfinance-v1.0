'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createTransaction, updateTransaction } from '@/lib/services/transactions'
import { TransactionType } from '@/prisma/generated/client/enums'

export async function addTransaction(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const type = formData.get('type') as TransactionType
  const amountStr = formData.get('amount') as string
  const accountId = formData.get('accountId') as string
  const categoryId = formData.get('categoryId') as string | null
  const transferToAccountId = formData.get('transferToAccountId') as string | null
  const dateStr = formData.get('date') as string
  const note = formData.get('note') as string | null

  // Remove commas from amount (e.g. 5,000.00 -> 5000.00)
  const amount = parseFloat(amountStr.replace(/,/g, ''))

  if (isNaN(amount) || amount <= 0) {
    return { error: 'Please enter a valid amount greater than 0' }
  }

  try {
    await createTransaction(user.id, {
      type,
      amount,
      accountId,
      categoryId: categoryId || undefined,
      transferToAccountId: transferToAccountId || undefined,
      date: dateStr ? new Date(dateStr) : new Date(),
      note: note || undefined
    })
  } catch (error: any) {
    return { error: error.message || 'Failed to record transaction' }
  }

  revalidatePath('/', 'layout')
  redirect('/transactions')
}

export async function editTransaction(transactionId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const type = formData.get('type') as TransactionType
  const amountStr = formData.get('amount') as string
  const accountId = formData.get('accountId') as string
  const categoryId = formData.get('categoryId') as string | null
  const transferToAccountId = formData.get('transferToAccountId') as string | null
  const dateStr = formData.get('date') as string
  const note = formData.get('note') as string | null

  // Remove commas from amount (e.g. 5,000.00 -> 5000.00)
  const amount = parseFloat(amountStr.replace(/,/g, ''))

  if (isNaN(amount) || amount <= 0) {
    return { error: 'Please enter a valid amount greater than 0' }
  }

  try {
    await updateTransaction(user.id, transactionId, {
      type,
      amount,
      accountId,
      categoryId: categoryId || undefined,
      transferToAccountId: transferToAccountId || undefined,
      date: dateStr ? new Date(dateStr) : new Date(),
      note: note || undefined
    })
  } catch (error: any) {
    return { error: error.message || 'Failed to update transaction' }
  }

  // Revalidate full layout so balances refresh everywhere
  revalidatePath('/', 'layout')
  redirect('/history')
}
