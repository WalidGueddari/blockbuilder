generate_docker_compose_bootnode() {
    local NODE_INDEX=$1
    local P2P_PORT=$2
    local P2P_HOST=$3
    local RPC_HTTP_PORT=$4
    local HTTP_HOST=$5
    local RPC_WS_PORT=$6
    local WS_HOST=$7
    local NODE_IP=$8
    local TEMPLATE_FILE
    local OUTPUT_FILE

    TEMPLATE_FILE="$BOOTNODE_TEMPLATE_FILE"

    if [ ! -f "$TEMPLATE_FILE" ]; then
        echo "Template file '$TEMPLATE_FILE' not found."
        exit 1
    fi

    # Read template and replace placeholders
    DOCKER_COMPOSE_CONTENT=$(<"$TEMPLATE_FILE")

    echo "Debug: NODE_INDEX=$NODE_INDEX, P2P_PORT=$P2P_PORT, P2P_HOST=$P2P_HOST, RPC_HTTP_PORT=$RPC_HTTP_PORT, HTTP_HOST=$HTTP_HOST, RPC_WS_PORT=$RPC_WS_PORT, WS_HOST=$WS_HOST, IP= $NODE_IP"

    DOCKER_COMPOSE_CONTENT=$(echo "$DOCKER_COMPOSE_CONTENT" |
        sed "s/NODE_INDEX/$NODE_INDEX/g" |
        sed "s/P2P_PORT/$P2P_PORT/g" |
        sed "s/P2P_HOST/$P2P_HOST/g" |
        sed "s/RPC_HTTP_PORT/$RPC_HTTP_PORT/g" |
        sed "s/HTTP_HOST/$HTTP_HOST/g" |
        sed "s/RPC_WS_PORT/$RPC_WS_PORT/g" |
        sed "s/WS_HOST/$WS_HOST/g" |
        sed "s/NODE_IP/$NODE_IP/g")

    # Ensure Node directory exists
    NODE_DIR="$CONTAINERS_DIR/Node-$NODE_INDEX"
    mkdir -p "$NODE_DIR"

    echo "Debug: Node directory '$NODE_DIR' created at $(pwd)"

    # Save to Node's directory
    OUTPUT_FILE="$NODE_DIR/docker-compose.yml"
    echo "$DOCKER_COMPOSE_CONTENT" >"$OUTPUT_FILE"

    echo "Docker Compose file generated for Node-$NODE_INDEX at '$OUTPUT_FILE'."
}

start_bootnode() {
    NODE_DIR=$BOOTNODE_DIR
    NODE_INDEX=$BOOTNODE_INDEX
    P2P_PORT=$BOOTNODE_P2P_PORT
    P2P_HOST=$BOOTNODE_P2P_HOST
    RPC_HTTP_PORT=$BOOTNODE_RPC_HTTP_PORT
    HTTP_HOST=$BOOTNODE_HTTP_HOST
    RPC_WS_PORT=$BOOTNODE_RPC_WS_PORT
    WS_HOST=$BOOTNODE_WS_HOST
    NODE_IP=$BOOTNODE_IP
    NETWORK_SUBNET=$SUBNET

    # Generate Docker Compose file for bootnode
    generate_docker_compose_bootnode 1 $P2P_PORT $P2P_HOST $RPC_HTTP_PORT $HTTP_HOST $RPC_WS_PORT $WS_HOST $NODE_IP

    echo "Starting Bootnode using Docker Compose..."
    cd "$NODE_DIR" || exit 1

    if ! docker network inspect besu-network >/dev/null 2>&1; then
        echo "Network 'besu-network' does not exist. Creating it..."
        docker network create --subnet=$SUBNET besu-network
    fi

    docker-compose up -d

    echo "Bootnode started. Logs are available in Docker."
}

start_bootnode
