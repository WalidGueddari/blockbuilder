import { config } from '../config.js';

const { subscriptionId, location, image, size, osDiskSize, storageType, securityType } = config;

export const azureConfig = {
  subscriptionId: subscriptionId,
  location: location,
  image: image,
  size: size,
  osDiskSize: osDiskSize,
  storageType: storageType,
  securityType: securityType,
};
