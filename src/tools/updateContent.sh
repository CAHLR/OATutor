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


git remote update
git reset --hard origin/main
git pull

if [ ! -d "$SUBDIRECTORY" ]; then
  echo "$SUBDIRECTORY sub directory does not exist."
  exit
fi

cd "$CURRENT_PATH" || exit
cd ../..

ROOT_PATH=$(pwd)

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

echo "Generating flattened problem pool."

cd src/tools
node generateFlatProblemPool.js >"$OUT_FILE" 2>&1

echo "Make sure to increment version in OpenITS/src/config/config.js!"
