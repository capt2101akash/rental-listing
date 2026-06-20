const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanDuplicates() {
  const properties = await prisma.property.findMany();
  const seenAddresses = new Set();
  const duplicateIds = [];

  for (const p of properties) {
    if (seenAddresses.has(p.address)) {
      duplicateIds.push(p.id);
    } else {
      seenAddresses.add(p.address);
    }
  }

  if (duplicateIds.length > 0) {
    await prisma.property.deleteMany({
      where: { id: { in: duplicateIds } }
    });
    console.log(`Deleted ${duplicateIds.length} duplicate properties.`);
  } else {
    console.log("No duplicates found.");
  }
}

cleanDuplicates().catch(console.error).finally(() => prisma.$disconnect());
