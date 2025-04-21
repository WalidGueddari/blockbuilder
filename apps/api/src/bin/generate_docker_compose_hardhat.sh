#!/bin/bash

generate_docker_compose_hardhat() {
    local TEMPLATE_FILE
    local OUTPUT_FILE

    TEMPLATE_FILE="$HARDHAT_TEMPLATE_FILE"

    if [ ! -f "$TEMPLATE_FILE" ]; then
        echo "Template file '$TEMPLATE_FILE' not found."
        exit 1
    fi

    # Check for required environment variables
    if [ -z "$PRIVATE_KEY" ]; then
        echo "Error: PRIVATE_KEY environment variable is not set"
        exit 1
    fi

    if [ -z "$NET_ID" ]; then
        echo "Error: NET_ID environment variable is not set"
        exit 1
    fi

    # Get the first node's IP address
    FIRST_NODE_IP=$(docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' "${NET_ID}-node-1")
    if [ -z "$FIRST_NODE_IP" ]; then
        echo "Error: Could not get IP address of first node"
        exit 1
    fi

    # Set the RPC URL to point to the first node
    LOCAL_RPC_URL="http://${FIRST_NODE_IP}:8545"

    # Read template and replace placeholders
    DOCKER_COMPOSE_CONTENT=$(<"$TEMPLATE_FILE")

    # Replace placeholders with actual values
    DOCKER_COMPOSE_CONTENT=$(echo "$DOCKER_COMPOSE_CONTENT" |
        sed "s/\${NET_ID}/$NET_ID/g" |
        sed "s/\${LOCAL_RPC_URL}/$LOCAL_RPC_URL/g" |
        sed "s/\${PRIVATE_KEY}/$PRIVATE_KEY/g"
    )

    # Ensure Node directory exists
    NODE_DIR="$BASE_DIR/$NET_ID"
    mkdir -p "$NODE_DIR"

    # Save to Node's directory
    OUTPUT_FILE="$NODE_DIR/docker-compose.hardhat.yml"
    echo "$DOCKER_COMPOSE_CONTENT" > "$OUTPUT_FILE"

    echo "Hardhat Docker Compose file generated for $NET_ID at '$OUTPUT_FILE'."
    echo "RPC URL set to: $LOCAL_RPC_URL"
}

# Execute the generation function
generate_docker_compose_hardhat 