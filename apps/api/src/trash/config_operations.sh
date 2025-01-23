# Function to create directory structure
create_structure() {
  echo "Creating directory structure..."

  if [ ! -d "$BASE_DIR" ]; then
    mkdir -p "$BASE_DIR"
    echo "Base directory '$BASE_DIR' created."
  else
    echo "Base directory '$BASE_DIR' already exists."
  fi

  read -p "What would you like to name the network " NET_NAME
  read -p "How many nodes do you want to create? " NUM_NODES

  if ! [[ "$NUM_NODES" =~ ^[0-9]+$ ]] || [ "$NUM_NODES" -le 0 ]; then
    echo "Invalid number of nodes. Please enter a positive integer."
    exit 1
  fi

  for ((i = 1; i <= NUM_NODES; i++)); do
    NODE="Node-$i"
    NODE_DIR="$BASE_DIR/$NET_NAME/$NODE/data"

    if [ ! -d "$NODE_DIR" ]; then
      mkdir -p "$NODE_DIR"
      echo "Directory structure for '$NODE' created."
    else
      echo "Directory '$NODE_DIR' already exists."
    fi
  done
}

# Function to create configuration file
create_config_file() {
  if [ ! -f "$QBFT_TEMPLATE_FILE" ]; then
    echo "Template file '$QBFT_TEMPLATE_FILE' not found."
    exit 1
  fi

  echo "Creating qbftConfigFile.json..."

  # Read the template
  TEMPLATE=$(<"$QBFT_TEMPLATE_FILE")

  # Generate private keys and addresses
  PRIVATE_KEY_1=$(generate_private_key)
  PRIVATE_KEY_2=$(generate_private_key)
  ADDRESS_1=$(generate_address "$PRIVATE_KEY_1")
  ADDRESS_2=$(generate_address "$PRIVATE_KEY_2")

  # Replace placeholders in the template
  CONFIG_CONTENT=$(echo "$TEMPLATE" |
    sed "s/PLACEHOLDER_KEY_1/$PRIVATE_KEY_1/" |
    sed "s/PLACEHOLDER_KEY_2/$PRIVATE_KEY_2/" |
    sed "s/PLACEHOLDER_ADDRESS_1/$ADDRESS_1/" |
    sed "s/PLACEHOLDER_ADDRESS_2/$ADDRESS_2/" |
    sed "s/PLACEHOLDER_NODE_COUNT/$NUM_NODES/")

  # Write to the output file
  echo "$CONFIG_CONTENT" >"$OUTPUT_FILE"

  echo "qbftConfigFile.json created at '$OUTPUT_FILE'."
}

run_besu_command() {
  echo "Running Besu command in $BASE_DIR..."

  # Navigate to BASE_DIR
  cd "$BASE_DIR" || {
    echo "Failed to navigate to $BASE_DIR"
    exit 1
  }

  # Run the Besu command
  besu operator generate-blockchain-config \
    --config-file=qbftConfigFile.json \
    --to=networkFiles \
    --private-key-file-name=key

  # Check if the command was successful
  if [ $? -eq 0 ]; then
    echo "Besu command executed successfully. Blockchain configuration files generated in $NETWORK_FILES_DIR."
  else
    echo "Besu command failed. Please check your Besu installation and configuration."
    exit 1
  fi

  # Copy genesis.json to BASE_DIR
  if [ -f "$NETWORK_FILES_DIR/genesis.json" ]; then
    cp "$NETWORK_FILES_DIR/genesis.json" genesis.json
    echo "genesis.json copied to '$BASE_DIR'."
  else
    echo "genesis.json not found in '$NETWORK_FILES_DIR'."
    exit 1
  fi
}