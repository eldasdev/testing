import { prisma } from './prisma'

/**
 * Move an item to trash bin instead of permanently deleting it
 */
export async function moveToTrash(
  itemType: string,
  itemId: string,
  itemData: any,
  deletedBy: string
) {
  // Calculate expiration date (30 days from now)
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 30)

  return await prisma.trashBin.create({
    data: {
      itemType,
      itemId,
      itemData,
      deletedBy,
      expiresAt,
    },
  })
}

/**
 * Clean up expired trash items (older than 30 days)
 */
export async function cleanupExpiredTrash() {
  const now = new Date()
  
  const result = await prisma.trashBin.updateMany({
    where: {
      expiresAt: { lt: now },
      permanentlyDeleted: false,
      restored: false,
    },
    data: {
      permanentlyDeleted: true,
    },
  })

  return result
}
