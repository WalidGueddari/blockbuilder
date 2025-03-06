distribute_tessera_config() {
    echo "Distributing Tessera configuration to node directories..."
    echo "NUM_NODES is set to: $NUM_NODES"

    # Ensure NUM_NODES and TEMPLATE_DIR are set.
    if [ -z "$NUM_NODES" ] || [ -z "$TEMPLATE_DIR" ]; then
        echo "Error: NUM_NODES and TEMPLATE_DIR must be set."
        return 1
    fi

    # Loop through each node from 1 to NUM_NODES.
    for ((i = 1; i <= NUM_NODES; i++)); do
        src_file="${TEMPLATE_DIR}/tessera-${i}.conf"
        NODE_DIR="$BASE_DIR/$NET_ID/Node-$i/Tessera"
        dest_file="${NODE_DIR}/tessera.conf"

        # Check if source file exists
        if [ ! -f "$src_file" ]; then
            echo "Warning: ${src_file} not found. Skipping node${i}."
            continue
        fi

        # Copy and rename the config file.
        cp "$src_file" "$dest_file"
        echo "Copied ${src_file} to ${dest_file}"
    done
}
distribute_tessera_config
