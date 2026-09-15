import { prisma } from '../prisma'
import { TransactionType } from '@/prisma/generated/client/enums'
import { getUserBySupabaseId } from './users'

export async function createTransaction(
  supabaseUserId: string,
  data: {
    accountId: string;
    categoryId?: string;
    type: TransactionType;
    amount: number;
    currency?: string;
    note?: string;
    date: Date;
    transferToAccountId?: string;
  }
) {
  const dbUser = await getUserBySupabaseId(supabaseUserId)
  if (!dbUser) throw new Error('User not found in database')

  // Business logic validation
  if (data.type === 'TRANSFER' && !data.transferToAccountId) {
    throw new Error('Transfer transactions must specify a destination account')
  }
  if (data.type === 'TRANSFER' && data.accountId === data.transferToAccountId) {
    throw new Error('Cannot transfer to the same account')
  }
  if ((data.type === 'EXPENSE' || data.type === 'INCOME') && !data.categoryId) {
    throw new Error('Income and expense transactions must have a category')
  }

  return await prisma.transaction.create({
    data: {
      userId: dbUser.id,
      ...data,
    }
  })
}

export async function getTransactions(
  supabaseUserId: string,
  filters?: {
    accountId?: string;
    type?: TransactionType;
    limit?: number;
  }
) {
  const dbUser = await getUserBySupabaseId(supabaseUserId)
  if (!dbUser) return { transactions: [], grouped: {} }
  const userId = dbUser.id

  const where: any = { userId }
  
  if (filters?.accountId) {
    where.OR = [
      { accountId: filters.accountId },
      { transferToAccountId: filters.accountId }
    ]
  }
  
  if (filters?.type) {
    where.type = filters.type
  }

  const transactions = await prisma.transaction.findMany({
    where,
    orderBy: { date: 'desc' },
    take: filters?.limit,
    include: {
      category: true,
      account: true,
      transferToAccount: true,
    }
  })

  // Group by date
  const grouped = transactions.reduce((acc, curr) => {
    const dateStr = curr.date.toISOString().split('T')[0]
    if (!acc[dateStr]) acc[dateStr] = []
    acc[dateStr].push(curr)
    return acc
  }, {} as Record<string, typeof transactions>)

  return { transactions, grouped }
}

export async function getTransactionById(supabaseUserId: string, transactionId: string) {
  const dbUser = await getUserBySupabaseId(supabaseUserId)
  if (!dbUser) return null

  return await prisma.transaction.findFirst({
    where: { id: transactionId, userId: dbUser.id },
    include: {
      category: true,
      account: true,
      transferToAccount: true,
    }
  })
}

/**
 * Updates a transaction. Because account balances are DERIVED from transactions,
 * we only need to update the transaction row itself — the balance logic in
 * getAccountsWithBalances() re-aggregates on every read, so no separate
 * balance adjustment is needed. The update is still atomic (single DB write).
 *
 * If the type, amount, accountId, or transferToAccountId changes the balance
 * impact changes automatically on the next balance read.
 */
export async function updateTransaction(
  supabaseUserId: string,
  transactionId: string,
  data: {
    type: TransactionType;
    amount: number;
    accountId: string;
    categoryId?: string;
    transferToAccountId?: string;
    date: Date;
    note?: string;
  }
) {
  const dbUser = await getUserBySupabaseId(supabaseUserId)
  if (!dbUser) throw new Error('User not found in database')

  // Verify the transaction belongs to this user
  const existing = await prisma.transaction.findFirst({
    where: { id: transactionId, userId: dbUser.id }
  })
  if (!existing) throw new Error('Transaction not found')

  // Business logic validation (same rules as createTransaction)
  if (data.type === 'TRANSFER' && !data.transferToAccountId) {
    throw new Error('Transfer transactions must specify a destination account')
  }
  if (data.type === 'TRANSFER' && data.accountId === data.transferToAccountId) {
    throw new Error('Cannot transfer to the same account')
  }
  if ((data.type === 'EXPENSE' || data.type === 'INCOME') && !data.categoryId) {
    throw new Error('Income and expense transactions must have a category')
  }

  return await prisma.transaction.update({
    where: { id: transactionId },
    data: {
      type: data.type,
      amount: data.amount,
      accountId: data.accountId,
      categoryId: data.categoryId ?? null,
      transferToAccountId: data.transferToAccountId ?? null,
      date: data.date,
      note: data.note ?? null,
    },
    include: {
      category: true,
      account: true,
      transferToAccount: true,
    }
  })
}
