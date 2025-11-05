#!/bin/bash

# PHR Creation Script
# Usage: create-phr.sh --title "Title" --stage <stage> [--feature <name>] [--json]

set -e

# Parse arguments
TITLE=""
STAGE=""
FEATURE="none"
JSON_OUTPUT=false

while [[ $# -gt 0 ]]; do
  case $1 in
    --title)
      TITLE="$2"
      shift 2
      ;;
    --stage)
      STAGE="$2"
      shift 2
      ;;
    --feature)
      FEATURE="$2"
      shift 2
      ;;
    --json)
      JSON_OUTPUT=true
      shift
      ;;
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
done

# Validate required arguments
if [[ -z "$TITLE" || -z "$STAGE" ]]; then
  echo "Error: --title and --stage are required"
  echo "Usage: create-phr.sh --title \"Title\" --stage <stage> [--feature <name>] [--json]"
  exit 1
fi

# Validate stage
VALID_STAGES=("constitution" "spec" "plan" "tasks" "red" "green" "refactor" "explainer" "misc" "general")
if [[ ! " ${VALID_STAGES[@]} " =~ " ${STAGE} " ]]; then
  echo "Error: Invalid stage. Must be one of: ${VALID_STAGES[*]}"
  exit 1
fi

# Determine route based on stage
if [[ "$STAGE" == "constitution" ]]; then
  ROUTE="history/prompts/constitution"
elif [[ "$STAGE" == "general" ]]; then
  ROUTE="history/prompts/general"
else
  # Feature stages require feature name
  if [[ "$FEATURE" == "none" ]]; then
    echo "Error: Feature stages require --feature argument"
    exit 1
  fi
  ROUTE="history/prompts/$FEATURE"
fi

# Create route directory if it doesn't exist
mkdir -p "$ROUTE"

# Generate ID (find highest existing ID and increment)
HIGHEST_ID=0
for file in "$ROUTE"/*.md 2>/dev/null; do
  if [[ -f "$file" ]]; then
    FILENAME=$(basename "$file")
    ID=$(echo "$FILENAME" | grep -oP '^\d+' || echo "0")
    if [[ $ID -gt $HIGHEST_ID ]]; then
      HIGHEST_ID=$ID
    fi
  fi
done
NEW_ID=$((HIGHEST_ID + 1))

# Create slug from title
SLUG=$(echo "$TITLE" | tr '[:upper:]' '[:lower:]' | tr ' ' '-' | tr -cd '[:alnum:]-')

# Determine file extension based on stage
if [[ "$STAGE" == "constitution" ]]; then
  EXT="constitution.prompt.md"
elif [[ "$STAGE" == "general" ]]; then
  EXT="general.prompt.md"
else
  EXT="${STAGE}.prompt.md"
fi

# Generate filename
FILENAME="${NEW_ID}-${SLUG}.${EXT}"
FILEPATH="$ROUTE/$FILENAME"

# Get current date
DATE_ISO=$(date +%Y-%m-%d)

# Get git branch
BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")

# Get current user
USER=$(git config user.name 2>/dev/null || echo "unknown")

# Read template
TEMPLATE_PATH=".specify/templates/phr-template.prompt.md"
if [[ ! -f "$TEMPLATE_PATH" ]]; then
  TEMPLATE_PATH="templates/phr-template.prompt.md"
fi

if [[ ! -f "$TEMPLATE_PATH" ]]; then
  echo "Error: PHR template not found at $TEMPLATE_PATH"
  exit 1
fi

# Copy template to new file
cp "$TEMPLATE_PATH" "$FILEPATH"

# Replace basic placeholders
sed -i "s/\[ID\]/$NEW_ID/g" "$FILEPATH"
sed -i "s/\[TITLE\]/$TITLE/g" "$FILEPATH"
sed -i "s/\[STAGE\]/$STAGE/g" "$FILEPATH"
sed -i "s/\[DATE_ISO\]/$DATE_ISO/g" "$FILEPATH"
sed -i "s/\[FEATURE\]/$FEATURE/g" "$FILEPATH"
sed -i "s/\[BRANCH\]/$BRANCH/g" "$FILEPATH"
sed -i "s/\[USER\]/$USER/g" "$FILEPATH"

# Output result
if [[ "$JSON_OUTPUT" == true ]]; then
  echo "{\"id\": $NEW_ID, \"path\": \"$FILEPATH\", \"stage\": \"$STAGE\", \"title\": \"$TITLE\"}"
else
  echo "PHR created:"
  echo "  ID: $NEW_ID"
  echo "  Path: $FILEPATH"
  echo "  Stage: $STAGE"
  echo "  Title: $TITLE"
fi
