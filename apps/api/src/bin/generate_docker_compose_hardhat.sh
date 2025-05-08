generate_docker_compose_hardhat() {
    local TEMPLATE_FILE
    local OUTPUT_FILE

    set -x # turn on shell trace
    TEMPLATE_FILE="$HARDHAT_TEMPLATE_FILE"
    echo "TEMPLATE_FILE=$TEMPLATE_FILE"
    if [ ! -f "$TEMPLATE_FILE" ]; then
        echo >&2 "❌ Template not found at $TEMPLATE_FILE"
        exit 1
    fi

    # show first few lines of the template
    echo "---- head of template ----"
    head -n 5 "$TEMPLATE_FILE"
    echo "--------------------------"

    # Read template and replace placeholders
    DOCKER_COMPOSE_CONTENT=$(<"$TEMPLATE_FILE")

    echo "Debug: HARDHAT_DOCKE_IMAGE=$HARDHAT_DOCKE_IMAGE, NET_ID=$NET_ID, DNS_PLACEHOLDER=$DNS_PLACEHOLDER, PRIVATE_KEY=$PRIVATE_KEY DOCKER_USER=$DOCKER_USER, HARDHAT_CONTAINER_NAME=$HARDHAT_CONTAINER_NAME, DNS_PLACEHOLDER=$DNS_PLACEHOLDER"

    # Replace placeholders with actual values
    DOCKER_COMPOSE_CONTENT=$(
        echo "$DOCKER_COMPOSE_CONTENT" |
            sed "s/HARDHAT_CONTAINER_NAME/$HARDHAT_CONTAINER_NAME/g" |
            sed "s/DOCKER_USER/$DOCKER_USER/g" |
            sed "s/NET_ID/$NET_ID/g" |
            sed "s/DNS_PLACEHOLDER/$DNS_PLACEHOLDER/g" |
            sed "s/PRIVATE_KEY_PLACEHOLDER/$PRIVATE_KEY/g"
    )

    NODE_DIR="$BASE_DIR/$NET_ID/hardhat"
    # Save to Node's directory
    OUTPUT_FILE="$NODE_DIR/docker-compose.yml"
    echo "$DOCKER_COMPOSE_CONTENT" >"$OUTPUT_FILE"

    echo "---- preview of DOCKER_COMPOSE_CONTENT ----"
    echo "$DOCKER_COMPOSE_CONTENT" | head -n 10
    echo "-------------------------------------------"

    echo "Hardhat Docker Compose file generated for $NET_ID at '$OUTPUT_FILE'."
    echo "RPC URL set to: $DNS_PLACEHOLDER"
}

# Execute the generation function with the first node IP as parameter
generate_docker_compose_hardhat
