# Runtime course-document bucket (Phase 3 / Oski chat)
# Separate from BDA compile bucket in us-west-2.
#
#   source documents/runtime-docs-env.sh
#   npm run publish-docs

export AWS_PROFILE="${AWS_PROFILE:-oatutor-docs}"
export COURSE_DOCS_RUNTIME_BUCKET="${COURSE_DOCS_RUNTIME_BUCKET:-oatutor-runtime-course-docs}"
export COURSE_DOCS_RUNTIME_REGION="${COURSE_DOCS_RUNTIME_REGION:-us-west-1}"
export COURSE_DOCS_RUNTIME_PREFIX="${COURSE_DOCS_RUNTIME_PREFIX:-documents}"
export COURSE_DOCS_CACHE_TTL_MS="${COURSE_DOCS_CACHE_TTL_MS:-300000}"
