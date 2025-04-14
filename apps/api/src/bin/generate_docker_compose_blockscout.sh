
generate_docker_compose_blockscout() {
    local TEMPLATE_FILE
    local OUTPUT_FILE

    TEMPLATE_FILE="$BLOCKSCOUT_TEMPLATE_FILE"

    if [ ! -f "$TEMPLATE_FILE" ]; then
        echo "Template file '$TEMPLATE_FILE' not found."
        exit 1
    fi

    # Read template and replace placeholders
    DOCKER_COMPOSE_CONTENT=$(<"$TEMPLATE_FILE")

    echo "Debug:   NET_ID=$NET_ID, CHAINID_PlACEHOLDER=$CHAINID_PlACEHOLDER, DNS_PLACEHOLDER=$DNS_PLACEHOLDER"

    DOCKER_COMPOSE_CONTENT=$(echo "$DOCKER_COMPOSE_CONTENT" |
        sed "s/NET_ID/$NET_ID/g" |
        sed "s/CHAINID_PlACEHOLDER/$CHAINID_PlACEHOLDER/g" |
        sed "s/DNS_PLACEHOLDER/$DNS_PLACEHOLDER/g" 
    )

    # Ensure Node directory exists
    NODE_DIR="$BASE_DIR/blockscout-$NET_ID"
    mkdir -p "$NODE_DIR"

    # Save to Node's directory
    OUTPUT_FILE="$NODE_DIR/docker-compose.yml"
    echo "$DOCKER_COMPOSE_CONTENT" >"$OUTPUT_FILE"

    echo "Blockscout Docker Compose file generated for $NET_ID at '$OUTPUT_FILE'."
}

generate_docker_compose_blockscout
