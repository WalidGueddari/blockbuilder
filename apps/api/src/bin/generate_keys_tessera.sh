generateTesseraKeys() {
    echo "working directory: $(pwd)"
    echo "Generating tessera keys..."

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

    if ! [[ "$NUM_NODES" =~ ^[0-9]+$ ]] || [ "$NUM_NODES" -le 0 ]; then
        echo "Invalid number of nodes. Please enter a positive integer."
        exit 1
    fi

    for ((i = 1; i <= NUM_NODES; i++)); do

        NODE_DIR="$BASE_DIR/$NET_ID/Node-$i/Tessera/data"
        echo "Generating Tessera keys for Node-$i..."

        if [ ! -d "$NODE_DIR" ]; then
            echo "Error: Directory $NODE_DIR does not exist."
            exit 1
        fi

        yes "" | tessera -keygen -filename $NODE_DIR/nodeKey
    done
}

generateTesseraKeys
