# Function to start Node-1 and extract the enode URL
start_bootnode() {
  NODE_DIR="Node-1"
  LOG_FILE="node-1.log"

  echo "Starting Node-1 from directory: $NODE_DIR"

  # Navigate to Node-1 directory
  cd "$NODE_DIR" || {
    echo "Failed to navigate to $NODE_DIR"
    exit 1
  }

  # Run the Besu command to start Node-1 in detached mode and save logs
  besu --data-path=data \
    --genesis-file=../genesis.json \
    --rpc-http-enabled \
    --rpc-ws-enabled \
    --rpc-http-api=ETH,NET,QBFT \
    --host-allowlist="*" \
    --rpc-http-cors-origins="all" \
    --p2p-host=0.0.0.0 \
    --rpc-ws-host=0.0.0.0 \
    --rpc-http-host=0.0.0.0 \
    --profile=ENTERPRISE >"$LOG_FILE" 2>&1 &

  # Check if the command was successful
  if [ $? -eq 0 ]; then
    echo "Node-1 started successfully. Logs are being saved to '$LOG_FILE'."
  else
    echo "Failed to start Node-1. Please check your configuration."
    exit 1
  fi
}

# Function to retrieve the enode URL from the log file
get_enode_url() {
  LOG_FILE="node-1.log"
  MAX_RETRIES=30  # Maximum number of attempts
  RETRY_DELAY=5   # Delay in seconds between retries

  for ((i = 1; i <= MAX_RETRIES; i++)); do
    # Extract only the Enode URL, ignoring other log text
    ENODE_URL=$(grep -oP 'enode://[a-fA-F0-9]{128}@[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+:[0-9]+' "$LOG_FILE")

    if [[ -n "$ENODE_URL" ]]; then
      echo "$ENODE_URL"
      return 0
    fi

    echo "Attempt $i/$MAX_RETRIES: Enode URL not found yet. Retrying in $RETRY_DELAY seconds..."
    sleep "$RETRY_DELAY"
  done

  echo "Failed to fetch Enode URL after $MAX_RETRIES attempts."
    return 1  # Failure after retries
}

# Function to start the other nodes with unique P2P ports
start_other_nodes() {
  START_NODE=2  # Start from Node-2
  ENODE_URL=$(get_enode_url)  # Get the ENODE URL from another function
  END_NODE=$NUM_NODES
  P2P_PORT=30304  # Start with port 30304
  RPC_HTTP_PORT=8547  # Starting HTTP RPC port
  RPC_WS_PORT=8548  # Starting WebSocket RPC port

  echo "waiting for the ENODE URL: $ENODE_URL"
  for ((i = START_NODE; i <= END_NODE; i++)); do
    NODE_DIR="Node-$i"
    LOG_FILE="node-$i.log"

    echo "Starting Node-$i with P2P port $P2P_PORT..."

    # Run the Besu command for the node with incremented RPC ports
    besu --data-path="../$NODE_DIR/data" \
      --genesis-file=../genesis.json \
      --bootnodes="$ENODE_URL" \
      --p2p-port="$P2P_PORT" \
      --rpc-http-enabled \
      --rpc-ws-enabled \
      --rpc-http-api=ETH,NET,QBFT \
      --host-allowlist="*" \
      --rpc-http-cors-origins="all" \
      --rpc-http-port="$RPC_HTTP_PORT" \
      --rpc-ws-port="$RPC_WS_PORT" \
      --profile=ENTERPRISE >"../Node-$i/$LOG_FILE" 2>&1 &

    if [ $? -eq 0 ]; then
      echo "Node-$i started successfully on P2P port $P2P_PORT. WS port $RPC_WS_PORT. HTTP port $RPC_HTTP_PORT"
    else
      echo "Failed to start Node-$i. Please check your configuration."
      exit 1
    fi

    # Increment the P2P port and RPC ports for the next node
    ((P2P_PORT++))
    ((RPC_HTTP_PORT+=2)) 
    ((RPC_WS_PORT+=2))  
  done
}