import bcrypt from 'bcryptjs';

import { prisma } from '../client.js';

export default async function seedDev() {
  await prisma.user.create({
    data: {
      password: bcrypt.hashSync('MaxMustermann2025'),
      email: 'MaxMustermann@outlook.com',
      name: 'Max Mustermann',
    },
  });
}
