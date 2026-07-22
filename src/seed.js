const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const postCount = await prisma.post.count();
  const salaCount = await prisma.sala.count();

  let user1, user2, user3;

  if (postCount === 0) {
    console.log('Seeding users and posts...');
    
    const hash1 = await bcrypt.hash('password123', 10);
    const hash2 = await bcrypt.hash('password123', 10);
    const hash3 = await bcrypt.hash('password123', 10);

    user1 = await prisma.user.create({
      data: {
        name: 'María José',
        email: 'maria@ejemplo.com',
        password: hash1,
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150',
        verified: true,
        bio: 'Matrona especialista en lactancia materna. Feliz de ayudar.',
        points: 245
      }
    });

    user2 = await prisma.user.create({
      data: {
        name: 'Camila R.',
        email: 'camila@ejemplo.com',
        password: hash2,
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150',
        bio: 'Mamá primeriza aprendiendo día a día.',
        points: 128
      }
    });

    user3 = await prisma.user.create({
      data: {
        name: 'Valentina M.',
        email: 'valentina@ejemplo.com',
        password: hash3,
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
        bio: 'Madre de Lucas (3 meses). Compartiendo mi experiencia.',
        points: 87
      }
    });

    // Create varied posts
    await prisma.post.createMany({
      data: [
        {
          title: 'Tips para extracción en el trabajo',
          content: '¡Hola mamás! 💜\n¿Cuáles son sus tips para organizar la extracción de leche cuando se vuelve al trabajo?\nToda experiencia suma ✨',
          tag: 'Vuelta al trabajo',
          authorId: user1.id,
          likes: 25
        },
        {
          title: 'Mi kit de extracción',
          content: 'Les comparto mi kit de extracción que me ha resultado increíble para mi día a día 👇\n\n- Extractor eléctrico doble\n- Bolsas de almacenamiento\n- Cooler con gel\n- Toallitas húmedas\n\n¡Ha sido un cambio total!',
          tag: 'Extracción',
          authorId: user2.id,
          likes: 18
        },
        {
          title: 'Mi experiencia volviendo al trabajo',
          content: 'Quiero compartir mi experiencia por si puede servirle a alguna mamá que esté por volver al trabajo...\n\nRegresé hace 2 semanas y estos fueron mis mayores desafíos:\n1. Organizar los horarios de extracción\n2. Encontrar un lugar privado\n3. Mantener la producción\n\n¡Ahora ya tengo una rutina que funciona! 💪',
          tag: 'Vuelta al trabajo',
          authorId: user3.id,
          likes: 42
        },
        {
          title: 'Dolor al amamantar - ¿es normal?',
          content: 'Hola comunidad, tengo una duda. Mi bebé tiene 2 semanas y siento mucho dolor al amamantar, especialmente al inicio de cada toma. ¿Es normal los primeros días o debería consultar?\n\nAgradezco cualquier orientación 🙏',
          tag: 'Dolor o molestias',
          authorId: user2.id,
          likes: 31
        },
        {
          title: '¿Cada cuánto tiempo extraen en el trabajo?',
          content: 'Hola mamás, tengo una duda sobre los horarios para extraerme la leche extraída si trabajo todo el día fuera de casa.\n\n¿Cada cuántas horas se extraen? ¿Cómo mantienen la cadena de frío? 🤔',
          tag: 'Extracción',
          authorId: user3.id,
          likes: 15
        },
        {
          title: 'Recomendaciones de extractores',
          content: '¿Qué extractores eléctricos recomiendan? Busco uno bueno pero que no sea tan caro. Estoy entre el Medela y el Spectra.\n\n¿Alguien ha probado ambos? ¡Gracias! 💜',
          tag: 'Extracción',
          authorId: user1.id,
          likes: 22
        },
        {
          title: 'Almacenamiento de leche materna',
          content: '¡Hola! Les comparto los tiempos de almacenamiento que me dio mi matrona:\n\n🌡️ Temperatura ambiente: 4-6 horas\n❄️ Refrigerador: 3-5 días\n🧊 Congelador: 6-12 meses\n\n¡Espero les sirva! Recuerden siempre etiquetar con fecha.',
          tag: 'General',
          authorId: user1.id,
          likes: 56
        },
        {
          title: 'Lactancia y alimentación complementaria',
          content: 'Mi pediatra me dijo que a los 6 meses puedo empezar con la alimentación complementaria, pero que la lactancia sigue siendo lo principal hasta el año.\n\n¿Cómo han combinado ambas? ¿Algún tip para empezar? 🍌🥑',
          tag: 'General',
          authorId: user3.id,
          likes: 19
        }
      ]
    });

    console.log('Users and posts seeded.');
  }

  if (salaCount === 0) {
    console.log('Seeding salas de lactancia...');
    
    const salas = [
      {
        name: 'Costanera Center',
        address: 'Av. Andrés Bello 2425, Providencia',
        lat: -33.4172,
        lng: -70.6067,
        rating: 4.7,
        reviews: 128,
        services: JSON.stringify(['Privada', 'Cómoda', 'Limpia', 'Accesible', 'Enchufes', 'Lavamanos', 'Cambio de pañales']),
        description: 'Sala de lactancia ubicada en el Nivel 2, al lado de los baños familiares. Cuenta con sillón cómodo, lavamanos, enchufes y buena iluminación. Espacio amplio y bien mantenido.',
        image: 'https://images.unsplash.com/photo-1596484552834-6a58f850e0a1?auto=format&fit=crop&q=80&w=800',
        approved: true,
        openTime: '10:00',
        closeTime: '21:00',
        openDays: 'Lunes a Domingo'
      },
      {
        name: 'Parque Arauco',
        address: 'Av. Presidente Kennedy 5413, Las Condes',
        lat: -33.4012,
        lng: -70.5760,
        rating: 4.5,
        reviews: 95,
        services: JSON.stringify(['Privada', 'Cómoda', 'Limpia', 'Accesible', 'Enchufes', 'Cambio de pañales']),
        description: 'Espacio habilitado cerca de los baños principales del segundo piso. Ambiente tranquilo con sillones y mesón para cambio de pañales.',
        image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=800',
        approved: true,
        openTime: '10:00',
        closeTime: '21:00',
        openDays: 'Lunes a Domingo'
      },
      {
        name: 'Mall Plaza Vespucio',
        address: 'Av. Vicuña Mackenna 7110, La Florida',
        lat: -33.5326,
        lng: -70.5980,
        rating: 4.3,
        reviews: 76,
        services: JSON.stringify(['Privada', 'Limpia', 'Accesible', 'Cambio de pañales', 'Lavamanos']),
        description: 'Sala de lactancia y muda ubicada en el primer piso junto a los baños principales. Espacio privado con cerradura, sillón y mudador.',
        image: 'https://images.unsplash.com/photo-1555116505-38ab61800975?auto=format&fit=crop&q=80&w=800',
        approved: true,
        openTime: '10:00',
        closeTime: '21:00',
        openDays: 'Lunes a Domingo'
      },
      {
        name: 'Mall Plaza Egaña',
        address: 'Av. Larraín 5862, La Reina',
        lat: -33.4540,
        lng: -70.5746,
        rating: 4.6,
        reviews: 62,
        services: JSON.stringify(['Privada', 'Cómoda', 'Limpia', 'Accesible', 'Enchufes', 'Lavamanos', 'Cambio de pañales']),
        description: 'Sala de lactancia moderna en el segundo piso. Incluye sillones reclinables, enchufes USB, lavamanos y mudador. Muy bien mantenida.',
        image: 'https://images.unsplash.com/photo-1631679706909-1844bbd07221?auto=format&fit=crop&q=80&w=800',
        approved: true,
        openTime: '10:00',
        closeTime: '21:00',
        openDays: 'Lunes a Domingo'
      },
      {
        name: 'Mall Plaza Norte',
        address: 'Av. Américo Vespucio 1737, Huechuraba',
        lat: -33.3691,
        lng: -70.6554,
        rating: 4.2,
        reviews: 54,
        services: JSON.stringify(['Privada', 'Limpia', 'Cambio de pañales', 'Accesible']),
        description: 'Salas habilitadas en cada planta del centro comercial. Cuentan con mudador y sillón. Preguntar en mesón de información por la más cercana.',
        image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=800',
        approved: true,
        openTime: '10:00',
        closeTime: '21:00',
        openDays: 'Lunes a Domingo'
      },
      {
        name: 'Mall Alto Las Condes',
        address: 'Av. Presidente Kennedy 9001, Las Condes',
        lat: -33.3995,
        lng: -70.5244,
        rating: 4.8,
        reviews: 112,
        services: JSON.stringify(['Privada', 'Cómoda', 'Limpia', 'Accesible', 'Enchufes', 'Lavamanos', 'Refrigerador', 'Cambio de pañales', 'Wi-Fi']),
        description: 'Una de las mejores salas de lactancia de Santiago. Espacio amplio, climatizado, con sillones premium, refrigerador para almacenar leche, enchufes y Wi-Fi gratuito.',
        image: 'https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&q=80&w=800',
        approved: true,
        openTime: '10:00',
        closeTime: '21:00',
        openDays: 'Lunes a Domingo'
      },
      {
        name: 'Clínica Alemana',
        address: 'Av. Manquehue Norte 1499, Vitacura',
        lat: -33.3950,
        lng: -70.5810,
        rating: 4.9,
        reviews: 189,
        services: JSON.stringify(['Privada', 'Cómoda', 'Limpia', 'Accesible', 'Enchufes', 'Lavamanos', 'Refrigerador', 'Cambio de pañales', 'Wi-Fi']),
        description: 'Clínica de Lactancia con asesoría profesional de matronas especializadas. Espacio clínico impecable con todo el equipamiento necesario para extracción y almacenamiento.',
        image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=800',
        approved: true,
        openTime: '08:00',
        closeTime: '20:00',
        openDays: 'Lunes a Viernes'
      },
      {
        name: 'Clínica Las Condes',
        address: 'Estoril 450, Las Condes',
        lat: -33.4093,
        lng: -70.5280,
        rating: 4.8,
        reviews: 156,
        services: JSON.stringify(['Privada', 'Cómoda', 'Limpia', 'Accesible', 'Enchufes', 'Lavamanos', 'Refrigerador', 'Cambio de pañales']),
        description: 'Clínica de Lactancia con matronas especialistas. Apoyo profesional para embarazadas y madres con recién nacidos. Ideal para consultas sobre técnicas de amamantamiento.',
        image: 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&q=80&w=800',
        approved: true,
        openTime: '08:00',
        closeTime: '18:00',
        openDays: 'Lunes a Viernes'
      },
      {
        name: 'Hospital San Borja Arriarán',
        address: 'Av. Santa Rosa 1234, Santiago Centro',
        lat: -33.4560,
        lng: -70.6478,
        rating: 4.1,
        reviews: 67,
        services: JSON.stringify(['Privada', 'Limpia', 'Accesible', 'Lavamanos', 'Cambio de pañales']),
        description: 'Lactario acondicionado para madres con hijos hospitalizados en Neonatología o Pediatría. Ambiente higiénico para extracción y conservación de leche materna.',
        image: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&q=80&w=800',
        approved: true,
        openTime: '08:00',
        closeTime: '20:00',
        openDays: 'Lunes a Domingo'
      },
      {
        name: 'Clínica Santa María',
        address: 'Av. Santa María 0500, Providencia',
        lat: -33.4210,
        lng: -70.6246,
        rating: 4.6,
        reviews: 98,
        services: JSON.stringify(['Privada', 'Cómoda', 'Limpia', 'Enchufes', 'Lavamanos', 'Refrigerador', 'Cambio de pañales']),
        description: 'Clínica de Lactancia especializada con asesoría y acompañamiento profesional. Espacio dedicado en el área de Maternidad con todo el equipamiento necesario.',
        image: 'https://images.unsplash.com/photo-1551190822-a9ce113ac100?auto=format&fit=crop&q=80&w=800',
        approved: true,
        openTime: '08:00',
        closeTime: '18:00',
        openDays: 'Lunes a Sábado'
      },
      {
        name: 'Clínica Dávila',
        address: 'Av. Recoleta 464, Recoleta',
        lat: -33.4310,
        lng: -70.6470,
        rating: 4.4,
        reviews: 73,
        services: JSON.stringify(['Privada', 'Cómoda', 'Limpia', 'Accesible', 'Enchufes', 'Lavamanos', 'Cambio de pañales']),
        description: 'Servicio de Clínica de Lactancia con apoyo profesional pre y posparto. Matronas especializadas disponibles para orientación y acompañamiento.',
        image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?auto=format&fit=crop&q=80&w=800',
        approved: true,
        openTime: '08:00',
        closeTime: '17:00',
        openDays: 'Lunes a Viernes'
      },
      {
        name: 'Hospital del Salvador',
        address: 'Av. Salvador 364, Providencia',
        lat: -33.4410,
        lng: -70.6318,
        rating: 3.9,
        reviews: 42,
        services: JSON.stringify(['Privada', 'Limpia', 'Accesible', 'Lavamanos']),
        description: 'Espacio habilitado para lactancia en el área de maternidad. Consultar en la oficina de informaciones por la ubicación exacta al ingresar.',
        image: 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&q=80&w=800',
        approved: true,
        openTime: '08:00',
        closeTime: '20:00',
        openDays: 'Lunes a Domingo'
      },
      {
        name: 'MUT (Mercado Urbano Tobalaba)',
        address: 'Av. Providencia 2124, Providencia',
        lat: -33.4226,
        lng: -70.6110,
        rating: 4.3,
        reviews: 38,
        services: JSON.stringify(['Privada', 'Cómoda', 'Limpia', 'Enchufes']),
        description: 'Sala de lactancia dedicada en el piso 3, junto a los baños cerca de Librería Azafrán. Acceso solicitando mediante timbre. Espacio íntimo y tranquilo.',
        image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=800',
        approved: true,
        openTime: '10:00',
        closeTime: '20:00',
        openDays: 'Lunes a Domingo'
      },
      {
        name: 'Mall Plaza Oeste',
        address: 'Av. Américo Vespucio 1501, Cerrillos',
        lat: -33.4963,
        lng: -70.7124,
        rating: 4.0,
        reviews: 35,
        services: JSON.stringify(['Privada', 'Limpia', 'Accesible', 'Cambio de pañales']),
        description: 'Sala de lactancia en el segundo piso del centro comercial. Espacio básico pero funcional con mudador y sillón.',
        image: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&q=80&w=800',
        approved: true,
        openTime: '10:00',
        closeTime: '21:00',
        openDays: 'Lunes a Domingo'
      },
      {
        name: 'Aeropuerto SCL (Terminal Internacional)',
        address: 'Armando Cortínez Ote. 1704, Pudahuel',
        lat: -33.3929,
        lng: -70.7856,
        rating: 4.5,
        reviews: 87,
        services: JSON.stringify(['Privada', 'Cómoda', 'Limpia', 'Accesible', 'Enchufes', 'Lavamanos', 'Cambio de pañales', 'Wi-Fi']),
        description: 'Sala de lactancia moderna ubicada en la zona de embarque internacional. Espacio climatizado, silencioso y con todas las comodidades para mamás viajeras.',
        image: 'https://images.unsplash.com/photo-1436491865332-7a61a109db05?auto=format&fit=crop&q=80&w=800',
        approved: true,
        openTime: '05:00',
        closeTime: '23:00',
        openDays: 'Lunes a Domingo'
      },
      {
        name: 'Mall Plaza Tobalaba',
        address: 'Camino Las Flores 12000, Puente Alto',
        lat: -33.5875,
        lng: -70.5680,
        rating: 4.1,
        reviews: 29,
        services: JSON.stringify(['Privada', 'Limpia', 'Cambio de pañales', 'Accesible']),
        description: 'Espacio de lactancia y muda en el primer piso. Sillón cómodo y mudador disponible. Consultar ubicación en mesón de información.',
        image: 'https://images.unsplash.com/photo-1615874959474-d609969a20ed?auto=format&fit=crop&q=80&w=800',
        approved: true,
        openTime: '10:00',
        closeTime: '21:00',
        openDays: 'Lunes a Domingo'
      },
      {
        name: 'Centro Cultural GAM',
        address: 'Av. Lib. Bernardo O\'Higgins 227, Santiago Centro',
        lat: -33.4403,
        lng: -70.6530,
        rating: 4.2,
        reviews: 23,
        services: JSON.stringify(['Privada', 'Cómoda', 'Limpia', 'Accesible']),
        description: 'Espacio habilitado para la lactancia dentro del centro cultural. Ambiente tranquilo y acogedor, ideal para madres que visitan exposiciones o eventos.',
        image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800',
        approved: true,
        openTime: '10:00',
        closeTime: '21:00',
        openDays: 'Martes a Domingo'
      },
      {
        name: 'UC Campus San Joaquín',
        address: 'Av. Vicuña Mackenna 4860, Macul',
        lat: -33.4985,
        lng: -70.6133,
        rating: 4.4,
        reviews: 31,
        services: JSON.stringify(['Privada', 'Cómoda', 'Limpia', 'Enchufes', 'Refrigerador', 'Lavamanos']),
        description: 'Sala de lactancia universitaria administrada por la DAE. Espacio privado con refrigerador para almacenamiento. Requiere coordinación previa con recepción del campus.',
        image: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&q=80&w=800',
        approved: true,
        openTime: '08:00',
        closeTime: '18:00',
        openDays: 'Lunes a Viernes'
      }
    ];

    for (const sala of salas) {
      await prisma.sala.create({ data: sala });
    }
    
    console.log(`${salas.length} salas de lactancia seeded.`);
  }

  console.log('Seed check complete.');
}

module.exports = main;
