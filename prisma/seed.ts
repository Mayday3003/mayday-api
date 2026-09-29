import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando carga de datos semilla (Seed)...');

  // Limpiar datos existentes en orden de dependencia
  await prisma.interaction.deleteMany();
  await prisma.experience.deleteMany();
  await prisma.user.deleteMany();

  // 1. Crear Usuarios de prueba (1 Admin y 1 User estándar) con contraseñas hasheadas con bcrypt
  const saltRounds = 10;
  const adminPasswordHash = await bcrypt.hash('AdminMayday2026*', saltRounds);
  const userPasswordHash = await bcrypt.hash('UserMayday2026*', saltRounds);

  const admin = await prisma.user.create({
    data: {
      name: 'Mariana Lopera (Admin)',
      email: 'admin@mayday3003.world',
      password: adminPasswordHash,
      role: 'admin',
    },
  });

  const normalUser = await prisma.user.create({
    data: {
      name: 'Estudiante Evaluador (User)',
      email: 'evaluador@mayday3003.world',
      password: userPasswordHash,
      role: 'user',
    },
  });

  console.log(`👤 Usuarios creados: Admin (${admin.email}) y User (${normalUser.email})`);

  // 2. Cargar Catálogo de Experiencias reales de Mayday (de la Entrega 1)
  const exp1 = await prisma.experience.create({
    data: {
      title: 'Capurganá 2025',
      type: 'viaje',
      description: 'Un viaje para desconectar, bucear con tiburones y grabar recuerdos bajo el agua en el Caribe.',
      imageUrl: 'https://mayday3003.world/assets/images/IMG_0204.JPG',
      date: new Date('2025-01-15'),
      participants: ['Mariana', 'Ana'],
    },
  });

  const exp2 = await prisma.experience.create({
    data: {
      title: 'Noche de observación astronómica',
      type: 'situacion',
      description: 'Larga sesión de telescopio OAN con café, física de plasmas y conversación sobre estrellas y galaxias.',
      imageUrl: 'https://mayday3003.world/assets/images/IMG_0178.JPG',
      date: new Date('2025-08-20'),
      participants: ['Mariana', 'David'],
    },
  });

  const exp3 = await prisma.experience.create({
    data: {
      title: 'Feria de las Flores & Música',
      type: 'experiencia',
      description: 'Color, música en vivo, conciertos y recuerdos que siempre dan ganas de repetir con amigos.',
      imageUrl: 'https://mayday3003.world/assets/images/feria.jpeg',
      date: new Date('2026-08-05'),
      participants: ['Mariana'],
    },
  });

  const exp4 = await prisma.experience.create({
    data: {
      title: 'Inmersión en arrecife de coral',
      type: 'viaje',
      description: 'Exploración marina profunda observando especies protegidas y flora marina en el archipiélago.',
      imageUrl: 'https://mayday3003.world/assets/images/IMG_0203.JPG',
      date: new Date('2025-11-12'),
      participants: ['Mariana', 'Carlos'],
    },
  });

  const exp5 = await prisma.experience.create({
    data: {
      title: 'Observatorio Ultravioleta Lunar (Investigación)',
      type: 'experiencia',
      description: 'Misión espacial para la reconstrucción 3D de la exósfera terrestre y su interacción con el viento solar.',
      imageUrl: 'https://mayday3003.world/assets/images/IMG_0051.JPG',
      date: new Date('2026-02-18'),
      participants: ['Mariana', 'Equipo de Investigación'],
    },
  });

  console.log('🌌 Catálogo de 5 experiencias reales cargado exitosamente.');

  // 3. Crear interacciones/comentarios iniciales vinculados por llaves foráneas
  await prisma.interaction.create({
    data: {
      content: 'Ese atardecer en Capurganá fue de los momentos más mágicos del año.',
      userId: normalUser.id,
      experienceId: exp1.id,
    },
  });

  await prisma.interaction.create({
    data: {
      content: 'Increíble la nitidez de la Luna con ese telescopio. ¡Hay que repetir!',
      userId: admin.id,
      experienceId: exp2.id,
    },
  });

  console.log('💬 Interacciones de prueba creadas con relaciones foráneas.');
  console.log('✅ Seed completado con éxito.');
}

main()
  .catch((e) => {
    console.error('❌ Error en el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
