import { prisma } from '../prisma'
import { AccountType } from '@/prisma/generated/client/enums'
import { getUserBySupabaseId } from './users'

export async function createAccount(
  supabaseUserId: string, 
  data: { 
    name: string; 
    type: AccountType; 
    icon?: string; 
    color?: string; 
    description?: string 
  }
) {
  const dbUser = await getUserBySupabaseId(supabaseUserId)
  if (!dbUser) throw new Error('User not found in database')

  return await prisma.account.create({
    data: {
      userId: dbUser.id,
      ...data,
    }
  })
}

export async function getAccountsWithBalances(supabaseUserId: string) {
  const dbUser = await getUserBySupabaseId(supabaseUserId)
  if (!dbUser) return []
  const userId = dbUser.id

  const accounts = await prisma.account.findMany({
    where: { userId, isArchived: false },
    orderBy: { createdAt: 'asc' },
  })
  
  const balances = await prisma.transaction.groupBy({
    by: ['accountId', 'type', 'transferToAccountId'],
    where: { userId },
    _sum: { amount: true },
  })

  const balanceMap = new Map<string, number>()
  accounts.forEach(acc => balanceMap.set(acc.id, 0))

  balances.forEach(b => {
    const amount = Number(b._sum.amount || 0)
    
    if (b.type === 'INCOME') {
      balanceMap.set(b.accountId, (balanceMap.get(b.accountId) || 0) + amount)
    } else if (b.type === 'EXPENSE') {
      balanceMap.set(b.accountId, (balanceMap.get(b.accountId) || 0) - amount)
    } else if (b.type === 'TRANSFER') {
      balanceMap.set(b.accountId, (balanceMap.get(b.accountId) || 0) - amount)
      if (b.transferToAccountId) {
        balanceMap.set(b.transferToAccountId, (balanceMap.get(b.transferToAccountId) || 0) + amount)
      }
    } else if (b.type === 'ADJUSTMENT') {
      balanceMap.set(b.accountId, (balanceMap.get(b.accountId) || 0) + amount)
    }
  })

  return accounts.map(acc => ({
    ...acc,
    balance: balanceMap.get(acc.id) || 0
  }))
}

export async function getAccountCount(supabaseUserId: string) {
  const dbUser = await getUserBySupabaseId(supabaseUserId)
  if (!dbUser) return 0
  return await prisma.account.count({
    where: { userId: dbUser.id, isArchived: false }
  })
}
