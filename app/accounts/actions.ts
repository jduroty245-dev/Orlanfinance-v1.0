'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAccount } from '@/lib/services/accounts'
import { syncUser } from '@/lib/services/users'
import { AccountType } from '@/prisma/generated/client/enums'

export async function addAccount(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Ensure the user exists in Prisma before creating an account
  // This handles edge-cases where the Supabase session exists but the Prisma user was deleted or never synced.
  if (user.email) {
    await syncUser({ id: user.id, email: user.email })
  }

  const name = formData.get('name') as string
  const type = formData.get('type') as AccountType
  const icon = formData.get('icon') as string | undefined
  const color = formData.get('color') as string | undefined

  if (!name || !type) {
    return { error: 'Name and type are required' }
  }

  try {
    await createAccount(user.id, {
      name,
      type,
      icon,
      color,
    })
  } catch (error) {
    return { error: 'Failed to create account. Please try again.' }
  }

  revalidatePath('/', 'layout')
  redirect('/transactions')
}
