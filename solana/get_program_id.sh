#!/bin/bash
export PATH="$HOME/.avm/bin:$HOME/.local/share/solana/install/active_release/bin:$HOME/.cargo/bin:$PATH"

KEYPAIR="/mnt/c/Users/enliven/Desktop/Private-Pay/solana/target/deploy/private_pay-keypair.json"

if [ -f "$KEYPAIR" ]; then
    ADDR=$(solana address -k "$KEYPAIR")
    echo "Program ID: $ADDR"
else
    echo "Keypair not found, creating new one..."
    mkdir -p /mnt/c/Users/enliven/Desktop/Private-Pay/solana/target/deploy
    solana-keygen new -o "$KEYPAIR" --no-bip39-passphrase --force
    ADDR=$(solana address -k "$KEYPAIR")
    echo "New Program ID: $ADDR"
fi

