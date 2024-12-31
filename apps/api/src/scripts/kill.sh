#!/bin/bash
# Kill Besu networks (all running Besu processes)
# Load environment variables
if [ -f .env.development ]; then
  export $(grep -v '^#' .env.development | xargs)
else
  echo ".env file not found. Please create one in the project root directory."
  exit 1
fi

# Check if variables are loaded
if [ -z "$BASE_DIR" ]; then
  echo "BASE_DIR is not set in .env file."
  exit 1
fi

echo "Current working directory: $(pwd)"
cd ./apps/api/src

echo "Stopping running Besu nodes..."
pkill -9 -f 'besu'

# Check if the pkill command was successful
if [ $? -eq 0 ]; then
  echo "Besu nodes stopped successfully."
else
  echo "No Besu processes found locally or failed to stop Besu nodes."
fi

# Stop and remove all Docker containers
running_containers=$(docker ps -q)
if [ -n "$running_containers" ]; then
  echo "Stopping all running Docker containers..."
  docker stop $running_containers
else
  echo "No running Docker containers found."
fi

# Remove all Docker containers
echo "Removing all Docker containers..."
docker rm $(docker ps -a -q)

# Remove all Docker volumes (warning: this will delete all volumes)
echo "Removing all Docker volumes..."
docker volume prune -f

# Remove all Docker networks
echo "Removing all Docker networks..."
docker network prune -f

# Optional: Remove unused Docker images except for the Besu image
unused_images=$(docker images --format '{{.Repository}}:{{.Tag}}' | grep -v 'hyperledger/besu')
if [ -n "$unused_images" ]; then
  echo "Removing unused Docker images except for the Besu image..."
  echo "$unused_images" | xargs -I {} docker rmi -f {}
else
  echo "No unused Docker images to remove."
fi

echo "Unused Docker images removed, except for the Besu image."

# Check if the BASE_DIR exists and delete it
if [ -d "$BASE_DIR" ]; then
  echo "Deleting the $BASE_DIR directory..."
  rm -rf "$BASE_DIR"

  if [ $? -eq 0 ]; then
    echo "$BASE_DIR directory deleted successfully."
  else
    echo "Failed to delete the $BASE_DIR directory."
  fi
else
  echo "$BASE_DIR directory does not exist."
fi
