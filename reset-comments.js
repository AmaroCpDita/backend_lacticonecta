const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
  const r = await p.comment.updateMany({ data: { likes: 0 } });
  console.log('Reset', r.count, 'comments to 0 likes');
  await p.$disconnect();
}

main();
