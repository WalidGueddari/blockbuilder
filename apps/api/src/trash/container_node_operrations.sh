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
    NODE_DIR="Node-$NODE_INDEX"
    mkdir -p "$NODE_DIR"

    # Save to Node's directory
    OUTPUT_FILE="$NODE_DIR/docker-compose.yml"
    echo "$DOCKER_COMPOSE_CONTENT" >"$OUTPUT_FILE"

    echo "Docker Compose file generated for Node-$NODE_INDEX at '$OUTPUT_FILE'."
}

generate_docker_compose_node() {
     local NODE_INDEX=$1
    local P2P_PORT=$2
    local P2P_HOST=$3
    local RPC_HTTP_PORT=$4
    local HTTP_HOST=$5
    local RPC_WS_PORT=$6
    local WS_HOST=$7
    local NODE_IP=$8
    local ENODE_URL=$9
    local TEMPLATE_FILE
    local OUTPUT_FILE

    TEMPLATE_FILE="$NODE_TEMPLATE_FILE"

    if [ ! -f "$TEMPLATE_FILE" ]; then
        echo "Template file '$TEMPLATE_FILE' not found."
        exit 1
    fi

    # Read template and replace placeholders
    DOCKER_COMPOSE_CONTENT=$(<"$TEMPLATE_FILE")

    echo "Debug: NODE_INDEX=$NODE_INDEX, P2P_PORT=$P2P_PORT, P2P_HOST=$P2P_HOST, RPC_HTTP_PORT=$RPC_HTTP_PORT, HTTP_HOST=$HTTP_HOST, RPC_WS_PORT=$RPC_WS_PORT, WS_HOST=$WS_HOST, IP= $NODE_IP, ENODE_URL=$ENODE_URL"

    DOCKER_COMPOSE_CONTENT=$(echo "$DOCKER_COMPOSE_CONTENT" |
        sed "s/NODE_INDEX/$NODE_INDEX/g" |
        sed "s/P2P_PORT/$P2P_PORT/g" |
        sed "s/P2P_HOST/$P2P_HOST/g" |
        sed "s/RPC_HTTP_PORT/$RPC_HTTP_PORT/g" |
        sed "s/HTTP_HOST/$HTTP_HOST/g" |
        sed "s/RPC_WS_PORT/$RPC_WS_PORT/g" |
        sed "s/WS_HOST/$WS_HOST/g" |
        sed "s/NODE_IP/$NODE_IP/g" |
        sed "s|ENODE_URL|$ENODE_URL|g")

    # Ensure Node directory exists
    NODE_DIR="Node-$NODE_INDEX"

    # Save to Node's directory
    OUTPUT_FILE="../$NODE_DIR/docker-compose.yml"
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

get_enode_url() {
    BOOTNODE_CONTAINER_NAME=$BOOTNODE_CONTAINER_NAME # Container name for Node-1 (bootnode)
    MAX_RETRIES=$MAX_RETRIES                         # Maximum number of attempts
    RETRY_DELAY=$RETRY_DELAY                         # Delay in seconds between retries

    for ((i = 1; i <= MAX_RETRIES; i++)); do
        # Wait for the node to start and then get the enode URL from logs
        ENODE_URL=$(docker logs $BOOTNODE_CONTAINER_NAME 2>/dev/null | grep -oP "enode://[a-fA-F0-9]{128}@[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+:[0-9]+" | head -n 1)

        if [[ -n "$ENODE_URL" ]]; then
            ENODE_URL_UPDATED=$(echo "$ENODE_URL" | sed "s/0\.0\.0\.0/$BOOTNODE_IP/")
            echo "$ENODE_URL_UPDATED"
            return 0
        fi

        echo "Attempt $i/$MAX_RETRIES: Enode URL not found yet. Retrying in $RETRY_DELAY seconds..."
        sleep "$RETRY_DELAY"
    done

    echo "Failed to fetch Enode URL after $MAX_RETRIES attempts."
    return 1 # Failure after retries
}

start_node() {
    INDEX=2
    END_NODE=$NUM_NODES
    P2P_PORT=$NODE_P2P_PORT
    P2P_HOST=$NODE_P2P_HOST
    RPC_HTTP_PORT=$NODE_RPC_HTTP_PORT
    HTTP_HOST=$NODE_HTTP_HOST
    RPC_WS_PORT=$NODE_RPC_WS_PORT
    WS_HOST=$NODE_WS_HOST
    BASE_NODE_IP="192.168.1."  # Base IP to increment

    ENODE_URL=$(get_enode_url)

    # Check if the ENODE_URL was retrieved successfully
    if [[ -z "$ENODE_URL" ]]; then
        echo "Failed to retrieve enode URL. Exiting..."
        return 1
    fi

    for ((i = INDEX; i <= END_NODE; i++)); do
        NODE_DIR="Node-$i"

        # Calculate the IP for the current node
        NODE_IP="${BASE_NODE_IP}$((100 + i - 1))"  # Increment the last octet for each node

        echo "Debug: Node-$i"
        echo "NODE_INDEX=$i, P2P_PORT=$P2P_PORT, RPC_HTTP_PORT=$RPC_HTTP_PORT, RPC_WS_PORT=$RPC_WS_PORT, NODE_IP=$NODE_IP, ENODE_URL=$ENODE_URL"

        # Generate Docker Compose file for the node
        generate_docker_compose_node $i $P2P_PORT $P2P_HOST $RPC_HTTP_PORT $HTTP_HOST $RPC_WS_PORT $WS_HOST $NODE_IP "$ENODE_URL"

        # Start the node using Docker Compose
        echo "Starting Node-$i using Docker Compose..."
        # Display the current working directory
        cd ../Node-$i
        echo "Current working directory: $(pwd)"
        docker-compose up -d
        cd - || exit 1

        echo "Node-$i started. Logs are available in Docker."

        # Increment ports for the next node
        ((P2P_PORT++))
        ((RPC_HTTP_PORT += 2))
        ((RPC_WS_PORT += 2))
    done
}
