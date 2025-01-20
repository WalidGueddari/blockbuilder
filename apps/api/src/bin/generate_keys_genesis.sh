
generate_node_key_and_genesis_file() {
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

generate_node_key_and_genesis_file