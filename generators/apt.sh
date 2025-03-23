#!/bin/bash
apt-cache pkgnames | jq -R -s -c 'split("\n")[:-1]'