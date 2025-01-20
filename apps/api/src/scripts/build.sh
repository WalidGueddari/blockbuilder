#!/bin/bash
tree .
# Load environment variables
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
else
  echo ".env file not found. Please create one in the project root directory."
  exit 1
fi

# Check if variables are loaded
if [ -z "$BASE_DIR" ]; then
  echo "BASE_DIR is not set in .env file."
  exit 1
fi

# Source function modules
source "./trash/node_operations.sh"
source "./trash/config_operations.sh"
source "./trash/key_operations.sh"

# Orchestrate
create_structure
create_config_file
run_besu_command
distribute_keys
start_bootnode
get_enode_url
start_other_nodes