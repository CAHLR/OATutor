#!/bin/bash

CONTENT_DIR_NAME="oats-content"
SUBDIRECTORY="OpenStax Content"
CURRENT_PATH=$(pwd)

CONFIG_FILES=("bktParams.js" "coursePlans.js" "skillModel.js")

OUT_FILE="$CURRENT_PATH/logs/updateContent-$(date -d "today" +"%Y%m%d%H%M").log"

cd "../../../$CONTENT_DIR_NAME" || (
  echo "Could not access content directory: $CONTENT_DIR_NAME, exiting early.."
  exit
)

CONTENT_PATH=$(pwd)

if [ ! -d "$SUBDIRECTORY" ]; then
  echo "$SUBDIRECTORY sub directory does not exist."
  exit
fi

# https://stackoverflow.com/a/45839167
changed=0
git remote update && git status -uno | grep -q 'Your branch is behind' && changed=1

if [ $changed -eq 1 ]; then
  echo "Content repository is not updated."
  git pull
fi

if [ ! -d "$SUBDIRECTORY" ]; then
  echo "$SUBDIRECTORY sub directory does not exist."
  exit
fi

cd "$CURRENT_PATH" || exit
cd ../..

ROOT_PATH=$(pwd)

if [ -f src/ProblemPool/problemPoolDev.js ]; then
  HAS_DEV_FILE=true
fi

if [ $HAS_DEV_FILE ]; then
  mv src/ProblemPool/problemPoolDev.js src/util/problemPoolDev.js.bak
fi

echo "Removing existing ProblemPool"

rm -rf src/ProblemPool

echo "Copying over new ProblemPool"

cp -a "$CONTENT_PATH/$SUBDIRECTORY" src/ProblemPool

echo "Copying over new Config Files"

cd "$CONTENT_PATH" || exit

for FILE in "${CONFIG_FILES[@]}"; do
  cp "$FILE" "$ROOT_PATH/src/config"
done

cd "$ROOT_PATH" || exit

rm src/config/bktParams/*.js

mv src/config/bktParams.js src/config/bktParams/bktParams1.js

cp src/config/bktParams/bktParams1.js src/config/bktParams/bktParams2.js

if [ $HAS_DEV_FILE ]; then
  mv src/util/problemPoolDev.js.bak src/ProblemPool/problemPoolDev.js
fi

echo "Generating new index files"

node src/util/indexGenerator.js >"$OUT_FILE" 2>&1

echo "Make sure to increment version in OpenITS/src/config/config.js!"
