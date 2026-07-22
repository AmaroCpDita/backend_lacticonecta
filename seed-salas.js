const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const salasData = [
  {
    name: 'MUT (Mercado Urbano Tobalaba)',
    address: 'Av. Apoquindo 2730, Las Condes',
    lat: -33.4168,
    lng: -70.6010,
    rating: 4.8,
    reviews: 42,
    description: 'Moderna sala de lactancia en el piso 3, junto a los baños familiares. Cuenta con cómodos sillones y lavamanos.',
    image: 'https://images.unsplash.com/photo-1596484552834-6a58f850e0a1?auto=format&fit=crop&q=80&w=800',
    services: JSON.stringify(['Privada', 'Cómoda', 'Limpia', 'Accesible'])
  },
  {
    name: 'Costanera Center',
    address: 'Av. Andrés Bello 2425, Providencia',
    lat: -33.4172,
    lng: -70.6067,
    rating: 4.7,
    reviews: 128,
    description: 'Sala de lactancia ubicada en el piso -1, al lado de baños. Cuenta con sillón cómodo, lavamanos, enchufes y buena iluminación.',
    image: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&q=80&w=800',
    services: JSON.stringify(['Privada', 'Limpia', 'Accesible'])
  },
  {
    name: 'Mall Parque Arauco',
    address: 'Av. Presidente Kennedy 5413, Las Condes',
    lat: -33.4005,
    lng: -70.5772,
    rating: 4.9,
    reviews: 85,
    description: 'Amplia sala de lactancia en el sector de diseño (Piso 2). Muy silenciosa y con microondas para calentar colados.',
    image: 'https://images.unsplash.com/photo-1584824388196-857cb3e8b4bb?auto=format&fit=crop&q=80&w=800',
    services: JSON.stringify(['Privada', 'Cómoda', 'Limpia', 'Accesible'])
  },
  {
    name: 'Mallplaza Egaña',
    address: 'Av. Larraín 5862, La Reina',
    lat: -33.4533,
    lng: -70.5701,
    rating: 4.5,
    reviews: 56,
    description: 'Sector de maternidad en el Piso 3, cerca del patio de comidas. Espacio semi-privado.',
    image: 'https://images.unsplash.com/photo-1522771731470-3138f4a132fa?auto=format&fit=crop&q=80&w=800',
    services: JSON.stringify(['Cómoda', 'Accesible'])
  },
  {
    name: 'Clínica Alemana',
    address: 'Av. Vitacura 5951, Vitacura',
    lat: -33.3951,
    lng: -70.5695,
    rating: 5.0,
    reviews: 210,
    description: 'Lactario oficial y clínica de lactancia. Espacio médico esterilizado, privado y con asistencia de matronas si se solicita.',
    image: 'https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?auto=format&fit=crop&q=80&w=800',
    services: JSON.stringify(['Privada', 'Cómoda', 'Limpia', 'Accesible'])
  },
  {
    name: 'Clínica Indisa',
    address: 'Av. Sta. María 1810, Providencia',
    lat: -33.4187,
    lng: -70.6179,
    rating: 4.6,
    reviews: 94,
    description: 'Lactario en el piso 2 de la torre de maternidad. Excelente higiene y ambiente climatizado.',
    image: 'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&q=80&w=800',
    services: JSON.stringify(['Privada', 'Limpia', 'Accesible'])
  },
  {
    name: 'Alto Las Condes',
    address: 'Av. Presidente Kennedy 9001, Las Condes',
    lat: -33.3912,
    lng: -70.5463,
    rating: 4.7,
    reviews: 67,
    description: 'Baños familiares y sala de lactancia en el primer y segundo nivel. Incluye mudadores.',
    image: 'https://images.unsplash.com/photo-1596484552834-6a58f850e0a1?auto=format&fit=crop&q=80&w=800',
    services: JSON.stringify(['Privada', 'Cómoda', 'Limpia', 'Accesible'])
  },
  {
    name: 'Mallplaza Los Dominicos',
    address: 'Av. Padre Hurtado Sur 875, Las Condes',
    lat: -33.4079,
    lng: -70.5362,
    rating: 4.8,
    reviews: 112,
    description: 'Espacio dedicado a la maternidad. Muy tranquilo y con iluminación cálida.',
    image: 'https://images.unsplash.com/photo-1522771731470-3138f4a132fa?auto=format&fit=crop&q=80&w=800',
    services: JSON.stringify(['Privada', 'Cómoda', 'Limpia'])
  },
  {
    name: 'Clínica Las Condes',
    address: 'Estoril 450, Las Condes',
    lat: -33.3853,
    lng: -70.5255,
    rating: 4.9,
    reviews: 145,
    description: 'Centro de apoyo a la lactancia. Entorno médico premium.',
    image: 'https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?auto=format&fit=crop&q=80&w=800',
    services: JSON.stringify(['Privada', 'Cómoda', 'Limpia', 'Accesible'])
  },
  {
    name: 'Mallplaza Vespucio',
    address: 'Av. Vicuña Mackenna Ote. 7110, La Florida',
    lat: -33.5184,
    lng: -70.5985,
    rating: 4.2,
    reviews: 45,
    description: 'Ubicada cerca de los baños del sector Terrazas. Es un poco ruidosa pero cumple su función.',
    image: 'https://images.unsplash.com/photo-1584824388196-857cb3e8b4bb?auto=format&fit=crop&q=80&w=800',
    services: JSON.stringify(['Limpia', 'Accesible'])
  },
  {
    name: 'Hospital Clínico UC CHRISTUS',
    address: 'Marcoleta 367, Santiago Centro',
    lat: -33.4414,
    lng: -70.6402,
    rating: 4.5,
    reviews: 78,
    description: 'Lactario en área pediátrica. Espacio seguro y con protocolos de higiene estrictos.',
    image: 'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&q=80&w=800',
    services: JSON.stringify(['Privada', 'Limpia'])
  },
  {
    name: 'Clínica Santa María',
    address: 'Av. Santa María 0500, Providencia',
    lat: -33.4286,
    lng: -70.6323,
    rating: 4.8,
    reviews: 130,
    description: 'Excelente lactario, muy espacioso y con personal dispuesto a orientar.',
    image: 'https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?auto=format&fit=crop&q=80&w=800',
    services: JSON.stringify(['Privada', 'Cómoda', 'Limpia', 'Accesible'])
  },
  {
    name: 'Aeropuerto Arturo Merino Benítez',
    address: 'Aviador David Fuentes, Pudahuel',
    lat: -33.3930,
    lng: -70.7951,
    rating: 4.1,
    reviews: 205,
    description: 'Salas de lactancia en los terminales nacional e internacional. Funcionales para los viajes.',
    image: 'https://images.unsplash.com/photo-1596484552834-6a58f850e0a1?auto=format&fit=crop&q=80&w=800',
    services: JSON.stringify(['Cómoda', 'Limpia', 'Accesible'])
  },
  {
    name: 'Portal Ñuñoa',
    address: 'Av. José Pedro Alessandri 1166, Ñuñoa',
    lat: -33.4619,
    lng: -70.5985,
    rating: 4.4,
    reviews: 38,
    description: 'Pequeña pero acogedora. Cuenta con enchufe para extractor eléctrico.',
    image: 'https://images.unsplash.com/photo-1584824388196-857cb3e8b4bb?auto=format&fit=crop&q=80&w=800',
    services: JSON.stringify(['Privada', 'Accesible'])
  },
  {
    name: 'Arauco Maipú',
    address: 'Av. Américo Vespucio 399, Maipú',
    lat: -33.4817,
    lng: -70.7521,
    rating: 4.3,
    reviews: 51,
    description: 'Sala de maternidad junto a los baños del segundo piso.',
    image: 'https://images.unsplash.com/photo-1522771731470-3138f4a132fa?auto=format&fit=crop&q=80&w=800',
    services: JSON.stringify(['Limpia', 'Accesible'])
  },
  {
    name: 'Portal La Dehesa',
    address: 'Av. La Dehesa 1445, Lo Barnechea',
    lat: -33.3551,
    lng: -70.5186,
    rating: 4.9,
    reviews: 73,
    description: 'Instalaciones premium, temperatura ideal y sillones muy mullidos.',
    image: 'https://images.unsplash.com/photo-1596484552834-6a58f850e0a1?auto=format&fit=crop&q=80&w=800',
    services: JSON.stringify(['Privada', 'Cómoda', 'Limpia', 'Accesible'])
  },
  {
    name: 'Mallplaza Norte',
    address: 'Av. Américo Vespucio 1737, Huechuraba',
    lat: -33.3678,
    lng: -70.6809,
    rating: 4.0,
    reviews: 62,
    description: 'Espacio adecuado, aunque suele estar concurrido los fines de semana.',
    image: 'https://images.unsplash.com/photo-1584824388196-857cb3e8b4bb?auto=format&fit=crop&q=80&w=800',
    services: JSON.stringify(['Limpia'])
  },
  {
    name: 'Florida Center',
    address: 'Av. Vicuña Mackenna 6100, La Florida',
    lat: -33.5132,
    lng: -70.6031,
    rating: 4.2,
    reviews: 44,
    description: 'Sala básica pero muy limpia. Ubicada en el nivel de tiendas infantiles.',
    image: 'https://images.unsplash.com/photo-1522771731470-3138f4a132fa?auto=format&fit=crop&q=80&w=800',
    services: JSON.stringify(['Cómoda', 'Accesible'])
  },
  {
    name: 'Clínica Bupa Santiago',
    address: 'Av. Departamental 1455, La Florida',
    lat: -33.5074,
    lng: -70.5979,
    rating: 4.8,
    reviews: 89,
    description: 'Moderna sala de extracción y lactancia en la torre de especialidades.',
    image: 'https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?auto=format&fit=crop&q=80&w=800',
    services: JSON.stringify(['Privada', 'Cómoda', 'Limpia', 'Accesible'])
  },
  {
    name: 'MUT (Nivel Subterráneo)',
    address: 'Av. Apoquindo 2730, Las Condes',
    lat: -33.4168,
    lng: -70.6011,
    rating: 4.6,
    reviews: 21,
    description: 'Segunda sala habilitada en el Mercado Urbano Tobalaba, nivel conexión metro.',
    image: 'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&q=80&w=800',
    services: JSON.stringify(['Privada', 'Accesible'])
  }
];

async function seed() {
  console.log("Iniciando inyección de datos reales (20 ubicaciones)...");
  
  // Limpiar salas actuales
  await prisma.review.deleteMany();
  await prisma.sala.deleteMany();
  
  for (const sala of salasData) {
    await prisma.sala.create({
      data: {
        name: sala.name,
        address: sala.address,
        lat: sala.lat,
        lng: sala.lng,
        rating: sala.rating,
        reviews: sala.reviews,
        description: sala.description,
        image: sala.image,
        services: sala.services,
        approved: true
      }
    });
  }
  
  console.log("¡20 Salas reales insertadas con éxito!");
}

seed()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
