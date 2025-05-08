import { ServiceAccount } from 'firebase-admin';

import { config } from '../config.js';

const { firebaseProjectId, firebaseClientEmail, firebasePrivateKey } = config;

export const serviceAccount: ServiceAccount = {
  projectId: firebaseProjectId,
  clientEmail: firebaseClientEmail,
  privateKey: firebasePrivateKey,
};
