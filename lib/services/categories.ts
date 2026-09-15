import { prisma } from '../prisma'

const DEFAULT_CATEGORIES = [
  { name: 'Food & Dining', icon: '🍔', color: '#EF4444' },
  { name: 'Transport', icon: '🚗', color: '#F59E0B' },
  { name: 'Rent & Utilities', icon: '🏠', color: '#3B82F6' },
  { name: 'Salary', icon: '💰', color: '#10B981' },
  { name: 'Entertainment', icon: '🍿', color: '#8B5CF6' },
  { name: 'Health', icon: '💊', color: '#EC4899' },
]

export async function seedDefaultCategories(userId: string) {
  const count = await prisma.category.count({
    where: { userId, isDefault: true },
  })

  if (count > 0) return

  await prisma.category.createMany({
    data: DEFAULT_CATEGORIES.map((cat) => ({
      ...cat,
      userId,
      isDefault: true,
    })),
  })
}

export async function getCategories(userId: string) {
  return await prisma.category.findMany({
    where: { userId, isArchived: false },
    orderBy: { name: 'asc' },
  })
}
