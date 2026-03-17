#!/bin/sh
set -e

# Explicitly set hostname to listen on all interfaces
export HOSTNAME=0.0.0.0
export PORT=3000

# Start Next.js server
exec node server.js
