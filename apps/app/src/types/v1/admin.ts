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
  page: number;
  limit: number;
};

export type UpdateUserStatusPayload = {
  userId: string;
  status: boolean;
};

export type FetchUsersParams = {
  isActive: boolean;
  page?: number;
  limit?: number;
  date?: string;
  search?: string;
};
