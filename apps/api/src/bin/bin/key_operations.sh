# Function to generate random private keys
generate_private_key() {
  openssl rand -hex 32
}

# Function to derive Ethereum address using Web3.py
generate_address() {
  local private_key=$1

  python3 - <<EOF
from eth_keys import keys
from eth_utils import to_checksum_address

private_key = keys.PrivateKey(bytes.fromhex("$private_key"))
address = to_checksum_address(private_key.public_key.to_address())
print(address)
EOF
}

# Function to distribute keys to nodes
distribute_keys() {
  echo "Distributing keys to node directories..."

  # Get all subdirectories in networkFiles/keys
  KEYS_DIR="$NETWORK_FILES_DIR/keys"
  NODE_INDEX=1

  for ADDRESS_DIR in "$KEYS_DIR"/*; do
    if [ -d "$ADDRESS_DIR" ] && [ $NODE_INDEX -le $NUM_NODES ]; then
      NODE_DIR="Node-$NODE_INDEX/data"

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

  # Delete the networkFiles directory
  if [ -d "$NETWORK_FILES_DIR" ]; then
    rm -rf "$NETWORK_FILES_DIR"
    echo "networkFiles directory deleted."
  fi
}
