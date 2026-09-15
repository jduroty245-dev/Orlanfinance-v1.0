import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getAccountsWithBalances } from '@/lib/services/accounts'
import { getUserBySupabaseId } from '@/lib/services/users'
import TransactionForm from '@/components/TransactionForm'

export default async function NewTransactionPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const accounts = await getAccountsWithBalances(user.id)
  
  if (accounts.length === 0) {
    redirect('/accounts/new')
  }

  const dbUser = await getUserBySupabaseId(user.id)
  
  let categories = []
  if (dbUser) {
    categories = await prisma.category.findMany({
      where: { userId: dbUser.id },
      orderBy: { name: 'asc' }
    })
  }

  return <TransactionForm accounts={accounts} categories={categories} />
}
