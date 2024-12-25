#!/bin/bash

# Define color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[0;37m'
RESET='\033[0m' # Reset color to default


# Load environment variables
if [ -f .env.development ]; then
  export $(grep -v '^#' .env.development | xargs)
else
  echo ".env file not found. Please create one in the project root directory."
  exit 1
fi

# Check if variables are loaded
if [ -z "$BASE_DIR" ]; then
  echo "BASE_DIR is not set in .env.development file."
  exit 1
fi

echo "Current working directory: $(pwd)"
cd ./apps/api/src
echo "Current working directory after cd: $(pwd)"

# Source function modules
source "./bin/container_node_operrations.sh"
source "./bin/config_operations.sh"
source "./bin/key_operations.sh"

# Orchestrate

# Use colors with echo
echo -e "${CYAN}Starting create_structure..."
create_structure

echo -e "${GREEN}Starting create_config_file..."
create_config_file

echo -e "${YELLOW}Starting run_besu_command..."
run_besu_command

echo -e "${BLUE}Starting distribute_keys..."
distribute_keys

echo -e "${PURPLE}Starting start_bootnode..."
start_bootnode

echo -e "${RED}Starting get_enode_url..."
get_enode_url

echo -e "${PURPLE}Starting start_node..."
start_node
