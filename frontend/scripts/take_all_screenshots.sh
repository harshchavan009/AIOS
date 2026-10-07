#!/usr/bin/env bash
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
DIR="/Users/harsh/.gemini/antigravity-ide/brain/913cabf9-8fbf-407a-9dc2-b9f359b787f2/screenshots"
mkdir -p "$DIR"

PAGES=(
  "agents:http://localhost:5173/agents"
  "visual_builder:http://localhost:5173/agent-builder"
  "prompt_studio:http://localhost:5173/prompt-studio"
  "playground:http://localhost:5173/playground"
  "graph_rag:http://localhost:5173/graph-rag"
  "second_brain:http://localhost:5173/second-brain"
  "evaluation:http://localhost:5173/evaluation"
  "analytics:http://localhost:5173/analytics"
  "models:http://localhost:5173/models"
  "settings:http://localhost:5173/settings"
)

for item in "${PAGES[@]}"; do
  NAME="${item%%:*}"
  URL="${item#*:}"
  echo "Capturing $NAME (desktop)..."
  "$CHROME" --headless --disable-gpu --window-size=1440,900 --screenshot="$DIR/${NAME}_desktop.png" "$URL" 2>/dev/null
  echo "Capturing $NAME (mobile)..."
  "$CHROME" --headless --disable-gpu --window-size=390,844 --screenshot="$DIR/${NAME}_mobile.png" "$URL" 2>/dev/null
done

echo "Done capturing all pages!"
