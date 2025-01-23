# Function to distribute keys to nodes
distribute_keys() {
  echo "Distributing keys to node directories..."
  echo "NUM_NODES is set to: $NUM_NODES" # Log NUM_NODES value

  # Get all subdirectories in networkFiles/keys
  KEYS_DIR="$BASE_DIR/$NET_ID/networkFiles/keys"
  NODE_INDEX=1

  for ADDRESS_DIR in "$KEYS_DIR"/*; do
    if [ -d "$ADDRESS_DIR" ] && [ $NODE_INDEX -le $NUM_NODES ]; then
      NODE_DIR="$BASE_DIR/$NET_ID/Node-$NODE_INDEX/data"

      # Copy key and key.pub to the respective Node directory
      cp "$ADDRESS_DIR/key" "$NODE_DIR/"
      cp "$ADDRESS_DIR/key.pub" "$NODE_DIR/"
      echo "Keys from '$ADDRESS_DIR' copied to '$NODE_DIR'."

      ((NODE_INDEX++))
    fi
  done

  if [ $NODE_INDEX -le $NUM_NODES ]; then
    echo "Not enough key directories to match the number of nodes. Please verify key generation."
    exit 1
  fi

  echo "Keys distribution completed."

  Delete the networkFiles directory
  if [ -d "$BASE_DIR/$NET_ID/networkFiles" ]; then
    rm -rf "$BASE_DIR/$NET_ID/networkFiles"
    echo "networkFiles directory deleted."
  fi
}

distribute_keys
