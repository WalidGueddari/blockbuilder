# Load environment variables
echo "Current working directory: $(pwd)"

create_structure() {
  echo "Creating directory structure..."

  if [ -z "$NUM_NODES" ]; then
    echo "NUM_NODES is not set. Please provide the number of nodes."
    exit 1
  fi

  if [ -z "$NET_ID" ]; then
    echo "NET_ID is not set. Please provide the network id."
    exit 1
  fi

  if [ ! -d "$BASE_DIR" ]; then
    mkdir -p "$BASE_DIR"
    echo "Base directory '$BASE_DIR' created."
  else
    echo "Base directory '$BASE_DIR' already exists."
  fi

  # Create hardhat/contracts directory
  HARDHAT_DIR="$BASE_DIR/hardhat/contracts"
  if [ ! -d "$HARDHAT_DIR" ]; then
    mkdir -p "$HARDHAT_DIR"
    echo "Hardhat contracts directory '$HARDHAT_DIR' created."
  else
    echo "Hardhat contracts directory '$HARDHAT_DIR' already exists."
  fi

  if ! [[ "$NUM_NODES" =~ ^[0-9]+$ ]] || [ "$NUM_NODES" -le 0 ]; then
    echo "Invalid number of nodes. Please enter a positive integer."
    exit 1
  fi

  for ((i = 1; i <= NUM_NODES; i++)); do
    NODE="Node-$i"
    NODE_DIR="$BASE_DIR/$NET_ID/$NODE/data"
    TESSERA_DIR="$BASE_DIR/$NET_ID/$NODE/Tessera"
    TESSERA_DIR_DATA="$BASE_DIR/$NET_ID/$NODE/Tessera/data"

    if [ ! -d "$NODE_DIR" ]; then
      mkdir -p "$NODE_DIR"
      mkdir -p "$TESSERA_DIR"
      mkdir -p "$TESSERA_DIR_DATA"
      echo "Directory structure for '$NODE' created."
    else
      echo "Directory '$NODE_DIR' already exists."
    fi
  done
}

create_structure
