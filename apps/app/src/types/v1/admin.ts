export enum UserRole {
  DEMO = 'DEMO',
  USER = 'USER',
  ADMIN = 'ADMIN',
}

export type CreateUserPayload = {
  email: string;
  name: string;
  password: string;
  role: UserRole;
};

/** Payload for activating a user (must supply the activation code) */
export type ActivateUserPayload = {
  userId: string;
  code: string;
};

/** Payload for deactivating a user (no code required) */
export type DeactivateUserPayload = {
  userId: string;
};

export type User = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  isActive: boolean;
  create_at: string;
  update_at: string;
};

export type GetAllUsersResponse = {
  data: User[];
  total: number;
  pages: number;
  page: number;
  limit: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  nextPage: number | null;
  previousPage: number | null;
};

export type FetchUsersParams = {
  isActive?: boolean | null; // Nullable to match the API schema
  page?: number; // Optional, for dynamic pagination
  limit?: number; // Optional, for dynamic page size
  date?: string;
  search?: string;
};

export type UpdateUserStatusPayload = {
  userId: string;
  status: boolean;
};
