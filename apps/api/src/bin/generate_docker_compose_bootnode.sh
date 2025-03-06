
generate_docker_compose_bootnode() {
    local TEMPLATE_FILE
    local OUTPUT_FILE

    TEMPLATE_FILE="$BOOTNODE_TEMPLATE_FILE"

    if [ ! -f "$TEMPLATE_FILE" ]; then
        echo "Template file '$TEMPLATE_FILE' not found."
        exit 1
    fi

    # Read template and replace placeholders
    DOCKER_COMPOSE_CONTENT=$(<"$TEMPLATE_FILE")

    echo "Debug: NODE_INDEX=$NODE_INDEX, P2P_PORT=$P2P_PORT, P2P_HOST=$P2P_HOST, RPC_HTTP_PORT=$RPC_HTTP_PORT, HTTP_HOST=$HTTP_HOST, RPC_WS_PORT=$RPC_WS_PORT, WS_HOST=$WS_HOST, NODE_IP=$NODE_IP, NET_ID=$NET_ID, TESS_THIRD_PARTY_PORT=$TESS_THIRD_PARTY_PORT, TESS_Q2T_PORT=$TESS_Q2T_PORT, TESS_P2P=$TESS_P2P, TESS_HEALTH_PORT=$TESS_HEALTH_PORT, TESSERA_IP=$TESSERA_IP"

    DOCKER_COMPOSE_CONTENT=$(echo "$DOCKER_COMPOSE_CONTENT" |
        sed "s/NODE_INDEX/$NODE_INDEX/g" |
        sed "s/P2P_PORT/$P2P_PORT/g" |
        sed "s/P2P_HOST/$P2P_HOST/g" |
        sed "s/RPC_HTTP_PORT/$RPC_HTTP_PORT/g" |
        sed "s/HTTP_HOST/$HTTP_HOST/g" |
        sed "s/RPC_WS_PORT/$RPC_WS_PORT/g" |
        sed "s/WS_HOST/$WS_HOST/g" |
        sed "s/NET_ID/$NET_ID/g" |
        sed "s/NODE_IP/$NODE_IP/g"|
        sed "s/TESS_THIRD_PARTY_PORT/$TESS_THIRD_PARTY_PORT/g"|
        sed "s/TESS_Q2T_PORT/$TESS_Q2T_PORT/g"|
        sed "s/TESS_P2P/$TESS_P2P/g"|
        sed "s/TESS_HEALTH_PORT/$TESS_HEALTH_PORT/g"|
        sed "s/TESSERA_IP/$TESSERA_IP/g")

    # Ensure Node directory exists
    NODE_DIR="$BASE_DIR/$NET_ID/Node-$NODE_INDEX"
    mkdir -p "$NODE_DIR"

    # Save to Node's directory
    OUTPUT_FILE="$NODE_DIR/docker-compose.yml"
    echo "$DOCKER_COMPOSE_CONTENT" >"$OUTPUT_FILE"

    echo "Docker Compose file generated for Node-$NODE_INDEX at '$OUTPUT_FILE'."
}

generate_docker_compose_bootnode
