#!/usr/bin/env sh
set -eu
cd "$(dirname "$0")"
printf '%s\n' 'Abre http://127.0.0.1:8080 en tu navegador.'
python3 -m http.server 8080 --bind 127.0.0.1 --directory app/dist
