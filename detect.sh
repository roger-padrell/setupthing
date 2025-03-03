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

# Display results
if [ ${#detected[@]} -eq 0 ]; then
    echo "No common package managers detected!"
else
    echo "Detected package managers:"
    for pm in "${detected[@]}"; do
        echo "  - $pm"
    done
    echo -e "\nNote: Some might require sudo or additional setup to work properly."
fi