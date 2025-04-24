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

    if [ -z "$DNS_PLACEHOLDER" ]; then
        echo "Error: DNS_PLACEHOLDER parameter is required"
        exit 1
    fi

    # Read template and replace placeholders
    DOCKER_COMPOSE_CONTENT=$(<"$TEMPLATE_FILE")

    # Replace placeholders with actual values
    DOCKER_COMPOSE_CONTENT=$(echo "$DOCKER_COMPOSE_CONTENT" |
        sed "s/\${HARDHAT_DOCKE_IMAGE}/$HARDHAT_DOCKE_IMAGE/g" |
        sed "s/\${NET_ID}/$NET_ID/g" |
        sed "s/\${DNS_PLACEHOLDER}/$DNS_PLACEHOLDER/g" |
        sed "s/\${PRIVATE_KEY}/$PRIVATE_KEY/g"
    )

    NODE_DIR="$BASE_DIR/$NET_ID"
    # Save to Node's directory
    OUTPUT_FILE="$NODE_DIR/hardhat/docker-compose.yml"
    echo "$DOCKER_COMPOSE_CONTENT" > "$OUTPUT_FILE"

    echo "Hardhat Docker Compose file generated for $NET_ID at '$OUTPUT_FILE'."
    echo "RPC URL set to: $LOCAL_RPC_URL"
}

# Execute the generation function with the first node IP as parameter
generate_docker_compose_hardhat