#!/usr/bin/env zsh
# dev.sh — mata procesos en 8081 y arranca Metro limpio

echo "→ Matando procesos en puerto 8081..."
fuser -k 8081/tcp 2>/dev/null
pkill -f "expo start" 2>/dev/null
pkill -f "metro" 2>/dev/null
sleep 1

echo "→ Iniciando Metro..."
export ANDROID_HOME=/home/ergrato-dev/Android/Sdk
export ANDROID_SDK_ROOT=/home/ergrato-dev/Android/Sdk
export PATH="$PATH:$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator"

pnpm expo start --port 8081
