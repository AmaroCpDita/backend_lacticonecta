const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const postCount = await prisma.post.count();
  const salaCount = await prisma.sala.count();

  let user1, user2;

  if (postCount === 0) {
    console.log('Seeding posts...');
    user1 = await prisma.user.create({
      data: {
        name: 'María José',
        email: 'maria@ejemplo.com',
        password: 'password123',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150',
        verified: true,
        bio: 'Matrona especialista en lactancia materna. Feliz de ayudar.'
      }
    });

    user2 = await prisma.user.create({
      data: {
        name: 'Camila R.',
        email: 'camila@ejemplo.com',
        password: 'password123',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150',
        bio: 'Mamá primeriza aprendiendo día a día.'
      }
    });

    await prisma.post.create({
      data: {
        title: 'Tips para extracción en el trabajo',
        content: '¡Hola mamás! 💜\n¿Cuáles son sus tips para organizar la extracción de leche cuando se vuelve al trabajo?\nToda experiencia suma ✨',
        tag: 'Vuelta al trabajo',
        authorId: user1.id,
        likes: 25
      }
    });

    await prisma.post.create({
      data: {
        title: 'Mi kit de extracción',
        content: 'Les comparto mi kit de extracción que me ha resultado increíble para mi día a día 👇',
        tag: 'Extracción',
        authorId: user2.id,
        likes: 18
      }
    });
    console.log('Posts seeded.');
  }

  if (salaCount === 0) {
    console.log('Seeding salas...');
    await prisma.sala.create({
      data: {
        name: 'Sky Costanera',
        address: 'Av. Andrés Bello 2425, Providencia',
        lat: -33.4172,
        lng: -70.6067,
        rating: 4.7,
        reviews: 128,
        services: JSON.stringify(['Privada', 'Cómoda', 'Limpia', 'Accesible']),
        description: 'Sala de lactancia ubicada en el piso -1, al lado de baños. Cuenta con sillón cómodo, lavamanos, enchufes y buena iluminación.',
        image: 'https://images.unsplash.com/photo-1596484552834-6a58f850e0a1?auto=format&fit=crop&q=80&w=800',
        approved: true
      }
    });

    await prisma.sala.create({
      data: {
        name: 'Jardín Japonés',
        address: 'Pedro de Valdivia Norte, Providencia',
        lat: -33.4150,
        lng: -70.6120,
        rating: 4.5,
        reviews: 84,
        services: JSON.stringify(['Limpia', 'Tranquila']),
        description: 'Espacio habilitado dentro de las instalaciones administrativas.',
        image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=800',
        approved: true
      }
    });
    console.log('Salas seeded.');
  }

  console.log('Seed check complete.');
}

module.exports = main;
