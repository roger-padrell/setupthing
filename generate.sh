#!/bin/bash
# Check if generator exists
generators=("apt" "flathub" "dnf")
string=$1
found=false
for item in "${generators[@]}"; do
    if [[ "$item" == "$string" ]]; then
        found=true
        break
    fi
done

# Run or not
if $found; then
    # Remove previous data
    rm -rf data/$1.json

    # Generate
    echo "Generating data for '$1'..."
    bash generators/$1.sh >> data/$1.json
    echo "Data generated for '$1' at data/$1.json"
else
    echo "Generator '$1' does not exist"
fi