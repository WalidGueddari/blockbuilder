import bcrypt from 'bcryptjs';

import { UserRole, prisma } from '../client.js';

export default async function seedDev() {
  await Promise.all([
    prisma.user.create({
      data: {
        password: bcrypt.hashSync('passer'),
        email: 'max.mustermann@outlook.com'.toLowerCase(),
        name: 'Max Mustermann',
        role: UserRole.USER,
      },
    }),
    prisma.user.create({
      data: {
        password: bcrypt.hashSync('passer'),
        email: 'demo@demo.com'.toLowerCase(),
        name: 'Demo User',
        role: UserRole.DEMO,
      },
    }),
    prisma.user.create({
      data: {
        password: bcrypt.hashSync('passer'),
        email: 'admin@admin.pro'.toLowerCase(),
        name: 'Admin',
        role: UserRole.ADMIN,
      },
    }),
  ]);
}
