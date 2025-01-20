
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

get_enode_url
