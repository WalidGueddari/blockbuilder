get_node_logs() {
    
    docker logs -f node-$NODE_INDEX
}

get_node_logs
