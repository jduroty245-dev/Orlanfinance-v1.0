import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getAccountCount } from '@/lib/services/accounts'

export default async function Home() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const accountCount = await getAccountCount(user.id)
  
  if (accountCount === 0) {
    redirect('/accounts/new')
  }

  redirect('/transactions')
}
