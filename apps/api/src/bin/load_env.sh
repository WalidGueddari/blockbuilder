load_env() {
  if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
  else
    echo ".env file not found. Please create one in the project root directory."
    exit 1
  fi

  if [ -z "$BASE_DIR" ]; then
    echo "BASE_DIR is not set in .env file."
    exit 1
  fi
}