const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixUrls() {
  const media = await prisma.media.findMany();
  let count = 0;
  for (const m of media) {
    if (m.url.includes(" ") || m.url.includes(" ")) {
      const fixedUrl = encodeURI(m.url);
      await prisma.media.update({ where: { id: m.id }, data: { url: fixedUrl } });
      count++;
    }
  }
  console.log(`Fixed ${count} URLs.`);
}

fixUrls().catch(console.error).finally(() => prisma.$disconnect());
