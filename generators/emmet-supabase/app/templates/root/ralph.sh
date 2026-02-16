#!/bin/bash
# Ralph Wiggum - Long-running AI agent loop
# Usage: ./ralph.sh [max_iterations]

set -euo pipefail

MAX_ITERATIONS=${1:-10}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

PRD_FILE="$SCRIPT_DIR/prd.json"
PROGRESS_FILE="$SCRIPT_DIR/progress.txt"
ARCHIVE_DIR="$SCRIPT_DIR/archive"
LAST_BRANCH_FILE="$SCRIPT_DIR/.last-branch"

mkdir -p "$ARCHIVE_DIR"

# ------------------------------------------------------------
# Archive previous run if branch changed
# ------------------------------------------------------------
if [[ -f "$PRD_FILE" && -f "$LAST_BRANCH_FILE" ]]; then
  CURRENT_BRANCH=$(jq -r '.branchName // empty' "$PRD_FILE" 2>/dev/null || true)
  LAST_BRANCH=$(cat "$LAST_BRANCH_FILE" 2>/dev/null || true)

  if [[ -n "$CURRENT_BRANCH" && -n "$LAST_BRANCH" && "$CURRENT_BRANCH" != "$LAST_BRANCH" ]]; then
    DATE=$(date +%Y-%m-%d)
    FOLDER_NAME="${LAST_BRANCH#ralph/}"
    ARCHIVE_FOLDER="$ARCHIVE_DIR/$DATE-$FOLDER_NAME"

    echo "Archiving previous run: $LAST_BRANCH"
    mkdir -p "$ARCHIVE_FOLDER"

    [[ -f "$PRD_FILE" ]] && cp "$PRD_FILE" "$ARCHIVE_FOLDER/"
    [[ -f "$PROGRESS_FILE" ]] && cp "$PROGRESS_FILE" "$ARCHIVE_FOLDER/"

    echo "Archived to: $ARCHIVE_FOLDER"

    echo "# Ralph Progress Log" > "$PROGRESS_FILE"
    echo "Started: $(date)" >> "$PROGRESS_FILE"
    echo "---" >> "$PROGRESS_FILE"
  fi
fi

# ------------------------------------------------------------
# Track current branch
# ------------------------------------------------------------
if [[ -f "$PRD_FILE" ]]; then
  CURRENT_BRANCH=$(jq -r '.branchName // empty' "$PRD_FILE" 2>/dev/null || true)
  [[ -n "$CURRENT_BRANCH" ]] && echo "$CURRENT_BRANCH" > "$LAST_BRANCH_FILE"
fi

# ------------------------------------------------------------
# Init progress file
# ------------------------------------------------------------
if [[ ! -f "$PROGRESS_FILE" ]]; then
  echo "# Ralph Progress Log" > "$PROGRESS_FILE"
  echo "Started: $(date)" >> "$PROGRESS_FILE"
  echo "---" >> "$PROGRESS_FILE"
fi

echo "Starting Ralph – Max iterations: $MAX_ITERATIONS"

# ------------------------------------------------------------
# Main Ralph loop
# ------------------------------------------------------------
for i in $(seq 1 "$MAX_ITERATIONS"); do
  echo
  echo "═══════════════════════════════════════════════════════"
  echo "  Ralph Iteration $i of $MAX_ITERATIONS"
  echo "═══════════════════════════════════════════════════════"

  echo
  echo ">>> Running Claude at $(date)"
  echo ">>> Iteration $i" >> "$PROGRESS_FILE"

  TMP_OUTPUT=$(mktemp)

  # ---- Run Claude safely -----------------
  CLAUDE_SKIP=false
  while true; do
    if cat "$SCRIPT_DIR/prompt.md" \
       | claude --dangerously-skip-permissions 2>&1 \
       | tee "$TMP_OUTPUT" | tee -a "$PROGRESS_FILE"; then
      # Success, break out of the retry loop
      break
    else
      # Check if this is a "No messages returned" transient error - just skip iteration
      if grep -q "No messages returned" "$TMP_OUTPUT" 2>/dev/null; then
        echo
        echo "⚠️ Claude returned no messages (transient). Skipping iteration..."
        CLAUDE_SKIP=true
        break
      fi
      # Non-zero exit code: probably spending limit reached
      echo
      echo "⚠️ Claude exited with an error. Possibly spending limit reached."
      echo "Waiting 5 minutes before retry..."
      sleep 300  # 5 minutes
    fi
  done
  if [[ "$CLAUDE_SKIP" == "true" ]]; then
    continue
  fi

  OUTPUT=$(cat "$TMP_OUTPUT")
  rm "$TMP_OUTPUT"

  if [[ -z "$OUTPUT" ]]; then
    echo "⚠️ Claude returned no output. Retrying in 1 minutes..."
    sleep 60
    continue  # retry
  fi

  # ---- Completion check -----------------------------------
  if echo "$OUTPUT" | grep -q "<promise>COMPLETE</promise>"; then
    echo
    echo "🎉 Ralph completed all tasks!"
    echo "Completed at iteration $i of $MAX_ITERATIONS"

    echo
    echo "Completed: $(date)" >> "$PROGRESS_FILE"
    exit 0
  fi

  # ---- No tasks available check ---------------------------
  if echo "$OUTPUT" | grep -q "<promise>NO_TASKS</promise>"; then
    echo
    echo "⏳ No tasks available. Waiting 30 seconds before next check..."
    sleep 30
    continue
  fi

  echo
  echo "Iteration $i complete. Continuing..."
  sleep 2
done

echo
echo "⚠️ Ralph reached max iterations ($MAX_ITERATIONS) without completing all tasks."
echo "Check $PROGRESS_FILE for status."
exit 1
