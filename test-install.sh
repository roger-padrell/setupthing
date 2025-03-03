#!/bin/bash

detected=("apt")
available=("apt")
installed=0

for pm in "${available[@]}"; do
    if [ "$installed" -eq 0 ]; then
        if printf '%s\n' "${detected[@]}" | grep -Fxq "$pm"; then
            if [[ "$pm" = "apt" ]]; then
                sudo apt install "hello"
                installed=1
            fi
        fi
    fi
done