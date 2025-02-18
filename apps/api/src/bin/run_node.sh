run_node() {
    NODE_DIR="$BASE_DIR/$NET_ID/Node-$NODE_INDEX"
    NETWORK_SUBNET=$SUBNET

    echo "Starting Node-$NODE_INDEX using Docker Compose..."
    cd "$NODE_DIR" || exit 1

    if ! docker network inspect $NET_ID >/dev/null 2>&1; then
        echo "Network $NET_ID does not exist. Creating it..."
        docker network create --subnet=$SUBNET $NET_ID
    fi

    docker-compose up -d

    echo "Node-$NODE_INDEX started. Logs are available in Docker."
}

run_node