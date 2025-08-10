#!/bin/bash

SCRIPT_DIRECTORY=$( cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd -P )
PLATFORM_REPO_DIR="$SCRIPT_DIRECTORY/../.."

# assuming this tools is located in src/tools
CONTENT_REPO_DIR="$SCRIPT_DIRECTORY/../../../oats-content"
CONTENT_DIR_NAME="OpenStax Content"
CONFIG_FILES=("bktParams.json" "coursePlans.json" "skillModel.json")

PREPROCESS_OUT_FILE="${PLATFORM_REPO_DIR}/logs/updateContent-$(date +%Y-%m-%d_%H-%M-%S).log"

DO_UPDATE=true

while [[ "$#" -gt 0 ]]; do
    case $1 in
    -c | --content-repo-dir)
        CONTENT_REPO_DIR="$2"
        shift
        ;;
    -o | --preprocess-out)
        PREPROCESS_OUT_FILE="$2"
        shift
        ;;
    # do not update content tooling repository
    -n | --no-update) DO_UPDATE=false ;;
    *)
        echo "Unknown parameter passed: $1"
        exit 1
        ;;
    esac
    shift
done

if [ ! -d `dirname ${PREPROCESS_OUT_FILE}` ]; then
    mkdir -p `dirname ${PREPROCESS_OUT_FILE}`
fi

cd "${CONTENT_REPO_DIR}" 2> /dev/null || \
    { echo "Could not access the content tools repository directory: $CONTENT_REPO_DIR, exiting early.."; exit; }

if [ ! -d "$CONTENT_DIR_NAME" ]; then
    echo "$CONTENT_DIR_NAME sub directory does not exist in the content tools repository."
    exit
fi

if [[ "$DO_UPDATE" = true ]]; then
    git remote update
    git reset --hard origin/main
    git pull
fi

if [ ! -d "$CONTENT_DIR_NAME" ]; then
    echo "$CONTENT_DIR_NAME sub directory does not exist in the content tools repository."
    exit
fi

cd "${PLATFORM_REPO_DIR}" || exit
echo "Removing existing ProblemPool from the platform repository: ${PLATFORM_REPO_DIR}"

rm -rf src/content-sources/oatutor/content-pool

echo "Copying over new ProblemPool from ${CONTENT_REPO_DIR}/${CONTENT_DIR_NAME} to ${PLATFORM_REPO_DIR}"

cp -a "${CONTENT_REPO_DIR}/${CONTENT_DIR_NAME}" src/content-sources/oatutor/content-pool

echo "Copying over new Config Files"

cd "${CONTENT_REPO_DIR}" || exit

for FILE in "${CONFIG_FILES[@]}"; do
    cp "$FILE" "${PLATFORM_REPO_DIR}/src/content-sources/oatutor"
done

cd "${PLATFORM_REPO_DIR}" || exit

# replace old bkt-params with newly generated ones
rm src/content-sources/oatutor/bkt-params/*.json
mv src/content-sources/oatutor/bktParams.json src/content-sources/oatutor/bkt-params/bktParams1.json
cp src/content-sources/oatutor/bkt-params/bktParams1.json src/content-sources/oatutor/bkt-params/bktParams2.json

echo "Preprocessing the problem pool..."

cd src/tools || exit
node preprocessProblemPool.js >> "${PREPROCESS_OUT_FILE}" 2>&1

echo "All done. Make sure to increment version in src/config/config.js!"

