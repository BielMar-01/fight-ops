import { prisma } from '../database/prisma.js'
import { seedPublicSite } from '../modules/public-site/public-site.seed.js'

async function run() {
  try {
    await seedPublicSite()

    console.log('Public site seed completed successfully.')
  } catch (error) {
    console.error('Failed to seed public site.')
    console.error(error)

    process.exitCode = 1
  } finally {
    await prisma.$disconnect()
  }
}

void run()