# Function to create configuration file
echo "Current working directory: $(pwd)"

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

create_config_file() {
  if [ -z "$NUM_NODES" ]; then
    echo "NUM_NODES is not set. Please provide the number of nodes."
    exit 1
  fi
  
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

create_config_file