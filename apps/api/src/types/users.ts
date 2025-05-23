import { UserRole } from '@saas-monorepo/database';

export type CreateUserPayload = {
  email: string;
  name: string;
  password: string;
  role: UserRole;
};
