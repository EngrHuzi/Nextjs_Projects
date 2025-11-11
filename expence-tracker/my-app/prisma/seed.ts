import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting seed...')

  // Seed predefined expense categories
  const expenseCategories = [
    'Food',
    'Rent',
    'Travel',
    'Transportation',
    'Entertainment',
    'Healthcare',
    'Utilities',
    'Shopping',
    'Education',
  ]

  for (const name of expenseCategories) {
    await prisma.category.upsert({
      where: {
        userId_name_type: {
          userId: null as any,
          name,
          type: 'EXPENSE',
        },
      },
      update: {},
      create: {
        name,
        type: 'EXPENSE',
        isPredefined: true,
        userId: null,
      },
    })
    console.log(`✓ Created expense category: ${name}`)
  }

  // Seed predefined income categories
  const incomeCategories = ['Salary', 'Freelance', 'Investment', 'Gift', 'Other']

  for (const name of incomeCategories) {
    await prisma.category.upsert({
      where: {
        userId_name_type: {
          userId: null as any,
          name,
          type: 'INCOME',
        },
      },
      update: {},
      create: {
        name,
        type: 'INCOME',
        isPredefined: true,
        userId: null,
      },
    })
    console.log(`✓ Created income category: ${name}`)
  }

  console.log('Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('Error during seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
