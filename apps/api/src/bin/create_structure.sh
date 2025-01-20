# Load environment variables
echo "Current working directory: $(pwd)"

create_structure() {
  echo "Creating directory structure..."

  if [ -z "$NUM_NODES" ]; then
    echo "NUM_NODES is not set. Please provide the number of nodes."
    exit 1
  fi

  if [ ! -d "$BASE_DIR" ]; then
    mkdir -p "$BASE_DIR"
    echo "Base directory '$BASE_DIR' created."
  else
    echo "Base directory '$BASE_DIR' already exists."
  fi

  if ! [[ "$NUM_NODES" =~ ^[0-9]+$ ]] || [ "$NUM_NODES" -le 0 ]; then
    echo "Invalid number of nodes. Please enter a positive integer."
    exit 1
  fi

  for ((i = 1; i <= NUM_NODES; i++)); do
    NODE="Node-$i"
    NODE_DIR="$BASE_DIR/$NODE/data"

    if [ ! -d "$NODE_DIR" ]; then
      mkdir -p "$NODE_DIR"
      echo "Directory structure for '$NODE' created."
    else
      echo "Directory '$NODE_DIR' already exists."
    fi
  done
}

create_structure
