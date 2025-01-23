start_node() {
    INDEX=2
    END_NODE=$NUM_NODES

    for ((i = INDEX; i <= END_NODE; i++)); do
        NODE_DIR="Node-$i"
        # Start the node using Docker Compose
        echo "Starting Node-$i using Docker Compose..."
        # Display the current working directory
        cd ../Node-$i
        echo "Current working directory: $(pwd)"
        docker-compose up -d
        cd - || exit 1

        echo "Node-$i started. Logs are available in Docker."
    done
}

start_node
