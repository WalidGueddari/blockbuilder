
generate_node_key_and_genesis_file() {
  echo "Running Besu command in $BASE_DIR/$NET_ID..."

  # Navigate to BASE_DIR
  cd "$BASE_DIR/$NET_ID" || {
    echo "Failed to navigate to $BASE_DIR/$NET_ID"
    exit 1
  }

  # Run the Besu command
  besu operator generate-blockchain-config \
    --config-file=qbftConfigFile.json \
    --to=networkFiles \
    --private-key-file-name=key

  # Check if the command was successful
  if [ $? -eq 0 ]; then
    echo "Besu command executed successfully. Blockchain configuration files generated in $BASE_DIR/$NET_ID/networkFiles."
  else
    echo "Besu command failed. Please check your Besu installation and configuration."
    exit 1
  fi

  # Copy genesis.json to BASE_DIR
  if [ -f "$BASE_DIR/$NET_ID/networkFiles/genesis.json" ]; then
    cp "$BASE_DIR/$NET_ID/networkFiles/genesis.json" genesis.json
    echo "genesis.json copied to '$BASE_DIR/$NET_ID'."
  else
    echo "genesis.json not found in '$BASE_DIR/$NET_ID/networkFiles'."
    exit 1
  fi
}

generate_node_key_and_genesis_file