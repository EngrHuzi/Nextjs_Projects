#!/bin/bash

# Planning Setup Script
# Usage: setup-plan.sh [--json]

set -e

JSON_OUTPUT=false

while [[ $# -gt 0 ]]; do
  case $1 in
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

# Get current branch
BRANCH=$(git branch --show-current)

# Extract feature name from branch (assumes format: N-feature-name)
FEATURE_NAME=$(echo "$BRANCH" | sed 's/^[0-9]*-//' | sed 's/$//')

# Determine paths
SPECS_DIR="specs/${BRANCH}"
FEATURE_SPEC="${SPECS_DIR}/spec.md"
IMPL_PLAN="${SPECS_DIR}/plan.md"

# Create directory structure if it doesn't exist
mkdir -p "${SPECS_DIR}/contracts"
mkdir -p "${SPECS_DIR}/design"

# Check if spec exists
if [[ ! -f "$FEATURE_SPEC" ]]; then
  echo "Error: Specification not found at $FEATURE_SPEC"
  exit 1
fi

# Copy plan template if plan doesn't exist
if [[ ! -f "$IMPL_PLAN" ]]; then
  if [[ -f ".specify/templates/plan-template.md" ]]; then
    cp ".specify/templates/plan-template.md" "$IMPL_PLAN"
  else
    echo "Error: Plan template not found at .specify/templates/plan-template.md"
    exit 1
  fi
fi

# Output result
if [[ "$JSON_OUTPUT" == true ]]; then
  echo "{\"branch\": \"$BRANCH\", \"feature_name\": \"$FEATURE_NAME\", \"specs_dir\": \"$SPECS_DIR\", \"feature_spec\": \"$FEATURE_SPEC\", \"impl_plan\": \"$IMPL_PLAN\"}"
else
  echo "Planning setup complete:"
  echo "  Branch: $BRANCH"
  echo "  Feature: $FEATURE_NAME"
  echo "  Specs Dir: $SPECS_DIR"
  echo "  Spec File: $FEATURE_SPEC"
  echo "  Plan File: $IMPL_PLAN"
fi
