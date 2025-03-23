#!/bin/bash

# Install flatpak if needed
command -v flatpak >/dev/null || (sudo apt update 2>/dev/null && sudo apt install -y flatpak 2>/dev/null || sudo dnf install -y flatpak 2>/dev/null || sudo pacman -S --noconfirm flatpak 2>/dev/null || sudo zypper -n install flatpak 2>/dev/null)

# Check if Flathub system remote exists
flathub_exists=$(flatpak remotes --columns=name | grep -x "flathub")

if [ -z "$flathub_exists" ]; then
    flatpak remote-add --if-not-exists flathub https://dl.flathub.org/repo/flathub.flatpakrepo
fi

# Read available packages and save to flathub.json
flatpak remote-ls flathub --columns=app | awk -F. '{print $NF " " $0}' | jq -R -n 'reduce inputs as $line ({}; . + { ($line | split(" ")[0]): ($line | split(" ")[1] ) })'