// apps/app/src/types/job.ts
export interface JobNotification {
  id: string;
  userId: string;
  status: string;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
  networkId: string;
  Network: {
    id: string;
    name: string;
  };
  read?: boolean;
  time?: string;
}
