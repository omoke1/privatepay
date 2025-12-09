#!/bin/bash
set -e
export PATH="$HOME/.avm/bin:$HOME/.local/share/solana/install/active_release/bin:$HOME/.cargo/bin:$PATH"

cd /mnt/c/Users/enliven/Desktop/Private-Pay/solana

echo "=== Starting Arcium Build ==="
echo "Current directory: $(pwd)"
echo "Arcium version: $(arcium --version)"
echo ""

arcium build 2>&1

echo ""
echo "=== Build Complete ==="
ls -la target/deploy/ 2>/dev/null || echo "No deploy artifacts found"

