import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const instructor = await prisma.user.upsert({
    where: { email: 'instructor@example.com' },
    update: {},
    create: {
      email: 'instructor@example.com',
      name: 'Dr. Smith',
      role: 'instructor',
    },
  });
  const student1 = await prisma.user.upsert({
    where: { email: 'student1@example.com' },
    update: {},
    create: {
      email: 'student1@example.com',
      name: 'Alice Student',
      role: 'student',
    },
  });
  const student2 = await prisma.user.upsert({
    where: { email: 'student2@example.com' },
    update: {},
    create: {
      email: 'student2@example.com',
      name: 'Bob Student',
      role: 'student',
    },
  });

  const assignment = await prisma.assignment.create({
    data: {
      title: 'Explain Data Structures',
      description:
        'Write a short essay explaining the difference between a stack and a queue. Include at least one example of each. Use clear sections and explain with depth.',
      maxScore: 100,
      instructorId: instructor.id,
    },
  });

  console.log('Seeded:', { instructor, student1, student2, assignment });
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
