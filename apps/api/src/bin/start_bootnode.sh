start_bootnode() {
    NODE_DIR="$BASE_DIR/$NET_ID/Node-$NODE_INDEX"
    NETWORK_SUBNET=$SUBNET

    echo "Starting Node-$i using Docker Compose..."
    cd "$NODE_DIR" || exit 1

    if ! docker network inspect $NET_ID >/dev/null 2>&1; then
        echo "Network $NET_ID does not exist. Creating it..."
        docker network create --subnet=$SUBNET $NET_ID
    fi

    docker-compose up -d

    echo "Node-$i started. Logs are available in Docker."
}

start_bootnode
