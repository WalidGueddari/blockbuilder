import { faker } from '@faker-js/faker';
import bcrypt from 'bcryptjs';

import { UserRole, prisma } from '../client.js';

export default async function seedDev() {
  // Create 20 test users with realistic fake data
  const users = Array.from({ length: 20 }, (_, index) => ({
    password: bcrypt.hashSync('passer'), // Same password for all test users
    email: faker.internet.email().toLowerCase(),
    name: faker.person.fullName(),
    role:
      index === 0
        ? UserRole.ADMIN // First user is admin
        : index === 1
          ? UserRole.DEMO // Second user is demo
          : UserRole.USER, // Remaining are regular users
    code: (100000 + index).toString(), // Sequential 6-digit codes
  }));

  await prisma.user.createMany({
    data: users,
  });
}
