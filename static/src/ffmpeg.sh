#!/bin/bash

# List of common package managers to check
package_managers=(
    apt        # Debian/Ubuntu
    dnf        # Fedora
    yum        # Older Fedora/RHEL
    pacman     # Arch/Manjaro
    zypper     # openSUSE
    snap       # Snap packages
    flatpak    # Flatpak
    emerge     # Gentoo
    apk        # Alpine
    pkg        # FreeBSD (rare on Linux)
    brew       # Linuxbrew
    nix-env    # Nix
    rpm        # RPM-based (low-level)
    dpkg       # Debian-based (low-level)
)

detected=()

# Check each package manager
for pm in "${package_managers[@]}"; do
    if command -v "$pm" &> /dev/null; then
        detected+=("$pm")
    fi
done
# Installing ffmpeg
available=("apt" "dnf" "pacman" "brew")
installed=0

for pm in "${available[@]}"; do
    if [ "$installed" -eq 0 ]; then
        if printf '%s
' "${detected[@]}" | grep -Fxq "$pm"; then
            if [[ "$pm" = "apt" ]]; then
                sudo apt install ffmpeg
                installed=1
            fi
            if [[ "$pm" = "dnf" ]]; then
                sudo dnf install ffmpeg
                installed=1
            fi
            if [[ "$pm" = "pacman" ]]; then
                sudo pacman -S ffmpeg
                installed=1
            fi
            if [[ "$pm" = "brew" ]]; then
                brew install ffmpeg
                installed=1
            fi
        fi
    fi
done
# Finished installing ffmpeg