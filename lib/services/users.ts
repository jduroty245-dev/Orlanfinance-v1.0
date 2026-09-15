import { prisma } from '../prisma'
import { seedDefaultCategories } from './categories'

export async function syncUser(supabaseUser: { id: string; email?: string }) {
  if (!supabaseUser.email) {
    throw new Error('Supabase user must have an email')
  }

  let user = await prisma.user.findUnique({
    where: { supabaseId: supabaseUser.id },
  })

  if (!user) {
    user = await prisma.user.create({
      data: {
        supabaseId: supabaseUser.id,
        email: supabaseUser.email,
      },
    })
    
    await seedDefaultCategories(user.id)
  }

  return user
}

export async function getUserBySupabaseId(supabaseId: string) {
  return await prisma.user.findUnique({
    where: { supabaseId },
  })
}
