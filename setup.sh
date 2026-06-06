#!/bin/bash

echo "HOST_PATH=$(pwd)" > .env
echo "Set up complete. Set HOST_PATH to $(pwd)"

echo "Creating images..."
docker compose --profile "*" build

echo "Creating containers..."
docker compose up -d

echo
echo "Setup complete!"
echo

echo "Access the website from another device at http://$(hostname -I | awk '{print $1}'):3000"