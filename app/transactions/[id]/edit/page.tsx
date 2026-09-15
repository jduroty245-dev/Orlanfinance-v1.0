import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { getAccountsWithBalances } from '@/lib/services/accounts'
import { getTransactionById } from '@/lib/services/transactions'
import { getUserBySupabaseId } from '@/lib/services/users'
import { prisma } from '@/lib/prisma'
import EditTransactionForm from '@/components/EditTransactionForm'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditTransactionPage({ params }: Props) {
  const { id } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const [transaction, accounts] = await Promise.all([
    getTransactionById(user.id, id),
    getAccountsWithBalances(user.id),
  ])

  if (!transaction) notFound()

  const dbUser = await getUserBySupabaseId(user.id)
  let categories: any[] = []
  if (dbUser) {
    categories = await prisma.category.findMany({
      where: { userId: dbUser.id, isArchived: false },
      orderBy: { name: 'asc' },
    })
  }

  // Format amount as a comma-separated integer string (matching the input formatter)
  const rawAmount = Number(transaction.amount)
  const formattedAmount = new Intl.NumberFormat('en-US').format(Math.round(rawAmount))

  const defaultValues = {
    type: transaction.type,
    amount: formattedAmount,
    accountId: transaction.accountId,
    categoryId: transaction.categoryId ?? null,
    transferToAccountId: transaction.transferToAccountId ?? null,
    date: transaction.date.toISOString().split('T')[0],
    note: transaction.note ?? null,
  }

  return (
    <EditTransactionForm
      transactionId={id}
      categories={categories}
      accounts={accounts}
      defaultValues={defaultValues}
    />
  )
}
