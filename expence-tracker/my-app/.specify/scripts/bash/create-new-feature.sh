#!/bin/bash

# Feature Branch and Spec Creation Script
# Usage: create-new-feature.sh --number N --short-name "name" "description" [--json]

set -e

# Parse arguments
NUMBER=""
SHORT_NAME=""
DESCRIPTION=""
JSON_OUTPUT=false

while [[ $# -gt 0 ]]; do
  case $1 in
    --number)
      NUMBER="$2"
      shift 2
      ;;
    --short-name)
      SHORT_NAME="$2"
      shift 2
      ;;
    --json)
      JSON_OUTPUT=true
      shift
      ;;
    *)
      DESCRIPTION="$1"
      shift
      ;;
  esac
done

# Validate required arguments
if [[ -z "$NUMBER" || -z "$SHORT_NAME" || -z "$DESCRIPTION" ]]; then
  echo "Error: --number, --short-name, and description are required"
  echo "Usage: create-new-feature.sh --number N --short-name \"name\" \"description\" [--json]"
  exit 1
fi

# Construct branch name and feature name
BRANCH_NAME="${NUMBER}-${SHORT_NAME}"
FEATURE_NAME="${NUMBER}-${SHORT_NAME}"

# Create specs directory structure
SPEC_DIR="specs/${FEATURE_NAME}"
mkdir -p "${SPEC_DIR}/checklists"

# Create branch
git checkout -b "${BRANCH_NAME}" 2>/dev/null || git checkout "${BRANCH_NAME}"

# Initialize spec file from template
SPEC_FILE="${SPEC_DIR}/spec.md"
if [[ ! -f "$SPEC_FILE" ]]; then
  if [[ -f ".specify/templates/spec-template.md" ]]; then
    cp ".specify/templates/spec-template.md" "$SPEC_FILE"
  else
    # Create minimal spec file if template doesn't exist
    cat > "$SPEC_FILE" << 'EOF'
# Feature Specification: [FEATURE_NAME]

**Status:** draft
**Version:** 0.1.0
**Created:** [DATE_ISO]
**Last Updated:** [DATE_ISO]
**Owner:** [OWNER]

---

## Overview

### Problem Statement

[Describe the problem this feature solves]

### Proposed Solution

[High-level description of the solution]

### User Benefit

[Clear statement of value delivered to users]
EOF
  fi
fi

# Output result
if [[ "$JSON_OUTPUT" == true ]]; then
  echo "{\"branch_name\": \"$BRANCH_NAME\", \"feature_name\": \"$FEATURE_NAME\", \"spec_file\": \"$SPEC_FILE\", \"spec_dir\": \"$SPEC_DIR\"}"
else
  echo "Feature initialized:"
  echo "  Branch: $BRANCH_NAME"
  echo "  Feature: $FEATURE_NAME"
  echo "  Spec File: $SPEC_FILE"
  echo "  Spec Dir: $SPEC_DIR"
fi
